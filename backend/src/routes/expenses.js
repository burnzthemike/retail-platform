const router = require('express').Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// Create expense with receipt
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const { category, amount, description } = req.body;
    const receipt_url = req.file ? `/uploads/receipts/${req.file.filename}` : null;
    
    const result = await db.query(
      'INSERT INTO expenses (category, amount, description, receipt_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, amount, description, receipt_url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get expenses
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM expenses ORDER BY created_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
