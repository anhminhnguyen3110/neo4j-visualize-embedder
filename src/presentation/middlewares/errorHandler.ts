import { Context, ErrorHandler } from 'hono';
import { AppError } from '@models/errors';
import { ZodError } from 'zod';

export const errorHandler: ErrorHandler = (err, c: Context) => {
  const error = err as Error;
  
  if (error instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
        },
      },
      400
    );
  }

  if (error instanceof AppError) {
    const statusCode = error.statusCode;
    return c.json(
      {
        success: false,
        error: {
          code: error.constructor.name.replace('Error', '').toUpperCase(),
          message: error.message,
        },
      },
      statusCode as 400 | 401 | 403 | 404 | 409 | 500
    );
  }

  console.error('Unhandled error:', error);
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    500
  );
};
