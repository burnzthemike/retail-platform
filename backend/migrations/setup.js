const { Client } = require('pg');
require('dotenv').config();

async function setup() {
  console.log('🔧 Setting up database...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    await client.connect();
    await client.query('DROP DATABASE IF EXISTS retail_platform');
    await client.query('CREATE DATABASE retail_platform');
    console.log('✅ Database created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

setup();
