import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { AppConfig } from './infrastructure/config';
import { errorHandler, corsMiddleware, logger } from './presentation/middlewares';
import healthRoutes from './presentation/routes/health.routes';
import tokenRoutes from './presentation/routes/token.routes';
import embedRoutes from './presentation/routes/embed.routes';
import proxyRoutes from './presentation/routes/proxy.routes';
import docsRoutes from './presentation/routes/docs.routes';

/**
 * Main application
 */
const app = new Hono();

// Global middleware
app.use('*', logger);
app.use('*', corsMiddleware);

// Handle all OPTIONS requests (preflight)
app.options('*', (c) => {
  return c.text('', 200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With, Accept, Origin',
    'Access-Control-Max-Age': '86400',
  });
});

// Routes
app.route('/health', healthRoutes);
app.route('/api/token', tokenRoutes);
app.route('/api/embed', embedRoutes);
app.route('/', embedRoutes); // For /view/:token routes
app.route('/api/proxy', proxyRoutes);
app.route('/api', docsRoutes); // API documentation

// Root endpoint
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      message: 'Neo4j Embed Service API',
      version: AppConfig.app.version,
      environment: AppConfig.app.env,
      endpoints: {
        health: '/health',
        generateToken: 'POST /api/token/generate',
        createEmbed: 'POST /api/embed',
        viewEmbed: 'GET /view/:token',
        proxyQuery: 'POST /api/proxy/query',
        docs: '/api (API Documentation)',
      },
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
    },
    404
  );
});

// Error handler (must be last)
app.onError(errorHandler);

// Start server
const port = AppConfig.app.port;
const host = AppConfig.app.host;

// eslint-disable-next-line no-console
console.log(`🚀 Server starting on ${host}:${port}`);
// eslint-disable-next-line no-console
console.log(`📦 Environment: ${AppConfig.app.env}`);
// eslint-disable-next-line no-console
console.log(`🗄️  Database: ${AppConfig.database.database}`);

serve(
  {
    fetch: app.fetch.bind(app),
    port,
    hostname: host,
  },
  () => {
    // Server started callback
    // eslint-disable-next-line no-console
    console.log(`✅ Server running at http://${host}:${port}`);
  }
);
