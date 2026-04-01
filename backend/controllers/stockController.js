const { POPULAR_INDIAN_STOCKS, fetchStockQuote, analyzeStock } = require('../utils/stockService');

// @desc Get list of popular Indian stocks
exports.getPopularStocks = async (req, res) => {
  try {
    res.json({ success: true, stocks: POPULAR_INDIAN_STOCKS });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get real-time stock quote with RSI analysis
exports.getStockAnalysis = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Symbol is required.' });
    }

    const analysis = await analyzeStock(symbol.toUpperCase());
    
    // Find stock info from popular list
    const stockInfo = POPULAR_INDIAN_STOCKS.find(s => s.symbol === symbol.toUpperCase());
    
    res.json({
      success: true,
      data: {
        ...analysis,
        companyName: stockInfo?.name || symbol,
        sector: stockInfo?.sector || 'N/A'
      }
    });
  } catch (error) {
    console.error('Stock analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock data. Please try again.' });
  }
};

// @desc Get multiple stock quotes for dashboard
exports.getMultipleQuotes = async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : 
      POPULAR_INDIAN_STOCKS.slice(0, 10).map(s => s.symbol);
    
    const promises = symbols.map(symbol => 
      fetchStockQuote(symbol).then(quote => {
        const info = POPULAR_INDIAN_STOCKS.find(s => s.symbol === symbol);
        return quote ? { ...quote, companyName: info?.name || symbol, sector: info?.sector || 'N/A' } : null;
      }).catch(() => null)
    );

    const results = await Promise.all(promises);
    const validResults = results.filter(r => r !== null);

    res.json({ success: true, stocks: validResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Search stocks
exports.searchStocks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, stocks: [] });

    const results = POPULAR_INDIAN_STOCKS.filter(stock => 
      stock.symbol.toLowerCase().includes(q.toLowerCase()) ||
      stock.name.toLowerCase().includes(q.toLowerCase()) ||
      stock.sector.toLowerCase().includes(q.toLowerCase())
    );

    res.json({ success: true, stocks: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
