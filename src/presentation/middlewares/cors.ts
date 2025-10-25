import { cors as honoCors } from 'hono/cors';

/**
 * CORS middleware configuration
 * Allows all origins for development/testing
 */
export const corsMiddleware = honoCors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
  credentials: false, // Must be false when origin is '*'
});
