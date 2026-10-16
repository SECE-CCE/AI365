import { Router, Response, Request } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';
import { db } from '../_db/client.js';

const router = Router();

// BASE DIRECTORY LOCATION FOR USER STORAGE INSIDE ASSETS
export const UPLOADS_BASE_DIR = path.join(process.cwd(), 'assets', 'Documents');

function detectMimeType(base64Str: string, ext?: string): string {
  const match = base64Str.match(/^data:([^;]+);base64,/);
  if (match) return match[1];
  const cleanExt = (ext || '').replace(/^\./, '').toLowerCase();
  switch (cleanExt) {
    case 'pdf': return 'application/pdf';
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    default: return 'application/octet-stream';
  }
}

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



// POST /api/upload/poster
// Handles event banner poster image upload, creates assets/Events/ directory if missing,
// and saves file on server.
router.post('/poster', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, title = 'Event_Poster' } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Poster image data is required.' });
    }

    const eventsFolder = path.join(process.cwd(), 'assets', 'Events');
    if (!fs.existsSync(eventsFolder)) {
      fs.mkdirSync(eventsFolder, { recursive: true });
    }

    const sanitizedTitle = String(title).trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'Poster';
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `${sanitizedTitle}_${Date.now()}.jpg`;
    const filePath = path.join(eventsFolder, filename);

    fs.writeFileSync(filePath, buffer);

    // Also mirror to public/assets/Events if available for static serving
    try {
      const publicEvents = path.join(process.cwd(), 'public', 'assets', 'Events');
      if (!fs.existsSync(publicEvents)) fs.mkdirSync(publicEvents, { recursive: true });
      fs.writeFileSync(path.join(publicEvents, filename), buffer);
    } catch (_) {}

    const posterUrl = `/assets/Events/${filename}`;

    // Store uploaded poster directly in the database
    await db.saveUploadedFile({
      file_url: posterUrl,
      file_name: filename,
      mime_type: 'image/jpeg',
      file_size: buffer.length,
      file_data: base64Data,
      user_id: req.user?.id,
      category: 'poster',
    });

    return res.json({
      url: posterUrl,
      filename,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Poster Upload Error:', err);
    return res.status(500).json({ error: 'Failed to save event poster image on server.' });
  }
});

// POST /api/upload/photo
// Handles compressed photo upload, creates assets/Documents/<User_Name>/photos/ directory,
// and stores compressed profile picture inside that directory.
router.post('/photo', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Compressed image data is required.' });
    }

    const userName = req.user?.full_name || 'User';
    const sanitizedUserName = userName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    // Create subfolder photos/ inside user directory: assets/Documents/<Sanitized_User_Name>/photos/
    const photosFolder = path.join(UPLOADS_BASE_DIR, sanitizedUserName, 'photos');
    if (!fs.existsSync(photosFolder)) {
      fs.mkdirSync(photosFolder, { recursive: true });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Custom filename: <Sanitized_User_Name>_Profile.jpg (matches certificate/paper naming convention)
    const photoFilename = `${sanitizedUserName}_Profile.jpg`;
    const filePath = path.join(photosFolder, photoFilename);

    fs.writeFileSync(filePath, buffer);

    // Mirror to public/assets for immediate static resolution
    try {
      const publicPhotosFolder = path.join(process.cwd(), 'public', 'assets', 'Documents', sanitizedUserName, 'photos');
      if (!fs.existsSync(publicPhotosFolder)) fs.mkdirSync(publicPhotosFolder, { recursive: true });
      fs.writeFileSync(path.join(publicPhotosFolder, photoFilename), buffer);
    } catch (_) {}

    const cleanPhotoUrl = `/assets/Documents/${sanitizedUserName}/photos/${photoFilename}`;
    const photoUrl = `${cleanPhotoUrl}?t=${Date.now()}`;

    // Store uploaded photo directly in the database
    await db.saveUploadedFile({
      file_url: cleanPhotoUrl,
      file_name: photoFilename,
      mime_type: 'image/jpeg',
      file_size: buffer.length,
      file_data: base64Data,
      user_id: req.user?.id,
      category: 'photo',
    });

    return res.json({
      url: photoUrl,
      folderPath: photosFolder,
      filename: photoFilename,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Photo Upload Error:', err);
    return res.status(500).json({ error: 'Failed to save compressed profile photo on server.' });
  }
});

