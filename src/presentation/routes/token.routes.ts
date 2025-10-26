import { Hono } from 'hono';
import { TokenController } from '../controllers';

const tokenRoutes = new Hono();

tokenRoutes.post('/generate', (c) => TokenController.generate(c));

export default tokenRoutes;
