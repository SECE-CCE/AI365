import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { formatBytes, sizeSavingPercent } from './documentValidator';

// Initialize PDF.js worker in browser environment
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      pdfWorkerUrl ||
      new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

export interface CompressionResult {
  success: boolean;
  base64: string; // full data-URL
  extension: string; // 'jpg' | 'pdf'
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: number;
  originalSizeLabel: string;
  compressedSizeLabel: string;
  method: string;
  withinLimit: boolean;
  limitBytes: number;
}

export type ProgressCallback = (message: string) => void;

/**
 * Compress an image using canvas, trying progressively lower quality settings
 * until the output fits within `limitBytes`.
 */
export async function compressImageToLimit(
  file: File,
  limitBytes: number
): Promise<CompressionResult> {
  const originalSize = file.size;

  const resolutions = [0, 1600, 1200, 900, 720, 480]; // 0 = keep original dimensions
  const qualities = [0.8, 0.65, 0.5, 0.35];

  let bestDataUrl = '';
  let bestSize = originalSize;

  for (const maxDim of resolutions) {
    for (const quality of qualities) {
      const dataUrl = await _runCanvasCompression(file, maxDim, quality);
      const approxBytes = _base64SizeBytes(dataUrl);

      if (approxBytes < bestSize) {
        bestSize = approxBytes;
        bestDataUrl = dataUrl;
      }

      if (approxBytes <= limitBytes) {
        // Found a version that satisfies the limit → stop immediately
        return _buildImageResult(
          file,
          bestDataUrl,
          originalSize,
          approxBytes,
          limitBytes,
          maxDim,
          quality
        );
      }
    }
  }

  // None of the attempts brought it within the limit
  const finalSize = bestSize;
  return {
    success: false,
    base64: bestDataUrl || (await _readAsDataUrl(file)),
    extension: 'jpg',
    originalSize,
    compressedSize: finalSize,
    savedBytes: Math.max(0, originalSize - finalSize),
    savedPercent: sizeSavingPercent(originalSize, finalSize),
    originalSizeLabel: formatBytes(originalSize),
    compressedSizeLabel: formatBytes(finalSize),
    method: `Canvas compression (all levels, best: ${formatBytes(finalSize)})`,
    withinLimit: false,
    limitBytes,
  };
}

/**
 * Compresses a PDF in the browser by re-rendering each page to a canvas and
 * rebuilding an optimized PDF using pdf-lib. This reduces multi-megabyte scanned
 * or high-DPI PDFs (e.g. 8 MB) down to under the configured limit (e.g. 2 MB)
 * directly on the client side without server roundtrips.
 */
export async function compressPdfToLimit(
  file: File,
  limitBytes: number,
  onProgress?: ProgressCallback
): Promise<CompressionResult> {
  const originalSize = file.size;

  onProgress?.('Reading PDF…');
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  // Target budget per page (leaving 15% margin for PDF container overhead)
  const targetBytesPerPage = Math.floor((limitBytes * 0.85) / Math.max(1, totalPages));

  interface Preset {
    scale: number;
    quality: number;
    maxDim: number;
    label: string;
  }

  const allPresets: Preset[] = [
    { scale: 1.8, quality: 0.78, maxDim: 1800, label: 'High' },
    { scale: 1.4, quality: 0.68, maxDim: 1400, label: 'Balanced' },
    { scale: 1.1, quality: 0.55, maxDim: 1100, label: 'Compact' },
    { scale: 0.85, quality: 0.42, maxDim: 850, label: 'Aggressive' },
    { scale: 0.7, quality: 0.32, maxDim: 700, label: 'Maximum' },
  ];

  // Pick intelligent starting preset based on per-page budget
  let startIdx = 0;
  if (targetBytesPerPage < 120 * 1024) {
    startIdx = 2; // Compact
  } else if (targetBytesPerPage < 300 * 1024) {
    startIdx = 1; // Balanced
  }

  const presetsToTry = allPresets.slice(startIdx);

  let bestPdfBytes: Uint8Array | null = null;
  let bestSize = originalSize;
  let bestPreset = presetsToTry[0];

  for (let attempt = 0; attempt < presetsToTry.length; attempt++) {
    const preset = presetsToTry[attempt];
    onProgress?.(`Compressing PDF (preset: ${preset.label})…`);

    const newPdfDoc = await PDFDocument.create();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onProgress?.(
        `Optimizing page ${pageNum}/${totalPages} (${preset.label} quality)…`
      );
      const page = await pdf.getPage(pageNum);
      const { jpgBytes, widthPt, heightPt } = await _renderPageToJpg(
        page,
        preset.scale,
        preset.quality,
        preset.maxDim
      );

      const embeddedJpg = await newPdfDoc.embedJpg(jpgBytes);
      const newPage = newPdfDoc.addPage([widthPt, heightPt]);
      newPage.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: widthPt,
        height: heightPt,
      });
    }

    const compressedPdfBytes = await newPdfDoc.save();
    const currentSize = compressedPdfBytes.byteLength;

    if (currentSize < bestSize) {
      bestSize = currentSize;
      bestPdfBytes = compressedPdfBytes;
      bestPreset = preset;
    }

    if (currentSize <= limitBytes) {
      // Succeeded and fits within limit!
      const base64 = `data:application/pdf;base64,${_uint8ArrayToBase64(compressedPdfBytes)}`;
      return {
        success: true,
        base64,
        extension: 'pdf',
        originalSize,
        compressedSize: currentSize,
        savedBytes: Math.max(0, originalSize - currentSize),
        savedPercent: sizeSavingPercent(originalSize, currentSize),
        originalSizeLabel: formatBytes(originalSize),
        compressedSizeLabel: formatBytes(currentSize),
        method: `In-browser PDF compression (${totalPages} page${totalPages > 1 ? 's' : ''}, ${preset.label})`,
        withinLimit: true,
        limitBytes,
      };
    }
  }

  // If still above limit after all presets, return the best outcome
  const finalBytes = bestPdfBytes ?? new Uint8Array(arrayBuffer);
  const finalSize = bestSize;
  const base64 = `data:application/pdf;base64,${_uint8ArrayToBase64(finalBytes)}`;

  return {
    success: finalSize <= limitBytes,
    base64,
    extension: 'pdf',
    originalSize,
    compressedSize: finalSize,
    savedBytes: Math.max(0, originalSize - finalSize),
    savedPercent: sizeSavingPercent(originalSize, finalSize),
    originalSizeLabel: formatBytes(originalSize),
    compressedSizeLabel: formatBytes(finalSize),
    method: `In-browser PDF (${totalPages} pages, ${bestPreset.label})`,
    withinLimit: finalSize <= limitBytes,
    limitBytes,
  };
}

