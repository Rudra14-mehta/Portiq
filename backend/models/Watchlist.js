const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  stocks: [{
    symbol: { type: String, required: true },
    companyName: { type: String, required: true },
    exchange: { type: String, default: 'NSE' },
    sector: { type: String, default: 'N/A' },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
