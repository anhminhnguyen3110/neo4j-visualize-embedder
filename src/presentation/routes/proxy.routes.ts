import { Hono } from 'hono';
import { ProxyController } from '../controllers';

const proxyRouter = new Hono();

/**
 * POST /api/proxy/query
 * Execute a Cypher query through the proxy
 */
proxyRouter.post('/query', (c) => ProxyController.executeQuery(c));

export default proxyRouter;
