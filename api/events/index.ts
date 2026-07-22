import { Router, Response } from 'express';
import { db } from '../_db/client';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth';
import { roleGuard } from '../_middleware/roleGuard';

const router = Router();

// GET /api/events (Publicly accessible to logged in users, or public visitor view)
router.get('/', async (req, res) => {
  try {
    const events = await db.getEvents();
    return res.json({ events });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// GET /api/events/my-registrations (Student registered events)
router.get('/my-registrations', authMiddleware, roleGuard(['student']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const registrations = await db.getEventRegistrations(req.user!.id);
    return res.json({ registrations });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch event registrations.' });
  }
});

// POST /api/events/register (Student registers for event)
router.post('/register', authMiddleware, roleGuard(['student']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { event_id } = req.body;
    if (!event_id) return res.status(400).json({ error: 'event_id is required.' });

    const reg = await db.registerForEvent(Number(event_id), req.user!.id);

    await db.createNotification({
      user_id: req.user!.id,
      title: 'Event Registration Confirmed',
      message: `You have successfully registered for CCE Event #${event_id}.`,
      type: 'event',
      link: '/student/events',
    });

    return res.status(201).json({ message: 'Successfully registered for event.', registration: reg });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register for event.' });
  }
});

// POST /api/events (Faculty/Admin create event)
router.post('/', authMiddleware, roleGuard(['faculty', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, venue, event_date, event_time, max_participants, poster_url, category } = req.body;

    if (!title || !venue || !event_date || !event_time) {
      return res.status(400).json({ error: 'Title, Venue, Event Date, and Event Time are required.' });
    }

    const newEvent = await db.createEvent({
      created_by: req.user!.id,
      title,
      description: description || '',
      venue,
      event_date,
      event_time,
      max_participants: max_participants ? Number(max_participants) : 100,
      poster_url: poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
      category: category || 'Workshop',
    });

    await db.logActivity(req.user!.id, 'Created CCE Event', `Created event "${title}" on ${event_date}`);

    return res.status(201).json({ message: 'Event created successfully.', event: newEvent });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create event.' });
  }
});

// DELETE /api/events/:id (Faculty can delete own created event, Admin can delete any)
router.delete('/:id', authMiddleware, roleGuard(['faculty', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    const events = await db.getEvents();
    const event = events.find(e => e.id === eventId);

    if (!event) return res.status(404).json({ error: 'Event not found.' });

    // Scoping check: faculty can only delete their own created events unless department-wide admin
    if (req.user!.role === 'faculty' && event.created_by !== req.user!.id && !req.user!.is_department_wide) {
      return res.status(403).json({ error: 'Forbidden: Faculty can only delete events they created.' });
    }

    await db.deleteEvent(eventId);
    await db.logActivity(req.user!.id, 'Deleted CCE Event', `Deleted event "${event.title}"`);

    return res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete event.' });
  }
});

export default router;