// POST /api/upload/certificate
// Handles certificate upload, creates assets/Documents/<User_Name>/certificates/ directory,
// formats filename as <User_Name>_<Certificate_Title>.<ext>, and stores file inside that directory.
router.post('/certificate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileBase64, extension = 'jpg', certificateTitle = 'Certificate' } = req.body;
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ error: 'Certificate file data is required.' });
    }

    const userName = req.user?.full_name || 'User';
    const sanitizedUserName = userName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedTitle = certificateTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    // Create subfolder certificates/ inside user directory: assets/Documents/<Sanitized_User_Name>/certificates/
    const certificatesFolder = path.join(UPLOADS_BASE_DIR, sanitizedUserName, 'certificates');
    if (!fs.existsSync(certificatesFolder)) {
      fs.mkdirSync(certificatesFolder, { recursive: true });
    }

    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Custom filename: <Sanitized_User_Name>_<Sanitized_Certificate_Title>.<ext>
    const cleanExt = extension.replace(/^\./, '');
    const certificateFilename = `${sanitizedUserName}_${sanitizedTitle}.${cleanExt}`;
    const filePath = path.join(certificatesFolder, certificateFilename);

    fs.writeFileSync(filePath, buffer);

    const certificateUrl = `/assets/Documents/${sanitizedUserName}/certificates/${certificateFilename}`;

    // Store uploaded certificate directly in the database
    const mimeType = detectMimeType(fileBase64, cleanExt);
    await db.saveUploadedFile({
      file_url: certificateUrl,
      file_name: certificateFilename,
      mime_type: mimeType,
      file_size: buffer.length,
      file_data: base64Data,
      user_id: req.user?.id,
      category: 'certificate',
    });

    return res.json({
      url: certificateUrl,
      folderPath: certificatesFolder,
      filename: certificateFilename,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Certificate Upload Error:', err);
    return res.status(500).json({ error: 'Failed to save certificate on server.' });
  }
});

// POST /api/upload/paper
// Handles research paper upload in PDF format, creates assets/Documents/<User_Name>/papers/ directory,
// formats filename as <User_Name>_<Paper_Title>.<ext>, compresses and stores file inside that folder.
router.post('/paper', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileBase64, extension = 'pdf', paperTitle = 'Research_Paper' } = req.body;
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ error: 'Paper PDF file data is required.' });
    }

    const userName = req.user?.full_name || 'User';
    const sanitizedUserName = userName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedTitle = paperTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    // Create subfolder papers/ inside user directory: assets/Documents/<Sanitized_User_Name>/papers/
    const papersFolder = path.join(UPLOADS_BASE_DIR, sanitizedUserName, 'papers');
    if (!fs.existsSync(papersFolder)) {
      fs.mkdirSync(papersFolder, { recursive: true });
    }

    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Custom filename: <Sanitized_User_Name>_<Sanitized_Paper_Title>.<ext>
    const cleanExt = extension.replace(/^\./, '');
    const paperFilename = `${sanitizedUserName}_${sanitizedTitle}.${cleanExt}`;
    const filePath = path.join(papersFolder, paperFilename);

    fs.writeFileSync(filePath, buffer);

    const paperUrl = `/assets/Documents/${sanitizedUserName}/papers/${paperFilename}`;

    // Store uploaded research paper directly in the database
    await db.saveUploadedFile({
      file_url: paperUrl,
      file_name: paperFilename,
      mime_type: 'application/pdf',
      file_size: buffer.length,
      file_data: base64Data,
      user_id: req.user?.id,
      category: 'paper',
    });

    return res.json({
      url: paperUrl,
      folderPath: papersFolder,
      filename: paperFilename,
      sizeBytes: buffer.length,
      compressed: true,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Paper Upload Error:', err);
    return res.status(500).json({ error: 'Failed to save research paper PDF on server.' });
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

// ---------------------------------------------------------------------------
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

// GET /api/upload/file/*splat
// Retrieves and streams any file stored in the database by its relative path or URL
router.get('/file/*splat', async (req: Request, res: Response) => {
  try {
    const rawPath = (req.params as any).splat || (req.params as any)[0] || '';
    const fullUrl = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const altUrl = `/assets/Documents/${rawPath.replace(/^\/+/, '')}`;

    const file = (await db.getUploadedFileByUrl(fullUrl, rawPath)) || (await db.getUploadedFileByUrl(altUrl, rawPath));
    if (!file || !file.file_data) {
      return res.status(404).json({ error: 'File not found in database or server.' });
    }

    const buffer = Buffer.from(file.file_data, 'base64');
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.file_name)}"`);
    return res.end(buffer);
  } catch (err: any) {
    console.error('File retrieve error:', err);
    return res.status(500).json({ error: 'Failed to retrieve file from database.' });
  }
});

export default router;
