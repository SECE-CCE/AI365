import { compressImage } from './compressImage';

/**
 * Compress an image or process document before upload
 * @param file File object selected by user
 * @returns Promise resolving to { base64: string, extension: string, compressed: boolean }
 */
export async function compressDocument(file: File): Promise<{ base64: string; extension: string; compressed: boolean }> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const extension = isPdf ? 'pdf' : (file.name.split('.').pop() || 'jpg');

  if (isImage) {
    // Compress certificate image with high resolution (max 1200x1200, 75% quality for crisp text)
    const compressedDataUrl = await compressImage(file, 1200, 1200, 0.75);
    return {
      base64: compressedDataUrl,
      extension: isPdf ? 'pdf' : 'jpg',
      compressed: true,
    };
  }

  // PDF documents read as Data URL directly for storing in user document folder
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({
          base64: reader.result,
          extension,
          compressed: true,
        });
      } else {
        reject(new Error('Failed to read PDF file.'));
      }
    };
    reader.onerror = (err) => reject(err);
  });
}

