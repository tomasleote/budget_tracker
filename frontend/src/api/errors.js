/**
 * Custom Error Classes for API Operations
 * Provides specific error types for better error handling
 */

// Base API Error class
export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', statusCode = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Network-related errors
export class NetworkError extends ApiError {
  constructor(message = 'Network error occurred', details = null) {
    super(message, 'NETWORK_ERROR', null, details);
    this.name = 'NetworkError';
  }
}

// Timeout errors
export class TimeoutError extends ApiError {
  constructor(message = 'Request timed out', timeout = null) {
    super(message, 'TIMEOUT_ERROR', null, { timeout });
    this.name = 'TimeoutError';
  }
}

// Validation errors (400)
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 'VALIDATION_ERROR', 400, { errors });
    this.name = 'ValidationError';
  }
}

// Authentication errors (401)
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

// Authorization errors (403)
export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

// Not found errors (404)
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, 'NOT_FOUND_ERROR', 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

// Conflict errors (409)
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 'CONFLICT_ERROR', 409, details);
    this.name = 'ConflictError';
  }
}

// Rate limit errors (429)
export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Server errors (500+)
export class ServerError extends ApiError {
  constructor(message = 'Internal server error', statusCode = 500) {
    super(message, 'SERVER_ERROR', statusCode);
    this.name = 'ServerError';
  }
}

// Business logic errors
export class BusinessError extends ApiError {
  constructor(message, code = 'BUSINESS_ERROR', details = null) {
    super(message, code, 422, details);
    this.name = 'BusinessError';
  }
}

// Error factory function
export function createApiError(error) {
  // If it's already an ApiError, return it
  if (error instanceof ApiError) {
    return error;
  }

  // Handle Axios errors
  if (error.response) {
    // The request was made and the server responded with a status code
    const { status, data } = error.response;
    const message = data?.error?.message || data?.message || error.message;
    const code = data?.error?.code || 'API_ERROR';
    const details = data?.error?.details || data?.details || null;

    switch (status) {
      case 400:
        return new ValidationError(message, details?.errors || []);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message);
      case 409:
        return new ConflictError(message, details);
      case 429:
        return new RateLimitError(message, error.response.headers['retry-after']);
      case 422:
        return new BusinessError(message, code, details);
      default:
        if (status >= 500) {
          return new ServerError(message, status);
        }
        return new ApiError(message, code, status, details);
    }
  } else if (error.request) {
    // The request was made but no response was received
    if (error.code === 'ECONNABORTED') {
      return new TimeoutError('Request timed out', error.timeout);
    }
    return new NetworkError('No response from server', { originalError: error.message });
  } else {
    // Something happened in setting up the request
    return new ApiError(error.message || 'Unknown error occurred');
  }
}

// Helper function to check if error is retryable
export function isRetryableError(error) {
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  
  if (error instanceof ServerError || error instanceof RateLimitError) {
    return true;
  }
  
  return false;
}

// Helper function to get user-friendly error message
export function getUserFriendlyErrorMessage(error) {
  if (error instanceof NetworkError) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (error instanceof TimeoutError) {
    return 'The request took too long to complete. Please try again.';
  }
  
  if (error instanceof ValidationError) {
    if (error.details?.errors?.length > 0) {
      return error.details.errors.join(', ');
    }
    return error.message;
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please log in to continue.';
  }
  
  if (error instanceof AuthorizationError) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error instanceof NotFoundError) {
    return error.message;
  }
  
  if (error instanceof RateLimitError) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (error instanceof ServerError) {
    return 'Something went wrong on our end. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
}

// Export all error classes
export default {
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  BusinessError,
  createApiError,
  isRetryableError,
  getUserFriendlyErrorMessage,
};
