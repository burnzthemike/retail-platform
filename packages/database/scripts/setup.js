const { Client } = require('pg');

async function setup() {
  console.log('📊 Setting up database...');
  
  // Connect to PostgreSQL
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Drop existing database if it exists
    await client.query('DROP DATABASE IF EXISTS retail_platform');
    console.log('✅ Dropped old database (if it existed)');
    
    // Create new database
    await client.query('CREATE DATABASE retail_platform');
    console.log('✅ Created new database: retail_platform');
    
    await client.end();
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Make sure PostgreSQL is running and password is "postgres"');
    process.exit(1);
  }
}

setup();
