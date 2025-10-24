import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { openApiSpec } from '../openapi/spec';

const docsRouter = new Hono();

docsRouter.get('/openapi.json', (c) => {
  return c.json(openApiSpec);
});

docsRouter.get('/swagger', swaggerUI({ url: '/api/openapi.json' }));

export default docsRouter;
