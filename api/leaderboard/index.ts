import { Router, Response } from 'express';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';

const router = Router();

// GET /api/leaderboard (Requires authentication)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year } = req.query;
    const leaderboard = await db.getLeaderboard(year ? String(year) : undefined);
    return res.json({ leaderboard });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

export default router;