/**
 * Universal document compressor that automatically detects whether the file is a PDF
 * or an image and applies the appropriate in-browser optimization strategy.
 */
export async function compressDocumentToLimit(
  file: File,
  limitBytes: number,
  onProgress?: ProgressCallback
): Promise<CompressionResult> {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    return compressPdfToLimit(file, limitBytes, onProgress);
  }
  return compressImageToLimit(file, limitBytes);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function _renderPageToJpg(
  page: any,
  scale: number,
  quality: number,
  maxDimension: number
): Promise<{ jpgBytes: Uint8Array; widthPt: number; heightPt: number }> {
  const unscaledViewport = page.getViewport({ scale: 1.0 });
  const widthPt = unscaledViewport.width;
  const heightPt = unscaledViewport.height;

  let finalScale = scale;
  const maxDim = Math.max(widthPt, heightPt);
  if (maxDim * finalScale > maxDimension) {
    finalScale = maxDimension / maxDim;
  }

  const viewport = page.getViewport({ scale: finalScale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  // Fill with solid white background to avoid transparent PDF issues
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
  );

  if (!blob) throw new Error('Failed to convert canvas to JPEG');
  const buffer = await blob.arrayBuffer();
  return {
    jpgBytes: new Uint8Array(buffer),
    widthPt,
    heightPt,
  };
}

function _uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const CHUNK = 0x8000;
  for (let i = 0; i < len; i += CHUNK) {
    const slice = bytes.subarray(i, Math.min(i + CHUNK, len));
    binary += String.fromCharCode.apply(null, slice as unknown as number[]);
  }
  return btoa(binary);
}

function _buildImageResult(
  file: File,
  dataUrl: string,
  originalSize: number,
  compressedSize: number,
  limitBytes: number,
  maxDim: number,
  quality: number
): CompressionResult {
  return {
    success: true,
    base64: dataUrl,
    extension: 'jpg',
    originalSize,
    compressedSize,
    savedBytes: Math.max(0, originalSize - compressedSize),
    savedPercent: sizeSavingPercent(originalSize, compressedSize),
    originalSizeLabel: formatBytes(originalSize),
    compressedSizeLabel: formatBytes(compressedSize),
    method: `Canvas JPEG (${maxDim > 0 ? `max ${maxDim}px` : 'original dims'}, q=${quality})`,
    withinLimit: true,
    limitBytes,
  };
}

function _runCanvasCompression(
  file: File,
  maxDim: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (evt) => {
      const img = new Image();
      img.src = evt.target?.result as string;
      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (maxDim > 0) {
          const scale = Math.min(1, maxDim / Math.max(w, h));
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

function _base64SizeBytes(dataUrl: string): number {
  const base64Part = dataUrl.split(',')[1] ?? '';
  const padding = base64Part.endsWith('==') ? 2 : base64Part.endsWith('=') ? 1 : 0;
  return Math.floor((base64Part.length * 3) / 4) - padding;
}

function _readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
  });
}
