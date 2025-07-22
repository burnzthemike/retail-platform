const router = require('express').Router();
const db = require('../models/db');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM customers ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search customers
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const result = await db.query(
      'SELECT * FROM customers WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1 LIMIT 10',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const result = await db.query(
      'INSERT INTO customers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
