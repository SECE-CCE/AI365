/**
 * Centralized Server-Side Validation Module
 * 
 * Provides consistent validation logic for:
 * - SECE email domain restrictions (@sece.ac.in)
 * - Parameter bounds (IDs, numbers, ranges, pagination, negative check)
 * - File uploads (.pdf, .doc, .docx, MIME types, file size limits)
 * - GitHub repository URLs
 * - Research paper monthly submission boundaries
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates SECE College Email (@sece.ac.in)
 */
export function isValidSeceEmail(email: any): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  
  // Basic email structure regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@sece\.ac\.in$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates positive database ID
 */
export function isValidId(id: any): boolean {
  if (id === undefined || id === null || id === '') return false;
  const num = Number(id);
  return !isNaN(num) && Number.isInteger(num) && num > 0 && num <= 2147483647;
}

/**
 * Validates numeric values within bounds
 */
export function isValidNumber(
  val: any,
  options: { min?: number; max?: number; allowFloat?: boolean; integerOnly?: boolean } = {}
): boolean {
  if (val === undefined || val === null || val === '') return false;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return false;

  if (options.integerOnly && !Number.isInteger(num)) return false;
  if (options.min !== undefined && num < options.min) return false;
  if (options.max !== undefined && num > options.max) return false;

  return true;
}

/**
 * Validates pagination parameters (page, limit, offset)
 */
export function isValidPagination(query: any): ValidationResult {
  const { page, limit, offset } = query || {};

  if (page !== undefined) {
    const pageNum = Number(page);
    if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum < 1) {
      return { valid: false, error: 'Pagination parameter "page" must be a positive integer greater than or equal to 1.' };
    }
  }

  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      return { valid: false, error: 'Pagination parameter "limit" must be an integer between 1 and 100.' };
    }
  }

  if (offset !== undefined) {
    const offsetNum = Number(offset);
    if (isNaN(offsetNum) || !Number.isInteger(offsetNum) || offsetNum < 0) {
      return { valid: false, error: 'Pagination parameter "offset" must be a non-negative integer.' };
    }
  }

  return { valid: true };
}

/**
 * Validates ISO / Calendar Date format (YYYY-MM-DD)
 */
export function isValidDate(dateStr: any): boolean {
  if (typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  
  // YYYY-MM-DD pattern
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!dateRegex.test(trimmed)) return false;

  const [yearStr, monthStr, dayStr] = trimmed.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (year < 2000 || year > 2100) return false;

  // Verify actual calendar date (e.g. Feb 31 invalid)
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/**
 * Validates Research Paper Monthly Boundary
 * - Accepts valid date format YYYY-MM-DD or YYYY-MM
 * - Checks start of month (e.g. 01), end of month (e.g. 28/29/30/31)
 * - Verifies month transitions: Jan -> Feb, Feb -> Mar, Dec -> Jan
 * - Ensures date is not in future and within acceptable program history
 */
export function isValidMonthlyResearchBoundary(dateVal: any): ValidationResult {
  if (!dateVal || typeof dateVal !== 'string') {
    return { valid: false, error: 'Research paper submission date is required in YYYY-MM-DD or YYYY-MM format.' };
  }

  const trimmed = dateVal.trim();
  let year: number;
  let month: number;
  let day: number = 1;

  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(trimmed)) {
    const parts = trimmed.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
  } else if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(trimmed)) {
    const parts = trimmed.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);

    // Check calendar valid date
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
      return { valid: false, error: `Invalid calendar date "${trimmed}".` };
    }
  } else {
    return { valid: false, error: 'Invalid date format. Must be YYYY-MM-DD or YYYY-MM.' };
  }

  // Monthly boundary limits
  if (year < 2020 || year > 2100) {
    return { valid: false, error: `Year ${year} is outside valid submission boundaries (2020-2100).` };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Cannot submit for future months
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return { valid: false, error: 'Research paper submission date cannot be in a future month.' };
  }

  // Calculate month start and end dates
  const monthEnd = new Date(year, month, 0); // Last day of month

  if (day < 1 || day > monthEnd.getDate()) {
    return { valid: false, error: `Day ${day} is outside valid month boundary (1 to ${monthEnd.getDate()}).` };
  }

  return {
    valid: true,
  };
}

/**
 * Validates document uploads (.pdf, .doc, .docx)
 * Enforces extensions, MIME types, and file size limits (default 10MB)
 */
export function isValidDocumentFile(
  filenameOrExt: string,
  mimeTypeOrBase64?: string,
  sizeBytes?: number,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10 MB
): ValidationResult {
  if (!filenameOrExt || typeof filenameOrExt !== 'string') {
    return { valid: false, error: 'Filename or file extension is required.' };
  }

  // Extract clean extension
  const ext = filenameOrExt.includes('.')
    ? filenameOrExt.split('.').pop()!.toLowerCase()
    : filenameOrExt.toLowerCase().replace(/^\./, '');

  const allowedExtensions = ['pdf', 'doc', 'docx'];
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `Unsupported file extension .${ext}. Only .pdf, .doc, and .docx files are permitted.` };
  }

  // Prevent double extension / null byte bypasses
  if (filenameOrExt.includes('\0') || (filenameOrExt.includes('.') && filenameOrExt.split('.').length > 2)) {
    const extParts = filenameOrExt.split('.');
    const finalExt = extParts[extParts.length - 1].toLowerCase();
    const secondLastExt = extParts[extParts.length - 2].toLowerCase();
    if (['exe', 'js', 'sh', 'bat', 'php', 'py', 'zip'].includes(finalExt) || ['exe', 'js', 'sh', 'bat', 'php', 'py'].includes(secondLastExt)) {
      return { valid: false, error: 'Invalid file extension sequence detected.' };
    }
  }

  // Check file size if provided
  if (sizeBytes !== undefined && sizeBytes !== null) {
    if (sizeBytes <= 0) {
      return { valid: false, error: 'File is empty (0 bytes).' };
    }
    if (sizeBytes > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      return { valid: false, error: `File size exceeds maximum allowed limit of ${maxMb}MB.` };
    }
  }

  // Check MIME type or base64 header if provided
  if (mimeTypeOrBase64 && typeof mimeTypeOrBase64 === 'string') {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream', // Fallback for raw binary doc
    ];

    if (mimeTypeOrBase64.startsWith('data:')) {
      const match = mimeTypeOrBase64.match(/^data:([^;]+);base64,/);
      if (match) {
        const headerMime = match[1].toLowerCase();
        if (!allowedMimeTypes.includes(headerMime) && !headerMime.includes('pdf') && !headerMime.includes('word') && !headerMime.includes('document')) {
          return { valid: false, error: `MIME type "${headerMime}" is not allowed. Only PDF, DOC, and DOCX files are permitted.` };
        }
      }
    } else if (!mimeTypeOrBase64.includes('/') && !allowedMimeTypes.includes(mimeTypeOrBase64.toLowerCase())) {
      if (!mimeTypeOrBase64.toLowerCase().includes('pdf') && !mimeTypeOrBase64.toLowerCase().includes('word') && !mimeTypeOrBase64.toLowerCase().includes('document')) {
        return { valid: false, error: `MIME type "${mimeTypeOrBase64}" is not permitted.` };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates GitHub repository URLs
 * Example valid URLs:
 * - https://github.com/username/repository
 * - https://github.com/username/repository.git
 * - https://github.com/username/repository/tree/main
 */
export function isValidGithubUrl(url: any): boolean {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\/.*)?$/;
  return githubRegex.test(trimmed);
}
