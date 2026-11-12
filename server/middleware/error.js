
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export const notFound = (_req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const status = err.status || 500;

  if (status === 500) {
    console.error(err);
  }

  return res.status(status).json({
    success: false,
    message:
      status === 500 && env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
};
