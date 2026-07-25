import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';

const router = Router();

// Validates a Google Drive shareable link and returns it as-is.
// Students upload files to their own Google Drive, set sharing to "Anyone with link can view",
// then paste the link here. Faculty can click the link to view the document directly.
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { driveLink } = req.body;

    if (!driveLink || typeof driveLink !== 'string') {
      return res.status(400).json({ error: 'A Google Drive shareable link is required.' });
    }

    const trimmed = driveLink.trim();

    // Accept drive.google.com links only
    if (!trimmed.includes('drive.google.com')) {
      return res.status(400).json({ error: 'Only Google Drive links are accepted (drive.google.com).' });
    }

    // Normalize: convert /file/d/FILE_ID/view?... → clean view link
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
