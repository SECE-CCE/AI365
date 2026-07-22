import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRow } from '../_db/client';

export const JWT_SECRET = process.env.JWT_SECRET || 'ai365-cce-super-secret-jwt-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: UserRow;
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
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ error: 'Your account is pending approval by CCE Administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
