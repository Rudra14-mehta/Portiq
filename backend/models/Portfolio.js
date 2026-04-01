const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
  exchange: { type: String, default: 'NSE' },
  sector: { type: String, default: 'N/A' },
  quantity: { type: Number, required: true, min: 1 },
  avgBuyPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  totalInvested: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  rsiAtTransaction: { type: Number },
  recommendation: { type: String },
  date: { type: Date, default: Date.now }
});

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  holdings: [holdingSchema],
  transactions: [transactionSchema],
  totalCurrentValue: { type: Number, default: 0 },
  totalPnL: { type: Number, default: 0 },
  totalPnLPercent: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
