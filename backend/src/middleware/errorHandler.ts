import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  
  // Log error
  logger.error('API Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error.details 
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};
