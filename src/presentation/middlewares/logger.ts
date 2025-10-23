import { Context, Next } from 'hono';
import { AppConfig } from '@infrastructure/config';

/**
 * Request logger middleware
 */
export async function logger(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  if (AppConfig.app.isDevelopment) {
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] ${method} ${path} ${status} - ${duration}ms`);
  }
}
