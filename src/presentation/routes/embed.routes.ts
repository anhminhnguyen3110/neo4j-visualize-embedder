import { Hono } from 'hono';
import { EmbedController } from '../controllers';
import { jwtAuth } from '../middlewares';

const embedRoutes = new Hono();

embedRoutes.post('/', jwtAuth, (c) => EmbedController.create(c));

embedRoutes.get('/view/:token', (c) => EmbedController.view(c));

export default embedRoutes;
