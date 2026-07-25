import { Router } from 'express';
import { db } from '../_db/client.js';

const router = Router();

// GET /api/visitor/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getPublicAggregateStats();
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load public aggregate stats.' });
  }
});

export default router;
