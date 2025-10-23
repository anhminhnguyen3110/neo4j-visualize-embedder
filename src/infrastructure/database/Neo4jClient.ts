import neo4j, { Driver, Session } from 'neo4j-driver';
import { AppConfig } from '../config/AppConfig';

/**
 * Neo4j Database Client
 * Handles connection pooling and session management
 */
export class Neo4jClient {
  private static instance: Neo4jClient;
  private readonly driver: Driver;

  private constructor() {
    this.driver = neo4j.driver(
      AppConfig.database.uri,
      neo4j.auth.basic(AppConfig.database.user, AppConfig.database.password),
      {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 30000,
        maxTransactionRetryTime: 30000,
      }
    );
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Neo4jClient {
    if (!Neo4jClient.instance) {
      Neo4jClient.instance = new Neo4jClient();
    }
    return Neo4jClient.instance;
  }

  /**
   * Get a new session
   */
  public getSession(): Session {
    return this.driver.session({
      database: AppConfig.database.database,
    });
  }

  /**
   * Execute a read transaction
   */
  public async read<T>(
    cypher: string,
    params: Record<string, unknown> = {}
  ): Promise<T[]> {
    const session = this.getSession();
    try {
      const result = await session.executeRead((tx: { run: (cypher: string, params: Record<string, unknown>) => Promise<{ records: Array<{ toObject: () => T }> }> }) => tx.run(cypher, params));
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }

  /**
   * Execute a write transaction
   */
  public async write<T>(
    cypher: string,
    params: Record<string, unknown> = {}
  ): Promise<T[]> {
    const session = this.getSession();
    try {
      const result = await session.executeWrite((tx: { run: (cypher: string, params: Record<string, unknown>) => Promise<{ records: Array<{ toObject: () => T }> }> }) => tx.run(cypher, params));
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }

  /**
   * Verify connectivity to database
   */
  public async verifyConnectivity(): Promise<boolean> {
    const session = this.getSession();
    try {
      await session.run('RETURN 1');
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Neo4j connectivity check failed:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  /**
   * Get driver info
   */
  public async getServerInfo() {
    const session = this.getSession();
    try {
      const result = await session.run('CALL dbms.components() YIELD name, versions, edition');
      return result.records.map((record: { get: (key: string) => string }) => ({
        name: record.get('name'),
        versions: record.get('versions'),
        edition: record.get('edition'),
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Close driver connection
   */
  public async close(): Promise<void> {
    await this.driver.close();
  }

  /**
   * Get the underlying driver (for advanced use cases)
   */
  public getDriver(): Driver {
    return this.driver;
  }
}

// Export singleton instance
export const neo4jClient = Neo4jClient.getInstance();
