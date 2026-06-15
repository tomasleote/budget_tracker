/**
 * Firebase auth middleware.
 * Verifies the `Authorization: Bearer <idToken>` header with the Admin SDK,
 * exposes the user on `req.user`, and runs the rest of the request inside an
 * AsyncLocalStorage context carrying the uid (see requestContext.ts).
 */
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase';
import { runWithContext, RequestContext } from '../context/requestContext';
import { logger } from '../config/logger';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { uid: string; email?: string };
    }
  }
}

function unauthorized(res: Response, message: string): void {
  res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message } });
}

export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    unauthorized(res, 'Missing or malformed Authorization header');
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const context: RequestContext = { uid: decoded.uid };
    if (decoded.email) context.email = decoded.email;

    req.user = { uid: context.uid, ...(context.email ? { email: context.email } : {}) };
    runWithContext(context, () => next());
  } catch (err) {
    logger.warn('Firebase token verification failed:', err);
    unauthorized(res, 'Invalid or expired token');
  }
}
