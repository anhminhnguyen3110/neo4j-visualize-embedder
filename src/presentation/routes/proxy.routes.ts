import { Hono } from 'hono';
import { Neo4jProxyController } from '../controllers/Neo4jProxyController';

const proxyRouter = new Hono();

/**
 * POST /api/proxy/neo4j
 * Execute a Cypher query through the proxy
 */
proxyRouter.post('/neo4j', (c) => Neo4jProxyController.executeQuery(c));

export default proxyRouter;
