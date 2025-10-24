import { cors as honoCors } from 'hono/cors';

/**
 * CORS middleware configuration
 * WARNING: Allows all origins - for development/testing only
 */
export const corsMiddleware = honoCors({
  origin: '*', // Allow all origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
  credentials: false, // Must be false when origin is '*'
});
