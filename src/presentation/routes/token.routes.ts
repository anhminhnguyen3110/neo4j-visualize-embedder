import { Hono } from 'hono';
import { TokenController } from '../controllers';

const tokenRoutes = new Hono();

/**
 * POST /api/token/generate
 * Generate a new JWT token for API access
 */
tokenRoutes.post('/generate', (c) => TokenController.generate(c));

export default tokenRoutes;
