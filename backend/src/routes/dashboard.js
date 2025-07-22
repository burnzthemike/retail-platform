const router = require('express').Router();
const db = require('../models/db');

router.get('/stats', async (req, res) => {
  try {
    // Today's sales
    const todaySales = await db.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
      FROM sales
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    // This month's sales
    const monthSales = await db.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
      FROM sales
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    // Total products
    const products = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE active = true'
    );
    
    // Total customers
    const customers = await db.query(
      'SELECT COUNT(*) as count FROM customers'
    );
    
    // Low stock alert
    const lowStock = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE active = true AND stock <= min_stock'
    );
    
    res.json({
      todaySales: {
        count: parseInt(todaySales.rows[0].count),
        total: parseFloat(todaySales.rows[0].total)
      },
      monthSales: {
        count: parseInt(monthSales.rows[0].count),
        total: parseFloat(monthSales.rows[0].total)
      },
      totalProducts: parseInt(products.rows[0].count),
      totalCustomers: parseInt(customers.rows[0].count),
      lowStockCount: parseInt(lowStock.rows[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sales chart data
router.get('/sales-chart', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sales,
        SUM(total) as revenue
      FROM sales
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
