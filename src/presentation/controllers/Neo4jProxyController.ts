import { Context } from 'hono';
import { neo4jClient } from '../../infrastructure/database';

interface ProxyQueryRequest {
  token: string;
  query: string;
  params?: Record<string, unknown>;
}

/**
 * Neo4j Proxy Controller
 * Executes Cypher queries on behalf of the browser
 */
export class Neo4jProxyController {
  /**
   * Execute a Cypher query
   */
  static async executeQuery(c: Context): Promise<Response> {
    try {
      const body = await c.req.json<ProxyQueryRequest>();
      const { token, query, params = {} } = body;

      if (!token || !query) {
        return c.json({ error: 'Token and query are required' }, 400);
      }

      // Verify token exists and is valid
      const tokenResult = await neo4jClient.read<{
        t: {
          status: string;
          expiresAt: string;
          visualizationId: string;
        };
      }>(
        `MATCH (t:EmbedToken {token: $token})
         WHERE t.status = 'active' AND datetime(t.expiresAt) > datetime()
         RETURN t`,
        { token }
      );

      if (!tokenResult || tokenResult.length === 0) {
        return c.json({ error: 'Invalid or expired token' }, 401);
      }

      // Execute the query
      const result = await neo4jClient.read(query, params);

      // Transform Neo4j result to JSON-serializable format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const records = result.map((record: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const obj: Record<string, any> = {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.keys(record).forEach((key) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const value = record[key];
          
          // Handle Neo4j node objects
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (value && typeof value === 'object' && value.labels) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            obj[key] = {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              identity: value.identity?.toString(),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              labels: value.labels,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              properties: value.properties,
            };
          }
          // Handle Neo4j relationship objects
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          else if (value && typeof value === 'object' && value.type) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            obj[key] = {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              identity: value.identity?.toString(),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              type: value.type,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              start: value.start?.toString(),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              end: value.end?.toString(),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              properties: value.properties,
            };
          }
          // Handle integers
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          else if (value && typeof value === 'object' && value.low !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            obj[key] = value.toNumber ? value.toNumber() : value.low;
          }
          // Handle regular values
          else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            obj[key] = value;
          }
        });
        return obj;
      });

      return c.json({
        success: true,
        records,
        count: records.length,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Proxy query error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return c.json({ error: 'Query execution failed', details: errorMessage }, 500);
    }
  }
}
