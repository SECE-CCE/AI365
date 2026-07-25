import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from '../_middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify role matches actual account role in DB
    if (user.role !== role) {
      return res.status(403).json({
        error: `Role mismatch: This account belongs to a '${user.role}', but you selected '${role}'.`,
      });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check account status
    if (user.status === 'pending_approval') {
      return res.status(403).json({
        error: 'Your student account is pending approval by the CCE Department Administrator.',
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        error: 'Your account registration was rejected by CCE Administration.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password: _, ...userWithoutPass } = user;

    return res.json({
      message: 'Login successful.',
      token,
      user: userWithoutPass,
    });
  } catch (err: any) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      register_number,
      department,
      year,
      email,
      phone,
      password,
      profile_photo,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full Name, Email, and Password are required.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Find first available faculty to assign as default mentor
    const allFaculty = await db.getAllUsers({ role: 'faculty', status: 'approved' });
    const defaultMentorId = allFaculty.length > 0 ? allFaculty[0].id : null;

    const newUser = await db.createUser({
      full_name,
      email,
      password: hashedPassword,
      role: 'student',
      department: department || 'Computer & Communication Engineering',
      register_number: register_number || '',
      year: year || '1st Year',
      phone: phone || '',
      profile_photo: profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'pending_approval',
      mentor_id: defaultMentorId,
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
router.post('/register-faculty', async (req, res) => {
  try {
    const { full_name, email, phone, password, department, designation } = req.body;

    if (!full_name || !email || !password || !designation) {
      return res.status(400).json({ error: 'Full Name, Email, Password, and Designation are required.' });
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

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
