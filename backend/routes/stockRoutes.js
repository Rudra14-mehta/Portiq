const express = require('express');
const router = express.Router();
const { getPopularStocks, getStockAnalysis, getMultipleQuotes, searchStocks } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.get('/popular', protect, getPopularStocks);
router.get('/search', protect, searchStocks);
router.get('/quotes', protect, getMultipleQuotes);
router.get('/analyze/:symbol', protect, getStockAnalysis);

module.exports = router;
