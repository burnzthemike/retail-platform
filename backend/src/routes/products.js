const router = require('express').Router();
const db = require('../models/db');

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.name as category_name, c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = true
      ORDER BY p.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const result = await db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = true AND (
        p.name ILIKE $1 OR 
        p.sku ILIKE $1 OR 
        p.barcode = $2
      )
      LIMIT 10
    `, [`%${q}%`, q]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { category_id, name, description, sku, barcode, price, cost, stock, unit } = req.body;
    
    const result = await db.query(`
      INSERT INTO products (category_id, name, description, sku, barcode, price, cost, stock, unit)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [category_id, name, description, sku, barcode, price, cost, stock, unit]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update stock
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type, notes } = req.body;
    
    // Update stock
    await db.query(
      'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, id]
    );
    
    // Record movement
    await db.query(`
      INSERT INTO inventory_movements (product_id, type, quantity, notes)
      VALUES ($1, $2, $3, $4)
    `, [id, type, quantity, notes]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
