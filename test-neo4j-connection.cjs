// Quick test Neo4j connection
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'bolt://127.0.0.1:7687',
  neo4j.auth.basic('neo4j', 'Anhminh123'),
  { database: 'mydb' }
);

async function test() {
  try {
    console.log('Testing Neo4j connection...');
    await driver.verifyConnectivity();
    console.log('✅ Connected successfully!');
    
    const session = driver.session({ database: 'mydb' });
    const result = await session.run('MATCH (n) RETURN count(n) as count');
    console.log(`✅ Node count: ${result.records[0].get('count')}`);
    await session.close();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await driver.close();
  }
}

test();
