import { cors as honoCors } from 'hono/cors';
import { AppConfig } from '@infrastructure/config';

/**
 * CORS middleware configuration
 */
export const corsMiddleware = honoCors({
  origin: AppConfig.security.cors.origins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
  credentials: true,
});
