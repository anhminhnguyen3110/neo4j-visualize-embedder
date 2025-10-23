/**
 * Cleanup Script - Remove all sample data from Neo4j
 * Run: pnpm seed:clean
 */

import { neo4jClient } from '../infrastructure/database';

async function cleanup() {
  console.log('🗑️  Starting cleanup...');

  try {
    // Delete all test data
    console.log('Deleting Movies and People...');
    await neo4jClient.write(`MATCH (p:Person) DETACH DELETE p`);
    await neo4jClient.write(`MATCH (m:Movie) DETACH DELETE m`);

    // Delete all test users (keep production users safe by checking email pattern)
    console.log('Deleting test users...');
    await neo4jClient.write(
      `MATCH (u:User) WHERE u.email STARTS WITH 'test' DETACH DELETE u`
    );

    // Delete all visualizations and embed tokens
    console.log('Deleting visualizations and embed tokens...');
    await neo4jClient.write(`MATCH (v:Visualization) DETACH DELETE v`);
    await neo4jClient.write(`MATCH (t:EmbedToken) DETACH DELETE t`);

    // Verify cleanup
    const movieCount = await neo4jClient.read<{ count: number }>(
      `MATCH (m:Movie) RETURN count(m) as count`
    );
    const personCount = await neo4jClient.read<{ count: number }>(
      `MATCH (p:Person) RETURN count(p) as count`
    );

    console.log('\n📊 Remaining Data:');
    console.log(`   Movies: ${movieCount[0]?.count || 0}`);
    console.log(`   People: ${personCount[0]?.count || 0}`);

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await neo4jClient.close();
  }
}

// Run if called directly
if (require.main === module) {
  cleanup()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { cleanup };
