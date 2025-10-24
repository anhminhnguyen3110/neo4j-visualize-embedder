import neo4j, { Driver, Session } from 'neo4j-driver';
import { AppConfig } from '../config';

export interface Neo4jNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface Neo4jRelationship {
  id: string;
  type: string;
  startNode: string;
  endNode: string;
  properties: Record<string, unknown>;
}

export interface GraphData {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
}

/**
 * Neo4j Query Service - READ-ONLY operations
 */
export class Neo4jQueryService {
  private static instance: Neo4jQueryService;
  private readonly driver: Driver;

  private constructor() {
    this.driver = neo4j.driver(
      AppConfig.database.uri,
      neo4j.auth.basic(AppConfig.database.user, AppConfig.database.password),
      {
        maxConnectionLifetime: 30 * 60 * 1000, // 30 minutes
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
      }
    );
  }

  public static getInstance(): Neo4jQueryService {
    if (!Neo4jQueryService.instance) {
      Neo4jQueryService.instance = new Neo4jQueryService();
    }
    return Neo4jQueryService.instance;
  }

  /**
   * Execute a READ-ONLY Cypher query
   */
  async executeQuery(cypher: string, params: Record<string, unknown> = {}): Promise<GraphData> {
    const session: Session = this.driver.session({
      defaultAccessMode: neo4j.session.READ,
    });

    try {
      const result = await session.run(cypher, params);

      const nodes = new Map<string, Neo4jNode>();
      const relationships: Neo4jRelationship[] = [];

      for (const record of result.records) {
        for (const value of record.values()) {
          // Handle Node
          if (neo4j.isNode(value)) {
            const nodeId = value.identity.toString();
            if (!nodes.has(nodeId)) {
              nodes.set(nodeId, {
                id: nodeId,
                labels: value.labels,
                properties: this.serializeProperties(value.properties),
              });
            }
          }

          // Handle Relationship
          if (neo4j.isRelationship(value)) {
            relationships.push({
              id: value.identity.toString(),
              type: value.type,
              startNode: value.start.toString(),
              endNode: value.end.toString(),
              properties: this.serializeProperties(value.properties),
            });

            // Ensure start and end nodes are in the nodes map
            // (they might not be if query returns only relationships)
          }

          // Handle Path
          if (neo4j.isPath(value)) {
            for (const segment of value.segments) {
              const startNodeId = segment.start.identity.toString();
              const endNodeId = segment.end.identity.toString();

              if (!nodes.has(startNodeId)) {
                nodes.set(startNodeId, {
                  id: startNodeId,
                  labels: segment.start.labels,
                  properties: this.serializeProperties(segment.start.properties),
                });
              }

              if (!nodes.has(endNodeId)) {
                nodes.set(endNodeId, {
                  id: endNodeId,
                  labels: segment.end.labels,
                  properties: this.serializeProperties(segment.end.properties),
                });
              }

              relationships.push({
                id: segment.relationship.identity.toString(),
                type: segment.relationship.type,
                startNode: startNodeId,
                endNode: endNodeId,
                properties: this.serializeProperties(segment.relationship.properties),
              });
            }
          }
        }
      }

      return {
        nodes: Array.from(nodes.values()),
        relationships,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Verify Neo4j connectivity
   */
  async verifyConnectivity(): Promise<boolean> {
    try {
      await this.driver.verifyConnectivity();
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Neo4j connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Serialize Neo4j properties to JSON-compatible format
   */
  private serializeProperties(properties: Record<string, unknown>): Record<string, unknown> {
    const serialized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (neo4j.isInt(value)) {
        serialized[key] = value.toNumber();
      } else if (neo4j.isDate(value) || neo4j.isDateTime(value) || neo4j.isTime(value)) {
        serialized[key] = value.toString();
      } else {
        serialized[key] = value;
      }
    }

    return serialized;
  }

  /**
   * Close driver connection
   */
  async close(): Promise<void> {
    await this.driver.close();
  }
}

export const neo4jQueryService = Neo4jQueryService.getInstance();
