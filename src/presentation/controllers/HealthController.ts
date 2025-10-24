import { Context } from 'hono';
import { neo4jQueryService } from '@infrastructure/services';
import { sqliteClient } from '@infrastructure/database';
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
    const isNeo4jConnected = await neo4jQueryService.verifyConnectivity();

    // Check SQLite connectivity
    const isSQLiteConnected = sqliteClient.verifyConnectivity();

    const responseTime = Date.now() - startTime;

    const healthStatus = {
      success: true,
      data: {
        status: isNeo4jConnected && isSQLiteConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        service: {
          name: AppConfig.app.name,
          version: AppConfig.app.version,
          environment: AppConfig.app.env,
        },
        databases: {
          neo4j: {
            connected: isNeo4jConnected,
            uri: AppConfig.database.uri,
            database: AppConfig.database.database,
          },
          sqlite: {
            connected: isSQLiteConnected,
            path: AppConfig.sql.path,
          },
        },
      },
    };

    const isHealthy = isNeo4jConnected && isSQLiteConnected;
    return c.json(healthStatus, isHealthy ? 200 : 503);
  }
}
