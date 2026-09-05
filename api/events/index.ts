import { Router, Response } from 'express';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';
import { roleGuard } from '../_middleware/roleGuard.js';

const router = Router();

function sanitizeString(val: any, maxLen: number = 255): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function isValidDateString(val: any): boolean {
  if (!val || typeof val !== 'string') return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
}

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
    const numericEventId = Number(event_id);
    if (!event_id || isNaN(numericEventId) || numericEventId <= 0) {
      return res.status(400).json({ error: 'A valid numeric event_id is required.' });
    }

    const events = await db.getEvents();
    const targetEvent = events.find((e) => e.id === numericEventId);
    if (!targetEvent) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const reg = await db.registerForEvent(numericEventId, req.user!.id);

    await db.createNotification({
      user_id: req.user!.id,
      title: 'Event Registration Confirmed',
      message: `You have successfully registered for CCE Event "${targetEvent.title}".`,
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

    const cleanTitle = sanitizeString(title, 255);
    const cleanVenue = sanitizeString(venue, 255);
    const cleanDesc = sanitizeString(description, 5000);
    const cleanTime = sanitizeString(event_time, 50);
    const cleanPoster = sanitizeString(poster_url, 2048);
    const cleanCategory = sanitizeString(category, 100);

    if (!cleanTitle || !cleanVenue || !event_date || !cleanTime) {
      return res.status(400).json({ error: 'Title, Venue, Event Date, and Event Time are required.' });
    }

    if (!isValidDateString(event_date)) {
      return res.status(400).json({ error: 'Event Date must be a valid date string (YYYY-MM-DD).' });
    }

    let parsedMax = 100;
    if (max_participants !== undefined && max_participants !== null && max_participants !== '') {
      parsedMax = Number(max_participants);
      if (isNaN(parsedMax) || parsedMax <= 0 || parsedMax > 10000) {
        return res.status(400).json({ error: 'max_participants must be a valid positive integer between 1 and 10000.' });
      }
    }

    const newEvent = await db.createEvent({
      created_by: req.user!.id,
      title: cleanTitle,
      description: cleanDesc,
      venue: cleanVenue,
      event_date: String(event_date).slice(0, 10),
      event_time: cleanTime,
      max_participants: parsedMax,
      poster_url: cleanPoster || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
      category: cleanCategory || 'Workshop',
    });

    await db.logActivity(req.user!.id, 'Created CCE Event', `Created event "${cleanTitle}" on ${event_date}`);

    return res.status(201).json({ message: 'Event created successfully.', event: newEvent });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create event.' });
  }
});

// PUT /api/events/:id (Faculty can edit own created event, Admin can edit any)
router.put('/:id', authMiddleware, roleGuard(['faculty', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    const events = await db.getEvents();
    const existing = events.find(e => e.id === eventId);

    if (!existing) return res.status(404).json({ error: 'Event not found.' });

    if (req.user!.role === 'faculty' && existing.created_by !== req.user!.id && !req.user!.is_department_wide) {
      return res.status(403).json({ error: 'Forbidden: Faculty can only edit events they created.' });
    }

    const { title, description, venue, event_date, event_time, max_participants, poster_url, category } = req.body;

    const updatedEvent = await db.updateEvent(eventId, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(venue !== undefined && { venue }),
      ...(event_date !== undefined && { event_date }),
      ...(event_time !== undefined && { event_time }),
      ...(max_participants !== undefined && { max_participants: Number(max_participants) }),
      ...(poster_url !== undefined && { poster_url }),
      ...(category !== undefined && { category }),
    });

    await db.logActivity(req.user!.id, 'Updated CCE Event', `Updated event "${updatedEvent?.title || title}"`);

    return res.json({ message: 'Event updated successfully.', event: updatedEvent });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id (Faculty can delete own created event, Admin can delete any)
router.delete('/:id', authMiddleware, roleGuard(['faculty', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Valid numeric event id parameter is required.' });
    }

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
