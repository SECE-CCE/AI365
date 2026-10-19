import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';

const router = Router();

// BASE DIRECTORY LOCATION FOR USER STORAGE INSIDE ASSETS
export const UPLOADS_BASE_DIR = path.join(process.cwd(), 'assets', 'Documents');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract Drive file ID from common sharing URL formats:
 *  - https://drive.google.com/file/d/<ID>/view
 *  - https://drive.google.com/open?id=<ID>
 *  - https://docs.google.com/document/d/<ID>/…
 */
function extractDriveFileId(url: string): string | null {
  // /file/d/<ID>/ or /d/<ID>/
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (fileMatch) return fileMatch[1];
  // ?id=<ID>
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idMatch) return idMatch[1];
  return null;
}

/**
 * SSRF guard: only allow requests to drive.google.com and docs.google.com.
 */
function isSafeDriveUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'drive.google.com' ||
        parsed.hostname === 'docs.google.com' ||
        parsed.hostname === 'drive.usercontent.google.com')
    );
  } catch {
    return false;
  }
}



// GET /api/upload/file/:id
// Serves files stored directly inside Neon PostgreSQL (100% compatible with Vercel and local dev)
router.get('/file/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return res.status(400).send('Invalid file ID');

    const file = await db.getUploadedFileById(id);
    if (!file || !file.file_data) {
      return res.status(404).send('File not found in Neon DB');
    }

    const matches = file.file_data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).send('Corrupted file data in Neon DB');
    }

    const mimeType = matches[1] || file.mime_type || 'application/octet-stream';
    const buffer = Buffer.from(matches[2], 'base64');

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.file_name)}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(buffer);
  } catch (err: any) {
    console.error('Neon DB File Serve Error:', err);
    return res.status(500).send('Failed to retrieve file from Neon DB');
  }
});

// GET /api/upload/poster
router.get('/poster', (_req: Request, res: Response) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'The /api/upload/poster endpoint only accepts HTTP POST requests with poster image data.',
  });
});

// POST /api/upload/poster
// Handles event banner poster image upload, saves to Neon DB, and caches locally if writable.
router.post('/poster', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, title = 'Event_Poster' } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Poster image data is required.' });
    }

    const sanitizedTitle = String(title).trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'Poster';
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `${sanitizedTitle}_${Date.now()}.jpg`;
    const fullDataUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${base64Data}`;

    // 1. Store in Neon DB
    const saved = await db.saveUploadedFile({
      file_name: filename,
      mime_type: 'image/jpeg',
      file_size: buffer.length,
      file_data: fullDataUrl,
      user_id: req.user?.id || null,
      category: 'poster',
    });

    const posterUrl = `/api/upload/file/${saved.id}`;
    await db.updateUploadedFileUrl(saved.id, posterUrl);

    // 2. Optional local filesystem backup
    try {
      const eventsFolder = path.join(process.cwd(), 'assets', 'Events');
      if (!fs.existsSync(eventsFolder)) {
        fs.mkdirSync(eventsFolder, { recursive: true });
      }
      const filePath = path.join(eventsFolder, filename);
      fs.writeFileSync(filePath, buffer);
    } catch {
      // Ignored in read-only serverless environments
    }

    return res.json({
      url: posterUrl,
      fileId: saved.id,
      filename,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Poster Upload Error:', err);
    return res.status(500).json({ error: 'Failed to save event poster image in Neon DB.' });
  }
});

// GET /api/upload/photo
router.get('/photo', (_req: Request, res: Response) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'The /api/upload/photo endpoint only accepts HTTP POST requests with photo image data.',
  });
});

// POST /api/upload/photo
// Handles compressed photo upload, saves directly into Neon DB, and caches locally if writable.
router.post('/photo', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Compressed image data is required.' });
    }

    const userName = req.user?.full_name || 'User';
    const sanitizedUserName = userName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'User';
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const photoFilename = `${sanitizedUserName}_Profile.jpg`;
    const fullDataUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${base64Data}`;

    // 1. Store directly into Neon DB
    const saved = await db.saveUploadedFile({
      file_name: photoFilename,
      mime_type: 'image/jpeg',
      file_size: buffer.length,
      file_data: fullDataUrl,
      user_id: req.user?.id || null,
      category: 'photo',
    });

    const photoUrl = `/api/upload/file/${saved.id}`;
    await db.updateUploadedFileUrl(saved.id, photoUrl);

    // 2. Optional local filesystem backup
    try {
      const photosFolder = path.join(UPLOADS_BASE_DIR, sanitizedUserName, 'photos');
      if (!fs.existsSync(photosFolder)) {
        fs.mkdirSync(photosFolder, { recursive: true });
      }
      const filePath = path.join(photosFolder, photoFilename);
      fs.writeFileSync(filePath, buffer);
    } catch {
      // Ignored in read-only serverless environments
    }

    return res.json({
      url: photoUrl,
      fileId: saved.id,
      filename: photoFilename,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Photo Upload Error:', err);
    return res.status(500).json({ error: 'Failed to save compressed profile photo in Neon DB.' });
  }
});

