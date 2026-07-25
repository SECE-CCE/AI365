import { Router, Response } from 'express';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// GET /api/search?q=query
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();
    if (!query) return res.json({ results: [] });

    const user = req.user!;
    const results: any[] = [];

    // Search events (accessible to all)
    const events = await db.getEvents();
    events.forEach(e => {
      if (e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query) || e.venue.toLowerCase().includes(query)) {
        results.push({ type: 'Event', title: e.title, subtitle: `${e.event_date} @ ${e.venue}`, link: user.role === 'student' ? '/student/events' : `/${user.role}/events` });
      }
    });

    // Student scope vs Faculty/Admin scope for submissions
    if (user.role === 'student') {
      const hours = await db.getLearningHours(user.id);
      hours.forEach(h => {
        if (h.activity_name.toLowerCase().includes(query) || h.platform.toLowerCase().includes(query)) {
          results.push({ type: 'Learning Hour', title: h.activity_name, subtitle: `${h.hours} hours on ${h.platform} (${h.status})`, link: '/student/learning-hours' });
        }
      });

      const certs = await db.getCertificates(user.id);
      certs.forEach(c => {
        if (c.title.toLowerCase().includes(query) || c.issuer.toLowerCase().includes(query)) {
          results.push({ type: 'Certificate', title: c.title, subtitle: `${c.issuer} (${c.status})`, link: '/student/certificates' });
        }
      });
    } else {
      // Faculty/Admin can search students by name/register_number within their scope
      const users = await db.getAllUsers();
      users.forEach(u => {
        if (u.role === 'student' && (u.full_name.toLowerCase().includes(query) || (u.register_number && u.register_number.toLowerCase().includes(query)))) {
          results.push({ type: 'Student', title: u.full_name, subtitle: `${u.register_number || 'N/A'} - ${u.year || ''}`, link: user.role === 'admin' ? '/admin/users' : '/faculty/approvals' });
        }
      });
    }

    return res.json({ results: results.slice(0, 10) });
  } catch (err) {
    return res.status(500).json({ error: 'Search failed.' });
  }
});

export default router;
