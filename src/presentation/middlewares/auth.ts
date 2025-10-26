import { Context, Next } from 'hono';
import { JWTService } from '@infrastructure/services';

export const jwtAuth = async (c: Context, next: Next): Promise<Response | void> => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
        },
      },
      401
    );
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const payload = JWTService.verifyToken(token);
    
    c.set('jwtPayload', payload);
    
    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error instanceof Error ? error.message : 'Invalid or expired token',
        },
      },
      401
    );
  }
};
