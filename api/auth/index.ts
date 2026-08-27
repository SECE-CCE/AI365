import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET, SESSION_EXPIRES_IN, SESSION_MAX_AGE_MS } from '../_middleware/auth.js';
import { isValidSeceEmail } from '../_validators/index.js';

const router = Router();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
}

function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'Unknown Device / Browser';
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  skipSuccessfulRequests: false,
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  const ip_address = getClientIp(req);
  const user_agent = getUserAgent(req);
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      await db.createAuthLog({
        user_id: null,
        email: email || 'Unknown',
        role: role || null,
        event_type: 'LOGIN_FAILED',
        status: 'FAILED',
        reason: 'Missing email, password, or role',
        ip_address,
        user_agent,
      });
      return res.status(400).json({ error: 'Email, password, and role are required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      await db.createAuthLog({
        user_id: null,
        email,
        role,
        event_type: 'LOGIN_FAILED',
        status: 'FAILED',
        reason: 'User account does not exist',
        ip_address,
        user_agent,
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify role matches actual account role in DB
    if (user.role !== role) {
      await db.createAuthLog({
        user_id: user.id,
        email,
        role,
        event_type: 'LOGIN_FAILED',
        status: 'FAILED',
        reason: `Role mismatch: selected '${role}' but account is '${user.role}'`,
        ip_address,
        user_agent,
      });
      return res.status(403).json({
        error: `Role mismatch: This account belongs to a '${user.role}', but you selected '${role}'.`,
      });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      await db.createAuthLog({
        user_id: user.id,
        email,
        role: user.role,
        event_type: 'LOGIN_FAILED',
        status: 'FAILED',
        reason: 'Incorrect password',
        ip_address,
        user_agent,
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check account status
    if (user.status === 'pending_approval') {
      await db.createAuthLog({
        user_id: user.id,
        email,
        role: user.role,
        event_type: 'LOGIN_FAILED',
        status: 'FAILED',
        reason: 'Account pending admin approval',
        ip_address,
        user_agent,
      });
      return res.status(403).json({
        error: 'Your student account is pending approval by the CCE Department Administrator.',
      });
    }

    if (user.status === 'rejected') {
      await db.createAuthLog({
        user_id: user.id,
        email,
        role: user.role,
        event_type: 'LOGIN_FAILED',
        status: 'FAILED',
        reason: 'Account registration was rejected',
        ip_address,
        user_agent,
      });
      return res.status(403).json({
        error: 'Your account registration was rejected by CCE Administration.',
      });
    }

    // Generate JWT with configured session expiration (default 1h)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: (SESSION_EXPIRES_IN as any) }
    );

    // Create a usage session for students
    let sessionId = null;
    if (user.role === 'student') {
      const session = await db.createUsageSession(user.id);
      sessionId = session.id;
    }

    // Set httpOnly cookie
    // Set secure httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_MS,
    });

    // Record successful login in persistent auth_logs
    await db.createAuthLog({
      user_id: user.id,
      email: user.email,
      role: user.role,
      event_type: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      reason: 'Authenticated successfully',
      ip_address,
      user_agent,
    });

    const { password: _, ...userWithoutPass } = user;

    return res.json({
      message: 'Login successful.',
      user: userWithoutPass,
      sessionId,
    });
  } catch (err: any) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const {
      full_name,
      register_number,
      department,
      year,
      email,
      phone,
      password,
      gender,
      profile_photo,
      mentor_name,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full Name, Email, and Password are required.' });
    }

    if (!isValidSeceEmail(email)) {
      return res.status(400).json({ error: 'Registration is restricted to valid @sece.ac.in college email addresses.' });
    }

    if (!register_number) {
      return res.status(400).json({ error: 'Register Number is required for students.' });
    }

    if (!year) {
      return res.status(400).json({ error: 'Academic Year is required.' });
    }

    if (!mentor_name) {
      return res.status(400).json({ error: 'Faculty Mentor is required.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Avatar assignment based on gender selection
    const defaultAvatar = gender === 'girl'
      ? '/girl-avatar.svg'
      : '/boy-avatar.svg';

    const newUser = await db.createUser({
      full_name,
      email,
      password: hashedPassword,
      role: 'student',
      department: department || 'Computer & Communication Engineering',
      register_number: register_number,
      year: year,
      phone: phone || '',
      gender: gender || 'boy',
      profile_photo: profile_photo || defaultAvatar,
      status: 'pending_approval',
      mentor_id: null,
      mentor_name: mentor_name || null,
      is_department_wide: false,
    });

    // Create Notification for Admin (user_id = 1)
    await db.createNotification({
      user_id: 1,
      title: 'New Student Registration Pending',
      message: `Student ${full_name} (${register_number || 'New'}) registered and requires approval.`,
      type: 'registration',
      link: '/admin/users',
    });

    // Log activity
    await db.logActivity(newUser.id, 'Registered Student Account', `Student ${full_name} registered and pending approval`, newUser.id);

    const { password: _, ...userWithoutPass } = newUser;

    return res.status(201).json({
      message: 'Registration successful! Your account is pending CCE Admin approval before you can log in.',
      user: userWithoutPass,
    });
  } catch (err: any) {
    console.error('Register Error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/register-faculty
router.post('/register-faculty', authLimiter, async (req, res) => {
  try {
    const { full_name, email, phone, password, department, designation } = req.body;

    if (!full_name || !email || !password || !designation) {
      return res.status(400).json({ error: 'Full Name, Email, Password, and Designation are required.' });
    }

    if (!isValidSeceEmail(email)) {
      return res.status(400).json({ error: 'Registration is restricted to valid @sece.ac.in college email addresses.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.createUser({
      full_name,
      email,
      password: hashedPassword,
      role: 'faculty',
      department: department || 'Computer & Communication Engineering',
      register_number: '',
      year: designation,
      phone: phone || '',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'pending_approval',
      mentor_id: null,
      is_department_wide: false,
    });

    await db.createNotification({
      user_id: 1,
      title: 'New Faculty Registration Pending',
      message: `Faculty ${full_name} (${designation}) registered and requires admin approval.`,
      type: 'registration',
      link: '/admin/users',
    });

    await db.logActivity(newUser.id, 'Registered Faculty Account', `Faculty ${full_name} registered and pending approval`, newUser.id);

    const { password: _, ...userWithoutPass } = newUser;
    return res.status(201).json({
      message: 'Faculty registration submitted! Your account is pending CCE Admin approval before you can log in.',
      user: userWithoutPass,
    });
  } catch (err: any) {
    console.error('Faculty Register Error:', err);
    return res.status(500).json({ error: 'Server error during faculty registration.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { password, ...userWithoutPass } = req.user;
  return res.json({ user: userWithoutPass });
});

// PUT /api/auth/me
router.put('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { full_name, phone, profile_photo, password } = req.body;

    const updates: Record<string, any> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (profile_photo !== undefined) updates.profile_photo = profile_photo;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.updateUser(req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPass } = updatedUser;
    return res.json({ message: 'Profile updated successfully', user: userWithoutPass });
  } catch (err: any) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ error: 'Server error while updating profile.' });
  }
});

// POST /api/auth/logout
router.post('/logout', authLimiter, async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const ip_address = getClientIp(req);
  const user_agent = getUserAgent(req);

  try {
    if (sessionId) {
      try {
        await db.updateUsageSession(Number(sessionId), true);
      } catch (err) {
        console.error('Error closing session on logout:', err);
      }
    }

    let token: string | undefined = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as {
          id: number;
          email: string;
          role: string;
          iat?: number;
        };

        const nowSeconds = Math.floor(Date.now() / 1000);
        const durationSeconds = decoded.iat ? Math.max(0, nowSeconds - decoded.iat) : 0;

        await db.createAuthLog({
          user_id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          event_type: 'LOGOUT',
          status: 'SUCCESS',
          reason: 'User initiated logout',
          session_duration_seconds: durationSeconds,
          ip_address,
          user_agent,
        });
      } catch (decodeErr) {
        // Token was malformed, ignore error for logout
      }
    }
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.json({ message: 'Logged out successfully.' });
  }
});

// PUT /api/auth/session
router.put('/session', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, isLogout } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    const session = await db.updateUsageSession(Number(sessionId), Boolean(isLogout));
    return res.json({ session });
  } catch (err) {
    console.error('Session Heartbeat Error:', err);
    return res.status(500).json({ error: 'Server error updating session.' });
  }
});

export default router;
