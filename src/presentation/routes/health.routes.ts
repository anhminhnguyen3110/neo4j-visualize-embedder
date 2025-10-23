import { Hono } from 'hono';
import { HealthController } from '../controllers/HealthController';

/**
 * Health check routes
 */
const healthRoutes = new Hono();

healthRoutes.get('/', (c) => HealthController.check(c));

export default healthRoutes;
