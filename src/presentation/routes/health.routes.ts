import { Hono } from 'hono';
import { HealthController } from '../controllers/HealthController';

const healthRoutes = new Hono();

healthRoutes.get('/', (c) => HealthController.check(c));

export default healthRoutes;
