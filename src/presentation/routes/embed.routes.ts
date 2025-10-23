import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { AppConfig } from '../../infrastructure/config';
import { neo4jClient } from '../../infrastructure/database';

const embedRouter = new Hono();

/**
 * GET /embed/:token
 * Serve embed viewer HTML
 */
embedRouter.get('/:token', serveStatic({ root: './public', path: '/embed.html' }));

/**
 * GET /api/embed/config/:token
 * Get visualization configuration for embed viewer
 */
embedRouter.get('/api/embed/config/:token', async (c) => {
  const { token } = c.req.param();

  try {
    // Define the expected response structure
    interface VisualizationNode {
      properties?: {
        id: string;
        cypherQuery: string;
        visualizationType: string;
        config: string;
      };
      id?: string;
      cypherQuery?: string;
      visualizationType?: string;
      config?: string;
    }

    interface QueryResult {
      v: VisualizationNode;
      t: {
        status: string;
        expiresAt: string;
      };
    }

    // Verify token exists and is valid
    const result = await neo4jClient.read<QueryResult>(
      `MATCH (t:EmbedToken {token: $token})
       WHERE t.status = 'active' AND datetime(t.expiresAt) > datetime()
       MATCH (v:Visualization {id: t.visualizationId})
       RETURN v, t`,
      { token }
    );

    if (!result || result.length === 0) {
      return c.json({ error: 'Invalid or expired token' }, 404);
    }

    const visualization = result[0];
    if (!visualization?.v) {
      return c.json({ error: 'Visualization not found' }, 404);
    }

    // Get properties from either properties object or direct properties
    const vNode = visualization.v;
    const vProps = vNode.properties || vNode;

    // Convert neo4j:// to bolt:// for neovis.js compatibility
    const neo4jUrl = AppConfig.database.uri.replace('neo4j://', 'bolt://');

    return c.json({
      cypherQuery: vProps.cypherQuery as string,
      visualizationType: vProps.visualizationType as string,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      config: JSON.parse((vProps.config as string) || '{}'),
      neo4jUrl,
      neo4jUser: AppConfig.database.user,
      neo4jPassword: AppConfig.database.password,
      neo4jDatabase: AppConfig.database.database,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading embed config:', error);
    return c.json({ error: 'Failed to load visualization' }, 500);
  }
});

export default embedRouter;
