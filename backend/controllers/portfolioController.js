const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { fetchStockQuote, analyzeStock, POPULAR_INDIAN_STOCKS } = require('../utils/stockService');

// @desc Get user portfolio
exports.getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user.id, holdings: [], transactions: [] });
    }

    // Update current prices for all holdings
    if (portfolio.holdings.length > 0) {
      const pricePromises = portfolio.holdings.map(holding => 
        fetchStockQuote(holding.symbol).catch(() => null)
      );
      const prices = await Promise.all(pricePromises);
      
      let totalCurrentValue = 0;
      let totalInvested = 0;

      portfolio.holdings.forEach((holding, i) => {
        if (prices[i]) {
          holding.currentPrice = prices[i].currentPrice;
          holding.lastUpdated = new Date();
        }
        totalCurrentValue += (holding.currentPrice || holding.avgBuyPrice) * holding.quantity;
        totalInvested += holding.totalInvested;
      });

      portfolio.totalCurrentValue = totalCurrentValue;
      portfolio.totalPnL = totalCurrentValue - totalInvested;
      portfolio.totalPnLPercent = totalInvested > 0 
        ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 
        : 0;

      await portfolio.save();
    }

    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Buy stock
exports.buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid symbol or quantity.' });
    }

    // Fetch current price and analysis
    const analysis = await analyzeStock(symbol);
    if (!analysis || !analysis.currentPrice) {
      return res.status(400).json({ success: false, message: 'Could not fetch stock price. Please try again.' });
    }

    const totalCost = analysis.currentPrice * quantity;
    const user = await User.findById(req.user.id);

    if (user.balance < totalCost) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₹${totalCost.toFixed(2)}, Available: ₹${user.balance.toFixed(2)}` 
      });
    }

    const stockInfo = POPULAR_INDIAN_STOCKS.find(s => s.symbol === symbol);
    const companyName = stockInfo?.name || symbol;
    const sector = stockInfo?.sector || 'N/A';

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user.id, holdings: [], transactions: [] });
    }

    // Check if stock already in holdings
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);

    if (existingHolding) {
      // Update average buy price
      const totalQuantity = existingHolding.quantity + quantity;
      const totalInvested = existingHolding.totalInvested + totalCost;
      existingHolding.avgBuyPrice = totalInvested / totalQuantity;
      existingHolding.quantity = totalQuantity;
      existingHolding.totalInvested = totalInvested;
      existingHolding.currentPrice = analysis.currentPrice;
    } else {
      portfolio.holdings.push({
        symbol,
        companyName,
        sector,
        quantity,
        avgBuyPrice: analysis.currentPrice,
        currentPrice: analysis.currentPrice,
        totalInvested: totalCost
      });
    }

    // Add transaction
    portfolio.transactions.unshift({
      symbol,
      companyName,
      type: 'BUY',
      quantity,
      price: analysis.currentPrice,
      totalAmount: totalCost,
      rsiAtTransaction: analysis.rsi,
      recommendation: analysis.recommendation?.signal
    });

    // Keep only last 100 transactions
    if (portfolio.transactions.length > 100) {
      portfolio.transactions = portfolio.transactions.slice(0, 100);
    }

    await portfolio.save();

    // Deduct from user balance
    user.balance -= totalCost;
    user.totalInvested += totalCost;
    await user.save();

    res.json({
      success: true,
      message: `Successfully bought ${quantity} shares of ${companyName} at ₹${analysis.currentPrice.toFixed(2)}`,
      transaction: {
        symbol,
        companyName,
        type: 'BUY',
        quantity,
        price: analysis.currentPrice,
        totalAmount: totalCost,
        rsi: analysis.rsi,
        recommendation: analysis.recommendation?.signal
      },
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Sell stock
exports.sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid symbol or quantity.' });
    }

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found.' });
    }

    const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
    if (holdingIndex === -1) {
      return res.status(400).json({ success: false, message: 'Stock not found in your portfolio.' });
    }

    const holding = portfolio.holdings[holdingIndex];
    if (holding.quantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient shares. You have ${holding.quantity} shares, trying to sell ${quantity}.` 
      });
    }

    // Fetch current price
    const analysis = await analyzeStock(symbol);
    if (!analysis || !analysis.currentPrice) {
      return res.status(400).json({ success: false, message: 'Could not fetch current price.' });
    }

    const saleAmount = analysis.currentPrice * quantity;
    const costBasis = holding.avgBuyPrice * quantity;
    const profitLoss = saleAmount - costBasis;

    // Update or remove holding
    if (holding.quantity === quantity) {
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      holding.quantity -= quantity;
      holding.totalInvested = holding.avgBuyPrice * holding.quantity;
      holding.currentPrice = analysis.currentPrice;
    }

    // Add sell transaction
    portfolio.transactions.unshift({
      symbol,
      companyName: holding.companyName,
      type: 'SELL',
      quantity,
      price: analysis.currentPrice,
      totalAmount: saleAmount,
      rsiAtTransaction: analysis.rsi,
      recommendation: analysis.recommendation?.signal
    });

    await portfolio.save();

    // Credit to user balance
    const user = await User.findById(req.user.id);
    user.balance += saleAmount;
    if (user.totalInvested >= costBasis) {
      user.totalInvested -= costBasis;
    }
    await user.save();

    res.json({
      success: true,
      message: `Successfully sold ${quantity} shares of ${holding.companyName} at ₹${analysis.currentPrice.toFixed(2)}`,
      transaction: {
        symbol,
        companyName: holding.companyName,
        type: 'SELL',
        quantity,
        price: analysis.currentPrice,
        totalAmount: saleAmount,
        profitLoss,
        rsi: analysis.rsi,
        recommendation: analysis.recommendation?.signal
      },
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Sell error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get transaction history
exports.getTransactions = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      return res.json({ success: true, transactions: [] });
    }
    res.json({ success: true, transactions: portfolio.transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
