const { Client } = require('pg');

async function seed() {
  console.log('🌱 Seeding database...');
  
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'retail_platform'
  });

  try {
    await client.connect();
    
    // Add demo user (password is 'demo123')
    await client.query(`
      INSERT INTO users (email, password, name) 
      VALUES ('admin@demo.com', 'demo123', 'Admin User')
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('✅ Added demo user: admin@demo.com / demo123');
    
    // Add some products
    await client.query(`
      INSERT INTO products (name, price, stock) VALUES
      ('Coca Cola 330ml', 12.99, 100),
      ('Bread White', 15.99, 50),
      ('Milk 1L', 22.99, 30)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Added sample products');
    
    await client.end();
    console.log('✅ Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
