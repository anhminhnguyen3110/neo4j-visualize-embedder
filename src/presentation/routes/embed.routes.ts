import { Hono } from 'hono';
import { EmbedController } from '../controllers';
import { jwtAuth } from '../middlewares';

const embedRoutes = new Hono();

/**
 * POST /api/embed
 * Create a new embed URL (requires JWT)
 */
embedRoutes.post('/', jwtAuth, (c) => EmbedController.create(c));

/**
 * GET /view/:token
 * View embed visualization (public, no auth)
 */
embedRoutes.get('/view/:token', (c) => EmbedController.view(c));

export default embedRoutes;
