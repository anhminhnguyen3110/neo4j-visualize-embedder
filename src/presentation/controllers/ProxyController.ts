import { Context } from 'hono';
import { EmbedTokenRepository } from '@infrastructure/repositories';
import { neo4jQueryService } from '@infrastructure/services';

interface ProxyQueryRequest {
  token: string;
}

/**
 * Proxy Controller
 * Executes Cypher queries on behalf of the browser
 */
export class ProxyController {
  /**
   * Execute a Cypher query via proxy
   * POST /api/proxy/query
   */
  static async executeQuery(c: Context): Promise<Response> {
    try {
      const body = await c.req.json<ProxyQueryRequest>();
      const { token } = body;

      if (!token) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Token is required',
            },
          },
          400
        );
      }

      // Validate embedToken from SQLite
      const embedToken = EmbedTokenRepository.findByToken(token);

      if (!embedToken) {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid embed token',
            },
          },
          401
        );
      }

      // Check if expired
      if (embedToken.isExpired()) {
        return c.json(
          {
            success: false,
            error: {
              code: 'TOKEN_EXPIRED',
              message: `Embed token expired at ${embedToken.expiresAt.toISOString()}`,
            },
          },
          401
        );
      }

      // Execute Cypher query from database
      const graphData = await neo4jQueryService.executeQuery(embedToken.cypherQuery);

      return c.json({
        success: true,
        data: graphData,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'QUERY_EXECUTION_FAILED',
            message: error instanceof Error ? error.message : 'Failed to execute query',
          },
        },
        500
      );
    }
  }
}
