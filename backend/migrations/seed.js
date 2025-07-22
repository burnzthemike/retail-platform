const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  console.log('🌱 Seeding database...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    // Add admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role, phone) 
      VALUES 
        ('admin@retail.com', $1, 'Admin User', 'admin', '0821234567'),
        ('staff@retail.com', $1, 'Staff Member', 'staff', '0829876543')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Add categories
    await client.query(`
      INSERT INTO categories (name, description, color, icon) VALUES
        ('Beverages', 'Soft drinks, juices, water', '#3b82f6', '🥤'),
        ('Snacks', 'Chips, chocolates, sweets', '#10b981', '🍿'),
        ('Groceries', 'Daily essentials', '#f59e0b', '🛒'),
        ('Personal Care', 'Health and beauty', '#ec4899', '🧴'),
        ('Household', 'Cleaning and home items', '#8b5cf6', '🏠')
      ON CONFLICT DO NOTHING
    `);

    // Get category IDs
    const categories = await client.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categories.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Add products
    await client.query(`
      INSERT INTO products (category_id, name, description, sku, barcode, price, cost, stock, unit) VALUES
        ($1, 'Coca Cola 330ml', 'Refreshing soft drink', 'BEV001', '5449000000996', 14.99, 10.00, 100, 'can'),
        ($1, 'Sprite 330ml', 'Lemon-lime soda', 'BEV002', '5449000001030', 14.99, 10.00, 80, 'can'),
        ($1, 'Water 500ml', 'Still water', 'BEV003', '6001240521236', 8.99, 5.00, 200, 'bottle'),
        ($2, 'Lays Original 125g', 'Potato chips', 'SNK001', '6001068613322', 21.99, 15.00, 50, 'packet'),
        ($2, 'Cadbury Dairy Milk 80g', 'Milk chocolate', 'SNK002', '6001068612346', 18.99, 12.00, 60, 'bar'),
        ($3, 'White Bread', 'Sliced bread loaf', 'GRO001', '6001240100234', 15.99, 10.00, 30, 'loaf'),
        ($3, 'Milk 1L', 'Full cream milk', 'GRO002', '6001240200345', 22.99, 16.00, 40, 'litre'),
        ($4, 'Toothpaste 100ml', 'Fluoride toothpaste', 'PER001', '6001240300456', 24.99, 18.00, 25, 'tube'),
        ($5, 'Dishwashing Liquid 750ml', 'Lemon scented', 'HOU001', '6001240400567', 29.99, 20.00, 20, 'bottle')
      ON CONFLICT DO NOTHING
    `, [
      categoryMap['Beverages'],
      categoryMap['Beverages'],
      categoryMap['Beverages'],
      categoryMap['Snacks'],
      categoryMap['Snacks'],
      categoryMap['Groceries'],
      categoryMap['Groceries'],
      categoryMap['Personal Care'],
      categoryMap['Household']
    ]);

    // Add sample customers
    await client.query(`
      INSERT INTO customers (name, email, phone, loyalty_points) VALUES
        ('John Doe', 'john@email.com', '0821234567', 150),
        ('Jane Smith', 'jane@email.com', '0829876543', 300),
        ('Bob Wilson', 'bob@email.com', '0837654321', 50)
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Database seeded successfully!');
    console.log('📧 Login: admin@retail.com / admin123');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await client.end();
  }
}

seed();
