const Watchlist = require('../models/Watchlist');
const { analyzeStock, POPULAR_INDIAN_STOCKS } = require('../utils/stockService');

exports.getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user.id, stocks: [] });
    }

    // Fetch live data with RSI for all watchlist stocks
    const analysisPromises = watchlist.stocks.map(stock =>
      analyzeStock(stock.symbol).then(analysis => ({
        ...stock.toObject(),
        currentPrice: analysis?.currentPrice,
        change: analysis?.change,
        changePercent: analysis?.changePercent,
        rsi: analysis?.rsi,
        recommendation: analysis?.recommendation
      })).catch(() => stock.toObject())
    );

    const enrichedStocks = await Promise.all(analysisPromises);
    res.json({ success: true, stocks: enrichedStocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;
    const stockInfo = POPULAR_INDIAN_STOCKS.find(s => s.symbol === symbol);
    
    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user.id, stocks: [] });
    }

    const exists = watchlist.stocks.find(s => s.symbol === symbol);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Stock already in watchlist.' });
    }

    watchlist.stocks.push({
      symbol,
      companyName: stockInfo?.name || symbol,
      exchange: 'NSE',
      sector: stockInfo?.sector || 'N/A'
    });

    await watchlist.save();
    res.json({ success: true, message: 'Added to watchlist successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;
    const watchlist = await Watchlist.findOne({ user: req.user.id });
    
    if (!watchlist) return res.status(404).json({ success: false, message: 'Watchlist not found.' });

    watchlist.stocks = watchlist.stocks.filter(s => s.symbol !== symbol);
    await watchlist.save();
    
    res.json({ success: true, message: 'Removed from watchlist.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
