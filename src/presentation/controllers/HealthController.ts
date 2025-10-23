import { Context } from 'hono';
import { neo4jClient } from '@infrastructure/database';
import { AppConfig } from '@infrastructure/config';

/**
 * Health check controller
 */
export class HealthController {
  /**
   * GET /health
   * Check application health and database connectivity
   */
  static async check(c: Context) {
    const startTime = Date.now();

    // Check Neo4j connectivity
    const isDbConnected = await neo4jClient.verifyConnectivity();

    // Get database info if connected
    let dbInfo = null;
    if (isDbConnected) {
      try {
        dbInfo = await neo4jClient.getServerInfo();
      } catch {
        // Ignore errors getting server info
        dbInfo = null;
      }
    }

    const responseTime = Date.now() - startTime;

    const healthStatus = {
      success: true,
      data: {
        status: isDbConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        service: {
          name: AppConfig.app.name,
          version: AppConfig.app.version,
          environment: AppConfig.app.env,
        },
        database: {
          connected: isDbConnected,
          type: 'Neo4j',
          database: AppConfig.database.database,
          info: dbInfo,
        },
      },
    };

    return c.json(healthStatus, isDbConnected ? 200 : 503);
  }
}
