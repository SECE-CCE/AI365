import { compressImage } from './compressImage';

/**
 * Compress an image or process document before upload
 * @param file File object selected by user
 * @returns Promise resolving to { base64: string, extension: string }
 */
export async function compressDocument(file: File): Promise<{ base64: string; extension: string }> {
  const isImage = file.type.startsWith('image/');
  const extension = file.name.split('.').pop() || (isImage ? 'jpg' : 'pdf');

  if (isImage) {
    // Compress certificate image with high resolution (max 1200x1200, 75% quality for crisp text)
    const compressedDataUrl = await compressImage(file, 1200, 1200, 0.75);
    return {
      base64: compressedDataUrl,
      extension: 'jpg',
    };
  }

  // Non-image files (e.g. PDF) read as Data URL directly
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({
          base64: reader.result,
          extension,
        });
      } else {
        reject(new Error('Failed to read file.'));
      }
    };
    reader.onerror = (err) => reject(err);
  });
}
