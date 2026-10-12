/**
 * Client-side document validator.
 * Checks file signatures (magic bytes), MIME type, and size limits.
 * All checks run against actual file content — never just the extension.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Maximum allowed document size in megabytes.
 * Adjust this constant to change the enforced limit across all upload forms.
 */
export const MAX_DOCUMENT_SIZE_MB = 5; // 5 MB

export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

/** Accepted MIME types and their magic-byte signatures. */
const ACCEPTED_SIGNATURES: Array<{
  mime: string;
  label: string;
  magic: number[];   // First N bytes that must match
  offset?: number;   // Byte offset where signature starts (default 0)
}> = [
  { mime: 'application/pdf', label: 'PDF', magic: [0x25, 0x50, 0x44, 0x46] },        // %PDF
  { mime: 'image/jpeg',      label: 'JPEG', magic: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',       label: 'PNG', magic: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/webp',      label: 'WebP', magic: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  { mime: 'image/gif',       label: 'GIF', magic: [0x47, 0x49, 0x46] },              // GIF
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  detectedMime: string | null;
  detectedLabel: string | null;
  fileSize: number;
  fileSizeMb: string;
  exceedsLimit: boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Core validation
// ---------------------------------------------------------------------------

/**
 * Reads the first 12 bytes of a file and matches against known magic signatures.
 */
async function detectMimeFromSignature(file: File): Promise<{ mime: string; label: string } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    // Only need first 12 bytes for signature detection
    const slice = file.slice(0, 12);
    reader.readAsArrayBuffer(slice);
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      for (const sig of ACCEPTED_SIGNATURES) {
        const offset = sig.offset ?? 0;
        const match = sig.magic.every((b, i) => bytes[offset + i] === b);
        if (match) {
          resolve({ mime: sig.mime, label: sig.label });
          return;
        }
      }
      resolve(null);
    };
    reader.onerror = () => resolve(null);
  });
}

/**
 * Validates a file against allowed types, signature integrity, and size limits.
 *
 * @param file       The File selected by the user.
 * @param maxBytes   Override the global size limit (optional).
 * @returns          A ValidationResult describing pass/fail and all error messages.
 */
export async function validateDocument(
  file: File,
  maxBytes: number = MAX_DOCUMENT_SIZE_BYTES
): Promise<ValidationResult> {
  const errors: string[] = [];
  const fileSize = file.size;
  const fileSizeMb = (fileSize / (1024 * 1024)).toFixed(2);
  let detectedMime: string | null = null;
  let detectedLabel: string | null = null;

  // 1. Reject empty files
  if (fileSize === 0) {
    errors.push('The selected file is empty (0 bytes). Please choose a valid document.');
    return { valid: false, detectedMime, detectedLabel, fileSize, fileSizeMb, exceedsLimit: false, errors };
  }

  // 2. Reject files > 50 MB regardless of limit (safety cap)
  if (fileSize > 50 * 1024 * 1024) {
    errors.push(`File is too large (${fileSizeMb} MB). Maximum allowed is 50 MB.`);
    return { valid: false, detectedMime, detectedLabel, fileSize, fileSizeMb, exceedsLimit: true, errors };
  }

  // 3. Magic-byte signature check
  const detected = await detectMimeFromSignature(file);
  if (!detected) {
    errors.push(
      'Unsupported file type. Only PDF documents and images (JPEG, PNG, WebP, GIF) are accepted. ' +
      'Make sure the file is not corrupted or renamed from a different format.'
    );
    return { valid: false, detectedMime: null, detectedLabel: null, fileSize, fileSizeMb, exceedsLimit: false, errors };
  }

  detectedMime = detected.mime;
  detectedLabel = detected.label;

  // 4. Basic PDF integrity: must start with %PDF and have content
  if (detected.mime === 'application/pdf') {
    if (fileSize < 100) {
      errors.push('The PDF file appears to be corrupted or incomplete (too small).');
    }
  }

  // 5. Size-limit enforcement
  const exceedsLimit = fileSize > maxBytes;

  return {
    valid: errors.length === 0,
    detectedMime,
    detectedLabel,
    fileSize,
    fileSizeMb,
    exceedsLimit,
    errors,
  };
}

// ---------------------------------------------------------------------------
// SHA-256 checksum (browser-native)
// ---------------------------------------------------------------------------

/**
 * Computes a SHA-256 hex digest of a File using the browser's SubtleCrypto API.
 */
export async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Size formatting helpers
// ---------------------------------------------------------------------------

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function sizeSavingPercent(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.round(((original - compressed) / original) * 100);
}
