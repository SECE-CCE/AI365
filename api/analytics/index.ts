import { Router, Request, Response } from 'express';
import { db } from '../_db/client.js';

const router = Router();

// POST /api/analytics/track
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { event_type, page_url } = req.body;
    
    if (!event_type || !page_url) {
      return res.status(400).json({ error: 'event_type and page_url are required' });
    }

    // Extract non-sensitive user agent info
    const userAgentRaw = req.headers['user-agent'] || 'Unknown';
    // Optionally truncate or sanitize userAgent here to ensure privacy
    const userAgent = userAgentRaw.substring(0, 200); 

    await db.trackAnalyticsEvent({
      event_type,
      page_url,
      user_agent: userAgent
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Analytics tracking error:', err);
    // Fail silently for analytics so we don't break the client
    return res.status(500).json({ success: false });
  }
});

export default router;
