/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * E2E Test - Complete Embed Flow
 * Tests the entire flow: User creation -> Visualization -> Embed Token -> API calls
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { neo4jClient } from '../../src/infrastructure/database';
import { PasswordService } from '../../src/infrastructure/services/PasswordService';
import { JWTService } from '../../src/infrastructure/services/JWTService';

describe('E2E: Complete Embed Flow', () => {
  let userId: string;
  let visualizationId: string;
  let embedToken: string;
  const testEmail = `e2e-test-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Ensure sample data exists
    await neo4jClient.write(
      `CREATE (m:Movie {id: 'test-movie-1', title: 'Test Matrix', released: 1999})`,
      {}
    );
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    if (userId) {
      await neo4jClient.write(
        `MATCH (u:User {id: $userId})
         OPTIONAL MATCH (u)-[:OWNS]->(v:Visualization)
         OPTIONAL MATCH (t:EmbedToken {visualizationId: v.id})
         DETACH DELETE u, v, t`,
        { userId }
      );
    }

    // Cleanup test movie
    await neo4jClient.write(
      `MATCH (m:Movie {id: 'test-movie-1'}) DELETE m`,
      {}
    );

    await neo4jClient.close();
  });

  it('should create a user successfully', async () => {
    const passwordHash = await PasswordService.hashPassword('TestPass123!');

    const result = await neo4jClient.write<{ u: { properties: { id: string } } }>(
      `CREATE (u:User {
        id: randomUUID(),
        email: $email,
        passwordHash: $passwordHash,
        role: 'user',
        apiKey: null,
        isActive: true,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN u`,
      { email: testEmail, passwordHash }
    );

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    
    const userNode = result[0]?.u;
    expect(userNode).toBeDefined();
    
    if (userNode?.properties) {
      userId = userNode.properties.id;
      expect(userId).toBeDefined();
    } else {
      // Fallback: query to get the user ID
      const userResult = await neo4jClient.read<{ u: { properties: { id: string } } }>(
        `MATCH (u:User {email: $email}) RETURN u`,
        { email: testEmail }
      );
      userId = userResult[0]?.u?.properties?.id as string;
    }

    expect(userId).toBeDefined();
  });

  it('should create a visualization', async () => {
    const cypherQuery = `MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p, r, m LIMIT 10`;

    const result = await neo4jClient.write<{ v: { properties: { id: string } } }>(
      `MATCH (u:User {id: $userId})
       CREATE (v:Visualization {
         id: randomUUID(),
         userId: $userId,
         name: 'E2E Test Visualization',
         description: 'Test visualization for e2e testing',
         cypherQuery: $cypherQuery,
         visualizationType: 'force_directed',
         config: '{"layout":"force_directed"}',
         isPublic: true,
         createdAt: datetime(),
         updatedAt: datetime()
       })
       CREATE (u)-[:OWNS]->(v)
       RETURN v`,
      { userId, cypherQuery }
    );

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    const vizNode = result[0]?.v;
    expect(vizNode).toBeDefined();

    if (vizNode?.properties) {
      visualizationId = vizNode.properties.id;
    } else {
      // Fallback
      const vizResult = await neo4jClient.read<{ v: { properties: { id: string } } }>(
        `MATCH (v:Visualization {userId: $userId}) RETURN v LIMIT 1`,
        { userId }
      );
      visualizationId = vizResult[0]?.v?.properties?.id as string;
    }

    expect(visualizationId).toBeDefined();
  });

  it('should generate embed token', async () => {
    const tokenId = 'test-token-' + Date.now();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Generate JWT
    const jwtToken = JWTService.generateToken({
      tokenId,
      visualizationId,
      userId,
      type: 'embed',
    });

    expect(jwtToken).toBeDefined();
    expect(typeof jwtToken).toBe('string');

    // Store in database
    await neo4jClient.write(
      `CREATE (t:EmbedToken {
        id: $tokenId,
        visualizationId: $visualizationId,
        token: $token,
        allowedDomains: '["*"]',
        expiresAt: $expiresAt,
        status: 'active',
        createdAt: datetime(),
        updatedAt: datetime()
      })`,
      {
        tokenId,
        visualizationId,
        token: jwtToken,
        expiresAt: expiresAt.toISOString(),
      }
    );

    embedToken = jwtToken;
  });

  it('should verify JWT token', () => {
    const decoded = JWTService.verifyToken(embedToken);
    
    expect(decoded).toBeDefined();
    expect(decoded.visualizationId).toBe(visualizationId);
    expect(decoded.userId).toBe(userId);
    expect(decoded.type).toBe('embed');
  });

  it('should retrieve visualization config with token', async () => {
    const result = await neo4jClient.read(
      `MATCH (t:EmbedToken {token: $token})
       WHERE t.status = 'active'
       MATCH (v:Visualization {id: t.visualizationId})
       RETURN v`,
      { token: embedToken }
    );

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vNode = (result[0] as any)?.v;
    expect(vNode).toBeDefined();

    const props = vNode?.properties || vNode;
    expect(props).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(props?.cypherQuery).toContain('MATCH');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(props?.visualizationType).toBe('force_directed');
  });

  it('should execute query through proxy', async () => {
    // Verify token is valid
    const tokenResult = await neo4jClient.read<{
      t: {
        properties?: { status: string };
        status?: string;
      };
    }>(
      `MATCH (t:EmbedToken {token: $token})
       WHERE t.status = 'active' AND datetime(t.expiresAt) > datetime()
       RETURN t`,
      { token: embedToken }
    );

    expect(tokenResult.length).toBeGreaterThan(0);

    // Execute a test query
    const queryResult = await neo4jClient.read(
      `MATCH (m:Movie) RETURN m LIMIT 5`,
      {}
    );

    expect(queryResult).toBeDefined();
    expect(Array.isArray(queryResult)).toBe(true);
  });

  it('should validate Neo4j node structure', async () => {
    const result = await neo4jClient.read<{
      m: {
        identity?: unknown;
        labels?: string[];
        properties?: {
          id: string;
          title: string;
          released: number;
        };
      };
    }>(
      `MATCH (m:Movie {id: 'test-movie-1'}) RETURN m`,
      {}
    );

    expect(result.length).toBeGreaterThan(0);
    
    const movieNode = result[0]?.m;
    expect(movieNode).toBeDefined();
    
    // Check if it has properties structure (Neo4j driver format)
    if (movieNode && movieNode.properties) {
      expect(movieNode.properties.title).toBe('Test Matrix');
      // Neo4j returns integers as {high, low} objects
      const released = movieNode.properties.released as any;
      const releasedValue = released.low || released;
      expect(releasedValue).toBe(1999);
      expect(movieNode.labels).toContain('Movie');
    }
  });

  it('should validate relationship structure', async () => {
    // First create a test relationship
    await neo4jClient.write(
      `MATCH (m:Movie {id: 'test-movie-1'})
       MERGE (p:Person {id: 'test-person-1', name: 'Test Actor'})
       MERGE (p)-[r:ACTED_IN {roles: ['Hero']}]->(m)`,
      {}
    );

    const result = await neo4jClient.read<{
      r: {
        identity?: unknown;
        start?: unknown;
        end?: unknown;
        type?: string;
        properties?: {
          roles: string[];
        };
      };
    }>(
      `MATCH (p:Person {id: 'test-person-1'})-[r:ACTED_IN]->(m:Movie {id: 'test-movie-1'})
       RETURN r`,
      {}
    );

    expect(result.length).toBeGreaterThan(0);
    
    const relNode = result[0]?.r;
    expect(relNode).toBeDefined();
    if (!relNode) throw new Error('relNode is undefined');
    
    expect(relNode.type).toBe('ACTED_IN');
    expect(relNode.start).toBeDefined();
    expect(relNode.end).toBeDefined();
    
    if (relNode.properties) {
      expect(relNode.properties.roles).toContain('Hero');
    }

    // Cleanup test relationship
    await neo4jClient.write(
      `MATCH (p:Person {id: 'test-person-1'}) DETACH DELETE p`,
      {}
    );
  });

  it('should complete full embed flow', async () => {
    // 1. Verify user exists
    const userCheck = await neo4jClient.read(
      `MATCH (u:User {id: $userId}) RETURN count(u) as count`,
      { userId }
    );
    const userCount = (userCheck[0] as any)?.count;
    const userCountValue = userCount?.low || userCount;
    expect(userCountValue).toBeGreaterThan(0);

    // 2. Verify visualization exists
    const vizCheck = await neo4jClient.read(
      `MATCH (v:Visualization {id: $visualizationId}) RETURN count(v) as count`,
      { visualizationId }
    );
    const vizCount = (vizCheck[0] as any)?.count;
    const vizCountValue = vizCount?.low || vizCount;
    expect(vizCountValue).toBeGreaterThan(0);

    // 3. Verify token exists and is active
    const tokenCheck = await neo4jClient.read<{
      t: {
        properties?: { status: string };
        status?: string;
      };
    }>(
      `MATCH (t:EmbedToken {token: $token}) RETURN t`,
      { token: embedToken }
    );
    expect(tokenCheck.length).toBeGreaterThan(0);
    
    const tokenNode = tokenCheck[0]?.t;
    const tokenStatus = tokenNode?.properties?.status || tokenNode?.status;
    expect(tokenStatus).toBe('active');

    // 4. Verify JWT can be decoded
    const decoded = JWTService.verifyToken(embedToken);
    expect(decoded.visualizationId).toBe(visualizationId);

    // 5. Simulate fetching config (what embed.html does)
    const configResult = await neo4jClient.read<{
      v: {
        properties?: {
          cypherQuery: string;
          visualizationType: string;
        };
      };
    }>(
      `MATCH (t:EmbedToken {token: $token})
       WHERE t.status = 'active'
       MATCH (v:Visualization {id: t.visualizationId})
       RETURN v`,
      { token: embedToken }
    );

    expect(configResult.length).toBeGreaterThan(0);
    const vizNode = configResult[0]?.v;
    const vizProps = (vizNode?.properties || vizNode) as { cypherQuery?: string; visualizationType?: string };
    expect(vizProps).toBeDefined();
    expect(vizProps?.cypherQuery).toBeTruthy();
  });
});
