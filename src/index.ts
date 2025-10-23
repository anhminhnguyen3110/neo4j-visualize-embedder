import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { AppConfig } from './infrastructure/config';
import { errorHandler, corsMiddleware, logger } from './presentation/middlewares';
import healthRoutes from './presentation/routes/health.routes';
import embedRoutes from './presentation/routes/embed.routes';
import proxyRoutes from './presentation/routes/proxy.routes';

/**
 * Main application
 */
const app = new Hono();

// Global middleware
app.use('*', logger);
app.use('*', corsMiddleware);

// Serve static files
app.use('/public/*', serveStatic({ root: './' }));

// Routes
app.route('/health', healthRoutes);
app.route('/embed', embedRoutes);
app.route('/api/proxy', proxyRoutes);
app.route('/', embedRoutes); // For /api/embed/config routes

// Root endpoint
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      message: 'Neovis Embed Service API',
      version: AppConfig.app.version,
      environment: AppConfig.app.env,
      endpoints: {
        health: '/health',
        docs: '/api-docs',
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
