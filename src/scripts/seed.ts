/**
 * Seed Script - Load sample Movie/Actor data into Neo4j
 * Run: pnpm seed
 */

import { neo4jClient } from '../infrastructure/database';

async function seedData() {
  console.log('🌱 Starting data seeding...');

  try {
    // Create constraints
    console.log('📋 Creating constraints...');
    await neo4jClient.write(
      `CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE`
    );
    await neo4jClient.write(
      `CREATE CONSTRAINT movie_id IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE`
    );
    await neo4jClient.write(
      `CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE`
    );
    await neo4jClient.write(
      `CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE`
    );

    // Clear existing data
    console.log('🗑️  Clearing existing sample data...');
    await neo4jClient.write(`MATCH (p:Person) DETACH DELETE p`);
    await neo4jClient.write(`MATCH (m:Movie) DETACH DELETE m`);

    // Create Movies
    console.log('🎬 Creating movies...');
    const movies = [
      { id: 'movie1', title: 'The Matrix', released: 1999, tagline: 'Welcome to the Real World' },
      { id: 'movie2', title: 'The Matrix Reloaded', released: 2003, tagline: 'Free your mind' },
      { id: 'movie3', title: 'The Matrix Revolutions', released: 2003, tagline: 'Everything that has a beginning has an end' },
      { id: 'movie4', title: 'The Devil\'s Advocate', released: 1997, tagline: 'Evil has its winning ways' },
      { id: 'movie5', title: 'A Few Good Men', released: 1992, tagline: 'In the heart of the nation\'s capital, in a courthouse of the U.S. government' },
      { id: 'movie6', title: 'Top Gun', released: 1986, tagline: 'I feel the need, the need for speed.' },
      { id: 'movie7', title: 'Jerry Maguire', released: 2000, tagline: 'The rest of his life begins now.' },
      { id: 'movie8', title: 'Stand By Me', released: 1986, tagline: 'For some, it\'s the last real taste of innocence, and the first real taste of life.' },
      { id: 'movie9', title: 'As Good as It Gets', released: 1997, tagline: 'A comedy from the heart that goes for the throat.' },
      { id: 'movie10', title: 'What Dreams May Come', released: 1998, tagline: 'After life there is more. The end is just the beginning.' },
    ];

    for (const movie of movies) {
      await neo4jClient.write(
        `CREATE (m:Movie {id: $id, title: $title, released: $released, tagline: $tagline})`,
        movie
      );
    }

    // Create People
    console.log('👥 Creating people...');
    const people = [
      { id: 'person1', name: 'Keanu Reeves', born: 1964 },
      { id: 'person2', name: 'Carrie-Anne Moss', born: 1967 },
      { id: 'person3', name: 'Laurence Fishburne', born: 1961 },
      { id: 'person4', name: 'Hugo Weaving', born: 1960 },
      { id: 'person5', name: 'Lilly Wachowski', born: 1967 },
      { id: 'person6', name: 'Lana Wachowski', born: 1965 },
      { id: 'person7', name: 'Tom Cruise', born: 1962 },
      { id: 'person8', name: 'Jack Nicholson', born: 1937 },
      { id: 'person9', name: 'Demi Moore', born: 1962 },
      { id: 'person10', name: 'Kevin Bacon', born: 1958 },
      { id: 'person11', name: 'Kiefer Sutherland', born: 1966 },
      { id: 'person12', name: 'Cuba Gooding Jr.', born: 1968 },
      { id: 'person13', name: 'River Phoenix', born: 1970 },
      { id: 'person14', name: 'Corey Feldman', born: 1971 },
      { id: 'person15', name: 'Robin Williams', born: 1951 },
    ];

    for (const person of people) {
      await neo4jClient.write(
        `CREATE (p:Person {id: $id, name: $name, born: $born})`,
        person
      );
    }

    // Create relationships
    console.log('🔗 Creating relationships...');
    const relationships = [
      // The Matrix
      { personId: 'person1', movieId: 'movie1', type: 'ACTED_IN', roles: ['Neo'] },
      { personId: 'person2', movieId: 'movie1', type: 'ACTED_IN', roles: ['Trinity'] },
      { personId: 'person3', movieId: 'movie1', type: 'ACTED_IN', roles: ['Morpheus'] },
      { personId: 'person4', movieId: 'movie1', type: 'ACTED_IN', roles: ['Agent Smith'] },
      { personId: 'person5', movieId: 'movie1', type: 'DIRECTED', roles: [] },
      { personId: 'person6', movieId: 'movie1', type: 'DIRECTED', roles: [] },
      // The Matrix Reloaded
      { personId: 'person1', movieId: 'movie2', type: 'ACTED_IN', roles: ['Neo'] },
      { personId: 'person2', movieId: 'movie2', type: 'ACTED_IN', roles: ['Trinity'] },
      { personId: 'person3', movieId: 'movie2', type: 'ACTED_IN', roles: ['Morpheus'] },
      { personId: 'person5', movieId: 'movie2', type: 'DIRECTED', roles: [] },
      { personId: 'person6', movieId: 'movie2', type: 'DIRECTED', roles: [] },
      // The Matrix Revolutions
      { personId: 'person1', movieId: 'movie3', type: 'ACTED_IN', roles: ['Neo'] },
      { personId: 'person2', movieId: 'movie3', type: 'ACTED_IN', roles: ['Trinity'] },
      { personId: 'person3', movieId: 'movie3', type: 'ACTED_IN', roles: ['Morpheus'] },
      { personId: 'person5', movieId: 'movie3', type: 'DIRECTED', roles: [] },
      { personId: 'person6', movieId: 'movie3', type: 'DIRECTED', roles: [] },
      // The Devil's Advocate
      { personId: 'person1', movieId: 'movie4', type: 'ACTED_IN', roles: ['Kevin Lomax'] },
      { personId: 'person8', movieId: 'movie4', type: 'ACTED_IN', roles: ['John Milton'] },
      // A Few Good Men
      { personId: 'person7', movieId: 'movie5', type: 'ACTED_IN', roles: ['Lt. Daniel Kaffee'] },
      { personId: 'person8', movieId: 'movie5', type: 'ACTED_IN', roles: ['Col. Nathan R. Jessup'] },
      { personId: 'person9', movieId: 'movie5', type: 'ACTED_IN', roles: ['Lt. Cdr. JoAnne Galloway'] },
      { personId: 'person10', movieId: 'movie5', type: 'ACTED_IN', roles: ['Capt. Jack Ross'] },
      { personId: 'person11', movieId: 'movie5', type: 'ACTED_IN', roles: ['Lt. Jonathan Kendrick'] },
      // Top Gun
      { personId: 'person7', movieId: 'movie6', type: 'ACTED_IN', roles: ['Maverick'] },
      // Jerry Maguire
      { personId: 'person7', movieId: 'movie7', type: 'ACTED_IN', roles: ['Jerry Maguire'] },
      { personId: 'person12', movieId: 'movie7', type: 'ACTED_IN', roles: ['Rod Tidwell'] },
      // Stand By Me
      { personId: 'person13', movieId: 'movie8', type: 'ACTED_IN', roles: ['Chris Chambers'] },
      { personId: 'person14', movieId: 'movie8', type: 'ACTED_IN', roles: ['Teddy Duchamp'] },
      { personId: 'person10', movieId: 'movie8', type: 'ACTED_IN', roles: ['Older Chris Chambers'] },
      // As Good as It Gets
      { personId: 'person8', movieId: 'movie9', type: 'ACTED_IN', roles: ['Melvin Udall'] },
      { personId: 'person12', movieId: 'movie9', type: 'ACTED_IN', roles: ['Frank Sachs'] },
      // What Dreams May Come
      { personId: 'person15', movieId: 'movie10', type: 'ACTED_IN', roles: ['Chris Nielsen'] },
    ];

    for (const rel of relationships) {
      if (rel.type === 'ACTED_IN') {
        await neo4jClient.write(
          `MATCH (p:Person {id: $personId}), (m:Movie {id: $movieId})
           CREATE (p)-[:ACTED_IN {roles: $roles}]->(m)`,
          rel
        );
      } else {
        await neo4jClient.write(
          `MATCH (p:Person {id: $personId}), (m:Movie {id: $movieId})
           CREATE (p)-[:${rel.type}]->(m)`,
          { personId: rel.personId, movieId: rel.movieId }
        );
      }
    }

    // Verify data
    console.log('✅ Verifying data...');
    const movieCount = await neo4jClient.read<{ count: number }>(
      `MATCH (m:Movie) RETURN count(m) as count`
    );
    const personCount = await neo4jClient.read<{ count: number }>(
      `MATCH (p:Person) RETURN count(p) as count`
    );
    const relCount = await neo4jClient.read<{ count: number }>(
      `MATCH ()-[r]->() RETURN count(r) as count`
    );

    console.log('\n📊 Data Summary:');
    console.log(`   Movies: ${movieCount[0]?.count || 0}`);
    console.log(`   People: ${personCount[0]?.count || 0}`);
    console.log(`   Relationships: ${relCount[0]?.count || 0}`);

    console.log('\n✨ Sample data seeded successfully!');
    console.log('\n📝 Sample Query:');
    console.log('   MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p,r,m LIMIT 25');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await neo4jClient.close();
  }
}

// Run the script
// Run the seeding
// eslint-disable-next-line @typescript-eslint/no-floating-promises
void (async () => {
  try {
    await seedData();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
})();
