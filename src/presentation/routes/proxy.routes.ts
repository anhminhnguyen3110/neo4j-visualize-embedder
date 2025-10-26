import { Hono } from 'hono';
import { ProxyController } from '../controllers';

const proxyRouter = new Hono();

proxyRouter.post('/query', (c) => ProxyController.executeQuery(c));

export default proxyRouter;
