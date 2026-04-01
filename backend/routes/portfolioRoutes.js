const express = require('express');
const router = express.Router();
const { getPortfolio, buyStock, sellStock, getTransactions } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPortfolio);
router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/transactions', protect, getTransactions);

module.exports = router;
