/**
 * Integration Test Script - Generate Embed URL
 * 
 * This script:
 * 1. Creates a test user
 * 2. Creates a visualization with Movie/Actor query
 * 3. Generates an embed token
 * 4. Returns the embed URL for testing
 * 
 * Usage: pnpm test:embed
 */

import { neo4jClient } from '../infrastructure/database';
import { AppConfig } from '../infrastructure/config';
import { PasswordService } from '../infrastructure/services/PasswordService';
import { JWTService } from '../infrastructure/services/JWTService';
import { v4 as uuidv4 } from 'uuid';

async function main(): Promise<void> {
  console.log('🚀 Starting embed URL generation test...\n');

  try {
    // Step 1: Create test user
    console.log('👤 Creating test user...');
    const userId = uuidv4();
    const email = `test-embed-${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const passwordHash = await PasswordService.hashPassword(password);

    await neo4jClient.write(
      `CREATE (u:User {
        id: $id,
        email: $email,
        passwordHash: $passwordHash,
        role: 'user',
        apiKey: null,
        isActive: true,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })`,
      {
        id: userId,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log(`✅ User created: ${email}\n`);

    // Step 2: Create visualization
    console.log('🎨 Creating visualization...');
    const visualizationId = uuidv4();
    const cypherQuery = `MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p, r, m LIMIT 25`;

    await neo4jClient.write(
      `CREATE (v:Visualization {
        id: $id,
        userId: $userId,
        name: $name,
        description: $description,
        cypherQuery: $cypherQuery,
        visualizationType: $visualizationType,
        config: $config,
        isPublic: true,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })`,
      {
        id: visualizationId,
        userId,
        name: 'Movie Actors Network',
        description: 'Graph showing actors and their movies from the sample dataset',
        cypherQuery,
        visualizationType: 'force_directed',
        config: JSON.stringify({
          layout: 'force_directed',
          nodeSize: 30,
          edgeWidth: 2,
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log('✅ Visualization created: Movie Actors Network\n');

    // Step 3: Generate embed token (JWT)
    console.log('🔑 Generating embed token...');
    const tokenId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    // Generate JWT token
    const jwtToken = JWTService.generateToken({
      tokenId,
      visualizationId,
      userId,
      type: 'embed',
    });

    // Store token in Neo4j
    await neo4jClient.write(
      `CREATE (t:EmbedToken {
        id: $id,
        visualizationId: $visualizationId,
        token: $token,
        allowedDomains: $allowedDomains,
        expiresAt: $expiresAt,
        status: 'active',
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })`,
      {
        id: tokenId,
        visualizationId,
        token: jwtToken,
        allowedDomains: JSON.stringify(['*']), // Allow all domains for testing
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log('✅ Embed token generated\n');

    // Step 4: Generate embed URL
    const baseUrl = `http://localhost:${AppConfig.app.port}`;
    const embedUrl = `${baseUrl}/embed/${jwtToken}`;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Embed URL generated:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📋 Embed URL:\n${embedUrl}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Test Details:');
    console.log(`   User ID: ${userId}`);
    console.log(`   User Email: ${email}`);
    console.log(`   Visualization ID: ${visualizationId}`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Expires: ${expiresAt.toLocaleString()}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Make sure your server is running: pnpm dev');
    console.log('   2. Copy the embed URL above');
    console.log('   3. Open it in your browser');
    console.log('   4. You should see the Movie Actors graph visualization');
    console.log('\n🧹 Cleanup:');
    console.log('   Run: pnpm seed:clean to remove all test data\n');

    // Verify data was created
    console.log('🔍 Verifying data in Neo4j...');
    const counts = await neo4jClient.read<{
      users: number;
      visualizations: number;
      tokens: number;
    }>(
      `MATCH (u:User {id: $userId})
       OPTIONAL MATCH (v:Visualization {id: $visualizationId})
       OPTIONAL MATCH (t:EmbedToken {id: $tokenId})
       RETURN 
         count(DISTINCT u) as users,
         count(DISTINCT v) as visualizations,
         count(DISTINCT t) as tokens`,
      { userId, visualizationId, tokenId }
    );

    const result = counts[0];
    if (result) {
      console.log(`✅ Verification: ${result.users} user, ${result.visualizations} visualization, ${result.tokens} token\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await neo4jClient.close();
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