// GET /api/upload/certificate - returns informative 405 Method Not Allowed
router.get('/certificate', (_req: Request, res: Response) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'The /api/upload/certificate endpoint only accepts HTTP POST requests with certificate data (fileBase64, certificateTitle, extension). Direct GET access via the browser address bar is not supported.',
  });
});

// POST /api/upload/certificate
// Handles certificate upload, saves file directly into Neon DB, and caches locally if writable.
router.post('/certificate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileBase64, extension = 'jpg', certificateTitle = 'Certificate' } = req.body;
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ error: 'Certificate file data is required.' });
    }

    const rawTitle = typeof certificateTitle === 'string' ? certificateTitle : 'Certificate';
    const rawExt = typeof extension === 'string' ? extension : 'jpg';

    const userName = req.user?.full_name || 'User';
    const sanitizedUserName = userName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'User';
    const sanitizedTitle = rawTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'Certificate';
    const cleanExt = rawExt.replace(/^\./, '').trim() || 'jpg';
    const mimeType = cleanExt === 'pdf' ? 'application/pdf' : 'image/jpeg';

    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const certificateFilename = `${sanitizedUserName}_${sanitizedTitle}.${cleanExt}`;
    const fullDataUrl = fileBase64.startsWith('data:') ? fileBase64 : `data:${mimeType};base64,${base64Data}`;

    // 1. Save directly into Neon DB (uploaded_files table)
    const saved = await db.saveUploadedFile({
      file_name: certificateFilename,
      mime_type: mimeType,
      file_size: buffer.length,
      file_data: fullDataUrl,
      user_id: req.user?.id || null,
      category: 'certificate',
    });

    const certificateUrl = `/api/upload/file/${saved.id}`;
    await db.updateUploadedFileUrl(saved.id, certificateUrl);

    // 2. Optional local filesystem backup (ignored on read-only environments like Vercel)
    try {
      const certificatesFolder = path.join(UPLOADS_BASE_DIR, sanitizedUserName, 'certificates');
      if (!fs.existsSync(certificatesFolder)) {
        fs.mkdirSync(certificatesFolder, { recursive: true });
      }
      const filePath = path.join(certificatesFolder, certificateFilename);
      fs.writeFileSync(filePath, buffer);
    } catch {
      // Ignored in read-only serverless environments
    }

    return res.json({
      url: certificateUrl,
      fileId: saved.id,
      filename: certificateFilename,
      file_data: fullDataUrl,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Certificate Upload Error:', err);
    return res.status(500).json({
      error: 'Failed to save certificate in Neon DB.',
      details: err?.message || 'Unknown internal error',
    });
  }
});

// GET /api/upload/paper
router.get('/paper', (_req: Request, res: Response) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'The /api/upload/paper endpoint only accepts HTTP POST requests with PDF document data.',
  });
});

// POST /api/upload/paper
// Handles research paper upload in PDF format, saves directly to Neon DB, and caches locally if writable.
router.post('/paper', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileBase64, extension = 'pdf', paperTitle = 'Research_Paper' } = req.body;
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ error: 'Paper PDF file data is required.' });
    }

    const rawTitle = typeof paperTitle === 'string' ? paperTitle : 'Research_Paper';
    const rawExt = typeof extension === 'string' ? extension : 'pdf';

    const userName = req.user?.full_name || 'User';
    const sanitizedUserName = userName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'User';
    const sanitizedTitle = rawTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'Research_Paper';
    const cleanExt = rawExt.replace(/^\./, '').trim() || 'pdf';

    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const paperFilename = `${sanitizedUserName}_${sanitizedTitle}.${cleanExt}`;
    const fullDataUrl = fileBase64.startsWith('data:') ? fileBase64 : `data:application/pdf;base64,${base64Data}`;

    // 1. Save directly into Neon DB (uploaded_files table)
    const saved = await db.saveUploadedFile({
      file_name: paperFilename,
      mime_type: 'application/pdf',
      file_size: buffer.length,
      file_data: fullDataUrl,
      user_id: req.user?.id || null,
      category: 'paper',
    });

    const paperUrl = `/api/upload/file/${saved.id}`;
    await db.updateUploadedFileUrl(saved.id, paperUrl);

    // 2. Optional local filesystem backup
    try {
      const papersFolder = path.join(UPLOADS_BASE_DIR, sanitizedUserName, 'papers');
      if (!fs.existsSync(papersFolder)) {
        fs.mkdirSync(papersFolder, { recursive: true });
      }
      const filePath = path.join(papersFolder, paperFilename);
      fs.writeFileSync(filePath, buffer);
    } catch {
      // Ignored in read-only serverless environments
    }

    return res.json({
      url: paperUrl,
      fileId: saved.id,
      filename: paperFilename,
      file_data: fullDataUrl,
      sizeBytes: buffer.length,
      compressed: true,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Paper Upload Error:', err);
    return res.status(500).json({
      error: 'Failed to save research paper PDF in Neon DB.',
      details: err?.message || 'Unknown internal error',
    });
  }
});

