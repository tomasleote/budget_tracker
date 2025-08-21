import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export const validateRequest = (schemas: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any[] = [];

    // Validate body if schema provided
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `body.${detail.path.join('.')}`,
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.body = value;
      }
    }

    // Validate query if schema provided
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `query.${detail.path.join('.')}`,
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.query = value;
      }
    }

    // Validate params if schema provided
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `params.${detail.path.join('.')}`,
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.params = value;
      }
    }

    if (errors.length > 0) {
      const validationError: ApiError = new Error('Validation failed');
      validationError.statusCode = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = errors;
      return next(validationError);
    }

    next();
  };
};

// Legacy support for single property validation
export const validateRequestSingle = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationError: ApiError = new Error('Validation failed');
      validationError.statusCode = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(validationError);
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

export const validateUUID = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uuidSchema = Joi.string().uuid().required();
    const { error } = uuidSchema.validate(req.params[paramName]);

    if (error) {
      const validationError: ApiError = new Error(`Invalid ${paramName} format`);
      validationError.statusCode = 400;
      validationError.code = 'INVALID_UUID';
      return next(validationError);
    }

    next();
  };
};
