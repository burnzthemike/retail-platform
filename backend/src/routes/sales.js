const router = require('express').Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// Create sale
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { customer_id, items, payment_method, subtotal, tax, discount, total } = req.body;
    
    // Generate sale number
    const date = new Date();
    const saleNumber = `INV${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
    
    // Create sale
    const saleResult = await client.query(`
      INSERT INTO sales (sale_number, customer_id, subtotal, tax, discount, total, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [saleNumber, customer_id, subtotal, tax, discount, total, payment_method]);
    
    const sale = saleResult.rows[0];
    
    // Add sale items and update stock
    for (const item of items) {
      await client.query(`
        INSERT INTO sale_items (sale_id, product_id, quantity, price, discount, total)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [sale.id, item.product_id, item.quantity, item.price, item.discount || 0, item.total]);
      
      // Update stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
      
      // Record inventory movement
      await client.query(`
        INSERT INTO inventory_movements (product_id, type, quantity, reference_type, reference_id)
        VALUES ($1, 'sale', $2, 'sale', $3)
      `, [item.product_id, -item.quantity, sale.id]);
    }
    
    // Update customer stats if customer exists
    if (customer_id) {
      await client.query(`
        UPDATE customers 
        SET total_spent = total_spent + $1,
            visit_count = visit_count + 1,
            loyalty_points = loyalty_points + $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [total, Math.floor(total), customer_id]);
    }
    
    await client.query('COMMIT');
    res.status(201).json(sale);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Get recent sales
router.get('/recent', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, c.name as customer_name, u.name as cashier_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
