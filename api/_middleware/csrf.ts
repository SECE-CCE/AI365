import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Utility to generate a CSRF token for double-submit cookie pattern
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to verify CSRF protection on state-changing API endpoints
 * when cookie-based authentication is utilized.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Safe methods do not mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // If request relies on cookie-based authentication
  if (req.cookies && req.cookies.token) {
    const csrfHeader = req.headers['x-csrf-token'] || req.headers['X-CSRF-Token'];
    const csrfCookie = req.cookies['csrf_token'];
    const origin = req.headers['origin'] || req.headers['referer'];
    const host = req.headers['host'];

    // Verify Origin/Referer matches host if present
    if (origin && host) {
      try {
        const originUrl = new URL(String(origin));
        if (originUrl.host !== host) {
          return res.status(403).json({
            error: 'CSRF validation failed: Origin mismatch.',
            code: 'CSRF_ORIGIN_MISMATCH',
          });
        }
      } catch (err) {
        return res.status(403).json({
          error: 'CSRF validation failed: Invalid Origin/Referer header.',
          code: 'CSRF_INVALID_HEADER',
        });
      }
    }

    // If double-submit token pattern is present, compare token
    if (csrfCookie && csrfHeader && csrfCookie !== csrfHeader) {
      return res.status(403).json({
        error: 'CSRF validation failed: Token mismatch.',
        code: 'CSRF_TOKEN_MISMATCH',
      });
    }
  }

  next();
}
