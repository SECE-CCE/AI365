import { Router, Response } from 'express';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// GET /api/notifications
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await db.getNotifications(req.user!.id);
    const unreadCount = list.filter(n => !n.is_read).length;
    return res.json({ notifications: list, unreadCount });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// POST /api/notifications/read
router.post('/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notification_id } = req.body;
    if (!notification_id) return res.status(400).json({ error: 'notification_id is required.' });

    await db.markNotificationRead(Number(notification_id), req.user!.id);
    return res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark notification read.' });
  }
});

export default router;