// Validates a Google Drive shareable link and returns it as-is (legacy endpoint — preserved for backward compat).
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { driveLink } = req.body;

    if (!driveLink || typeof driveLink !== 'string') {
      return res.status(400).json({ error: 'A Google Drive shareable link is required.' });
    }

    const trimmed = driveLink.trim();

    if (!trimmed.includes('drive.google.com') && !trimmed.includes('docs.google.com')) {
      return res.status(400).json({ error: 'Only Google Drive links are accepted (drive.google.com).' });
    }

    const fileId = extractDriveFileId(trimmed);
    const viewLink = fileId
      ? `https://drive.google.com/file/d/${fileId}/view`
      : trimmed;

    return res.json({
      url: viewLink,
      filename: 'Google Drive Document',
      uploaded_at: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process Drive link.' });
  }
});

// GET /api/upload/drive-check
router.get('/drive-check', (_req: Request, res: Response) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'The /api/upload/drive-check endpoint only accepts HTTP POST requests with a driveLink parameter.',
  });
});

// POST /api/upload/drive-check
// Real accessibility verification for Google Drive links.
// Returns: { accessible, url, fileId, filename, mimeType, sizeBytes }
// ---------------------------------------------------------------------------
router.post('/drive-check', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { driveLink } = req.body;

    if (!driveLink || typeof driveLink !== 'string') {
      return res.status(400).json({ error: 'A Google Drive shareable link is required.' });
    }

    const trimmed = driveLink.trim();

    // SSRF guard — only allow google.com drive/docs hostnames
    if (!trimmed.includes('drive.google.com') && !trimmed.includes('docs.google.com')) {
      return res.status(400).json({ accessible: false, error: 'Only Google Drive links are accepted (drive.google.com).' });
    }

    const fileId = extractDriveFileId(trimmed);
    if (!fileId) {
      return res.status(400).json({ accessible: false, error: 'Could not extract a valid file ID from the provided Drive URL. Ensure the link format is correct.' });
    }

    // Build the direct download/export URL that bypasses the preview page
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    if (!isSafeDriveUrl(downloadUrl)) {
      return res.status(400).json({ accessible: false, error: 'Invalid Drive URL.' });
    }

    let accessible = false;
    let mimeType = '';
    let sizeBytes = 0;
    let filename = 'Google Drive Document';
    let errorMsg = '';

    try {
      // Use a HEAD request first to check accessibility without downloading the body
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const headResp = await fetch(downloadUrl, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'AI365-DriveVerifier/1.0',
        },
      });
      clearTimeout(timeout);

      const contentType = headResp.headers.get('content-type') ?? '';

      if (!headResp.ok) {
        errorMsg = `Drive returned HTTP ${headResp.status}. The file may be deleted or permission-restricted.`;
      } else if (contentType.includes('text/html')) {
        // Google returns HTML when the file is private or requires login
        // Attempt GET to detect the "virus scan warning" page vs login page
        const getController = new AbortController();
        const getTimeout = setTimeout(() => getController.abort(), 8000);
        const getResp = await fetch(downloadUrl, {
          method: 'GET',
          signal: getController.signal,
          redirect: 'follow',
          headers: { 'User-Agent': 'AI365-DriveVerifier/1.0' },
        });
        clearTimeout(getTimeout);
        const body = await getResp.text();

        // If the page contains a direct download button (virus scan interstitial), treat as accessible
        if (body.includes('confirm=') || body.includes('download_warning')) {
          accessible = true;
          mimeType = 'application/octet-stream';
          // Try to get size from the confirm download URL
          sizeBytes = 0;
          filename = `drive_file_${fileId}`;
        } else {
          errorMsg = 'The file is not publicly accessible. Set sharing to "Anyone with the link can view" and try again.';
        }
      } else {
        accessible = true;
        mimeType = contentType.split(';')[0].trim();
        const contentLength = headResp.headers.get('content-length');
        sizeBytes = contentLength ? parseInt(contentLength, 10) : 0;

        // Try to extract filename from content-disposition
        const disposition = headResp.headers.get('content-disposition') ?? '';
        const nameMatch = disposition.match(/filename\*?=['"]?(?:UTF-\d+'[^']*')?([^;"'\r\n]+)/i);
        if (nameMatch) {
          filename = decodeURIComponent(nameMatch[1].replace(/"/g, '').trim());
        } else {
          filename = `drive_file_${fileId}`;
        }
      }
    } catch (fetchErr: any) {
      if (fetchErr?.name === 'AbortError') {
        errorMsg = 'Drive access check timed out. The link may be slow or unavailable.';
      } else {
        errorMsg = 'Could not reach Google Drive to verify the link. Check your internet connection.';
      }
    }

    const viewLink = `https://drive.google.com/file/d/${fileId}/view`;

    if (!accessible) {
      return res.status(200).json({
        accessible: false,
        url: viewLink,
        fileId,
        error: errorMsg || 'File is not accessible.',
      });
    }

    return res.json({
      accessible: true,
      url: viewLink,
      fileId,
      filename,
      mimeType,
      sizeBytes,
    });
  } catch (err: any) {
    console.error('Drive Check Error:', err);
    return res.status(500).json({ accessible: false, error: 'Internal error while checking Drive link.' });
  }
});

export default router;
