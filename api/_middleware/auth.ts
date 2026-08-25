import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRow } from '../_db/client.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment');
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const SESSION_EXPIRES_IN = process.env.SESSION_EXPIRES_IN || '1h';
export const SESSION_MAX_AGE_MS = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60', 10) * 60 * 1000;

export interface AuthenticatedRequest extends Request {
  user?: UserRow;
  tokenPayload?: {
    id: number;
    email: string;
    role: string;
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
      decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; iat?: number; exp?: number };
    } catch (jwtErr: any) {
      if (jwtErr.name === 'TokenExpiredError') {
        res.clearCookie('token');
        return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'SESSION_EXPIRED' });
      }
      res.clearCookie('token');
      return res.status(401).json({ error: 'Invalid authentication token.', code: 'INVALID_TOKEN' });
    }
    
    const user = await db.findUserById(decoded.id);
    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({ error: 'User no longer exists.', code: 'USER_NOT_FOUND' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ error: 'Your account is pending approval by CCE Administrator.', code: 'ACCOUNT_PENDING' });
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed.', code: 'AUTH_ERROR' });
  }
}
