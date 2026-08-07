import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';

const router = Router();

// BASE DIRECTORY LOCATION FOR USER STORAGE INSIDE ASSETS
export const UPLOADS_BASE_DIR = path.join(process.cwd(), 'assets', 'Documents');

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

    const photoUrl = `/assets/Documents/${sanitizedUserName}/photos/${photoFilename}?t=${Date.now()}`;

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

// Validates a Google Drive shareable link and returns it as-is.
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { driveLink } = req.body;

    if (!driveLink || typeof driveLink !== 'string') {
      return res.status(400).json({ error: 'A Google Drive shareable link is required.' });
    }

    const trimmed = driveLink.trim();

    if (!trimmed.includes('drive.google.com')) {
      return res.status(400).json({ error: 'Only Google Drive links are accepted (drive.google.com).' });
    }

    const fileIdMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const viewLink = fileIdMatch
      ? `https://drive.google.com/file/d/${fileIdMatch[1]}/view`
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

export default router;
