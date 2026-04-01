const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { getDatabaseStatus, requireDatabase } = require('./middleware/databaseMiddleware');

dotenv.config();
mongoose.set('bufferCommands', false);

const app = express();
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stock_portfolio';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  const database = getDatabaseStatus();
  const status = database.isConnected ? 'OK' : 'DEGRADED';

  res.status(database.isConnected ? 200 : 503).json({
    status,
    message: 'Stock Portfolio API is running',
    database
  });
});

// Routes
app.use('/api/auth', requireDatabase, require('./routes/authRoutes'));
app.use('/api/stocks', requireDatabase, require('./routes/stockRoutes'));
app.use('/api/portfolio', requireDatabase, require('./routes/portfolioRoutes'));
app.use('/api/watchlist', requireDatabase, require('./routes/watchlistRoutes'));

// MongoDB Connection
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected');
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB Error:', error);
});

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000
}).catch((error) => {
  console.error(`❌ Initial MongoDB connection failed for ${mongoUri}:`, error.message);
});

// Auto-update stock prices every 5 minutes during market hours (9:15 AM - 3:30 PM IST, Mon-Fri)
cron.schedule('*/5 9-15 * * 1-5', () => {
  console.log('🔄 Auto-updating stock prices...');
}, {
  timezone: 'Asia/Kolkata'
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Indian Stock Market Portfolio API`);
});
