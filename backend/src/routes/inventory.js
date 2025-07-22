const router = require('express').Router();
const db = require('../models/db');

// Get low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = true AND p.stock <= p.min_stock
      ORDER BY p.stock ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get inventory movements
router.get('/movements', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT im.*, p.name as product_name, u.name as user_name
      FROM inventory_movements im
      JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.user_id = u.id
      ORDER BY im.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
