/**
 * Seed Neo4j database with sample movie data
 * Run: npm run seed
 */
import neo4j, { Driver } from 'neo4j-driver';
import { env } from '../infrastructure/config/env';

const driver: Driver = neo4j.driver(
  env.NEO4J_URI,
  neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD)
);

async function seedDatabase() {
  const session = driver.session({ database: env.NEO4J_DATABASE });

  try {
    console.log('🌱 Starting Neo4j database seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');

    // Create Movies
    console.log('🎬 Creating movies...');
    await session.run(`
      CREATE (m1:Movie {title: 'The Matrix', released: 1999, tagline: 'Welcome to the Real World'})
      CREATE (m2:Movie {title: 'The Matrix Reloaded', released: 2003, tagline: 'Free your mind'})
      CREATE (m3:Movie {title: 'The Matrix Revolutions', released: 2003, tagline: 'Everything that has a beginning has an end'})
      CREATE (m4:Movie {title: "The Devil's Advocate", released: 1997, tagline: 'Evil has its winning ways'})
      CREATE (m5:Movie {title: 'A Few Good Men', released: 1992, tagline: "You can't handle the truth!"})
      CREATE (m6:Movie {title: 'Top Gun', released: 1986, tagline: 'I feel the need, the need for speed'})
      CREATE (m7:Movie {title: 'Jerry Maguire', released: 2000, tagline: 'Show me the money!'})
      CREATE (m8:Movie {title: 'Stand By Me', released: 1986, tagline: "For some, it's the last real taste of innocence"})
      CREATE (m9:Movie {title: 'As Good as It Gets', released: 1997, tagline: 'A comedy from the heart'})
      CREATE (m10:Movie {title: 'What Dreams May Come', released: 1998, tagline: 'After life there is more'})
    `);

    // Create People
    console.log('👥 Creating people...');
    await session.run(`
      CREATE (p1:Person {name: 'Keanu Reeves', born: 1964})
      CREATE (p2:Person {name: 'Carrie-Anne Moss', born: 1967})
      CREATE (p3:Person {name: 'Laurence Fishburne', born: 1961})
      CREATE (p4:Person {name: 'Hugo Weaving', born: 1960})
      CREATE (p5:Person {name: 'Lilly Wachowski', born: 1967})
      CREATE (p6:Person {name: 'Lana Wachowski', born: 1965})
      CREATE (p7:Person {name: 'Al Pacino', born: 1940})
      CREATE (p8:Person {name: 'Charlize Theron', born: 1975})
      CREATE (p9:Person {name: 'Tom Cruise', born: 1962})
      CREATE (p10:Person {name: 'Jack Nicholson', born: 1937})
      CREATE (p11:Person {name: 'Demi Moore', born: 1962})
      CREATE (p12:Person {name: 'Kevin Bacon', born: 1958})
      CREATE (p13:Person {name: 'Cuba Gooding Jr.', born: 1968})
      CREATE (p14:Person {name: 'Renee Zellweger', born: 1969})
      CREATE (p15:Person {name: 'River Phoenix', born: 1970})
      CREATE (p16:Person {name: 'Corey Feldman', born: 1971})
      CREATE (p17:Person {name: 'Wil Wheaton', born: 1972})
      CREATE (p18:Person {name: 'Helen Hunt', born: 1963})
      CREATE (p19:Person {name: 'Greg Kinnear', born: 1963})
      CREATE (p20:Person {name: 'Robin Williams', born: 1951})
    `);

    // Create ACTED_IN relationships
    console.log('🎭 Creating ACTED_IN relationships...');
    await session.run(`
      MATCH (p:Person {name: 'Keanu Reeves'}), (m:Movie {title: 'The Matrix'})
      CREATE (p)-[:ACTED_IN {roles: ['Neo']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Carrie-Anne Moss'}), (m:Movie {title: 'The Matrix'})
      CREATE (p)-[:ACTED_IN {roles: ['Trinity']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Laurence Fishburne'}), (m:Movie {title: 'The Matrix'})
      CREATE (p)-[:ACTED_IN {roles: ['Morpheus']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Hugo Weaving'}), (m:Movie {title: 'The Matrix'})
      CREATE (p)-[:ACTED_IN {roles: ['Agent Smith']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Keanu Reeves'}), (m:Movie {title: 'The Matrix Reloaded'})
      CREATE (p)-[:ACTED_IN {roles: ['Neo']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Carrie-Anne Moss'}), (m:Movie {title: 'The Matrix Reloaded'})
      CREATE (p)-[:ACTED_IN {roles: ['Trinity']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Laurence Fishburne'}), (m:Movie {title: 'The Matrix Reloaded'})
      CREATE (p)-[:ACTED_IN {roles: ['Morpheus']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Keanu Reeves'}), (m:Movie {title: 'The Matrix Revolutions'})
      CREATE (p)-[:ACTED_IN {roles: ['Neo']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Carrie-Anne Moss'}), (m:Movie {title: 'The Matrix Revolutions'})
      CREATE (p)-[:ACTED_IN {roles: ['Trinity']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Laurence Fishburne'}), (m:Movie {title: 'The Matrix Revolutions'})
      CREATE (p)-[:ACTED_IN {roles: ['Morpheus']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Keanu Reeves'}), (m:Movie {title: "The Devil's Advocate"})
      CREATE (p)-[:ACTED_IN {roles: ['Kevin Lomax']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Al Pacino'}), (m:Movie {title: "The Devil's Advocate"})
      CREATE (p)-[:ACTED_IN {roles: ['John Milton']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Charlize Theron'}), (m:Movie {title: "The Devil's Advocate"})
      CREATE (p)-[:ACTED_IN {roles: ['Mary Ann Lomax']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Tom Cruise'}), (m:Movie {title: 'A Few Good Men'})
      CREATE (p)-[:ACTED_IN {roles: ['Lt. Daniel Kaffee']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Jack Nicholson'}), (m:Movie {title: 'A Few Good Men'})
      CREATE (p)-[:ACTED_IN {roles: ['Col. Nathan R. Jessup']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Demi Moore'}), (m:Movie {title: 'A Few Good Men'})
      CREATE (p)-[:ACTED_IN {roles: ['Lt. Cdr. JoAnne Galloway']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Kevin Bacon'}), (m:Movie {title: 'A Few Good Men'})
      CREATE (p)-[:ACTED_IN {roles: ['Capt. Jack Ross']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Tom Cruise'}), (m:Movie {title: 'Top Gun'})
      CREATE (p)-[:ACTED_IN {roles: ['Maverick']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Tom Cruise'}), (m:Movie {title: 'Jerry Maguire'})
      CREATE (p)-[:ACTED_IN {roles: ['Jerry Maguire']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Cuba Gooding Jr.'}), (m:Movie {title: 'Jerry Maguire'})
      CREATE (p)-[:ACTED_IN {roles: ['Rod Tidwell']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Renee Zellweger'}), (m:Movie {title: 'Jerry Maguire'})
      CREATE (p)-[:ACTED_IN {roles: ['Dorothy Boyd']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'River Phoenix'}), (m:Movie {title: 'Stand By Me'})
      CREATE (p)-[:ACTED_IN {roles: ['Chris Chambers']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Corey Feldman'}), (m:Movie {title: 'Stand By Me'})
      CREATE (p)-[:ACTED_IN {roles: ['Teddy Duchamp']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Wil Wheaton'}), (m:Movie {title: 'Stand By Me'})
      CREATE (p)-[:ACTED_IN {roles: ['Gordie Lachance']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Jack Nicholson'}), (m:Movie {title: 'As Good as It Gets'})
      CREATE (p)-[:ACTED_IN {roles: ['Melvin Udall']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Helen Hunt'}), (m:Movie {title: 'As Good as It Gets'})
      CREATE (p)-[:ACTED_IN {roles: ['Carol Connelly']}]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Greg Kinnear'}), (m:Movie {title: 'As Good as It Gets'})
      CREATE (p)-[:ACTED_IN {roles: ['Simon Bishop']}]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Robin Williams'}), (m:Movie {title: 'What Dreams May Come'})
      CREATE (p)-[:ACTED_IN {roles: ['Chris Nielsen']}]->(m)
    `);

    // Create DIRECTED relationships
    console.log('🎥 Creating DIRECTED relationships...');
    await session.run(`
      MATCH (p:Person {name: 'Lana Wachowski'}), (m:Movie {title: 'The Matrix'})
      CREATE (p)-[:DIRECTED]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Lilly Wachowski'}), (m:Movie {title: 'The Matrix'})
      CREATE (p)-[:DIRECTED]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Lana Wachowski'}), (m:Movie {title: 'The Matrix Reloaded'})
      CREATE (p)-[:DIRECTED]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Lilly Wachowski'}), (m:Movie {title: 'The Matrix Reloaded'})
      CREATE (p)-[:DIRECTED]->(m)
    `);

    await session.run(`
      MATCH (p:Person {name: 'Lana Wachowski'}), (m:Movie {title: 'The Matrix Revolutions'})
      CREATE (p)-[:DIRECTED]->(m)
    `);
    
    await session.run(`
      MATCH (p:Person {name: 'Lilly Wachowski'}), (m:Movie {title: 'The Matrix Revolutions'})
      CREATE (p)-[:DIRECTED]->(m)
    `);

    // Verify data
    console.log('✅ Verifying seeded data...');
    const movieCount = await session.run('MATCH (m:Movie) RETURN count(m) as count');
    const personCount = await session.run('MATCH (p:Person) RETURN count(p) as count');
    const relationshipCount = await session.run('MATCH ()-[r]->() RETURN count(r) as count');

    console.log(`\n📊 Database seeded successfully!`);
    console.log(`   - Movies: ${movieCount.records[0]?.get('count').toNumber() ?? 0}`);
    console.log(`   - People: ${personCount.records[0]?.get('count').toNumber() ?? 0}`);
    console.log(`   - Relationships: ${relationshipCount.records[0]?.get('count').toNumber() ?? 0}`);
    console.log(`\n🎯 Sample query: MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p,r,m LIMIT 25\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Run seed
seedDatabase()
  .then(() => {
    console.log('✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    driver.close();
  });
