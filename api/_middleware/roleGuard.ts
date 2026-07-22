import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export function roleGuard(allowedRoles: Array<'student' | 'faculty' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
}
