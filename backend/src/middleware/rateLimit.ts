import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Create rate limiting middleware with custom options
 */
export const rateLimitMiddleware = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests from this IP, please try again later',
          retryAfter: Math.ceil(options.windowMs / 1000)
        }
      });
    }
  });
};

/**
 * Default rate limiting middleware for general API endpoints
 */
export const defaultRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

/**
 * Strict rate limiting for sensitive operations
 */
export const strictRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

/**
 * File upload rate limiting
 */
export const uploadRateLimit = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 uploads per minute
  message: 'Too many file uploads, please wait before uploading again'
});

/**
 * Export rate limiting
 */
export const exportRateLimit = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 exports per minute
  message: 'Too many export requests, please wait before requesting another export'
});
