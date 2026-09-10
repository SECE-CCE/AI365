import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRow } from '../_db/client.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'cce-ai365-jwt-secret-dev-key-2026';
export const SESSION_EXPIRES_IN = process.env.SESSION_EXPIRES_IN || '24h';
export const SESSION_MAX_AGE_MS = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '1440', 10) * 60 * 1000;

export interface AuthenticatedRequest extends Request {
  user?: UserRow;
  tokenPayload?: {
    id: number;
    email: string;
    role: string;
    department?: string;
    name?: string;
    iat?: number;
    exp?: number;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined = undefined;

    // 1. Check cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.', code: 'AUTH_REQUIRED' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; department?: string; name?: string; iat?: number; exp?: number };
    } catch (jwtErr: any) {
      if (jwtErr.name === 'TokenExpiredError') {
        res.clearCookie('token');
        return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'SESSION_EXPIRED' });
      }
      res.clearCookie('token');
      return res.status(401).json({ error: 'Invalid authentication token.', code: 'INVALID_TOKEN' });
    }

    let user: UserRow | undefined;
    try {
      user = await db.findUserById(decoded.id);
    } catch (dbErr) {
      console.warn('[authMiddleware] DB lookup failed, falling back to local store:', (dbErr as Error).message);
    }

    if (!user) {
      const storeUser = db.store.users.find((u: UserRow) => u.id === decoded.id);
      if (storeUser) {
        user = storeUser;
      } else if (decoded.id && decoded.email) {
        // Fallback user from verified JWT payload if DB transiently fails
        user = {
          id: decoded.id,
          full_name: decoded.name || 'CCE User',
          email: decoded.email,
          role: (decoded.role as any) || 'student',
          department: decoded.department || 'Computer & Communication Engineering',
          status: 'approved',
          created_at: new Date().toISOString(),
        } as UserRow;
      }
    }

    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({ error: 'User account not found.', code: 'USER_NOT_FOUND' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ error: 'Your account is pending approval by CCE Administrator.', code: 'ACCOUNT_PENDING' });
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    console.error('[authMiddleware] Server error during auth:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.', code: 'SERVER_ERROR' });
  }
}
