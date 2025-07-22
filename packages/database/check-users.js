const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'retail_platform'
  });

  try {
    await client.connect();
    const result = await client.query('SELECT email, name FROM users');
    console.log('Users in database:');
    result.rows.forEach(user => {
      console.log(`- Email: ${user.email}, Name: ${user.name}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();
