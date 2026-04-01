# 📊 StockPilot — Indian Stock Market Portfolio Manager

A full-stack MERN application for Indian stock market portfolio management with **real-time NSE/BSE prices** and **RSI-based buy/sell recommendations**.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 📈 **Live Stock Prices** | Real-time NSE/BSE prices via Yahoo Finance API (free, no key needed) |
| 📉 **RSI Indicator** | Wilder's RSI (14-period) calculated from 60 days of historical data |
| 🤖 **Smart Signals** | STRONG BUY / BUY / HOLD / SELL / STRONG SELL based on RSI zones |
| 💼 **Portfolio Management** | Buy/sell stocks, track P&L, view allocation chart |
| 👁️ **Watchlist** | Monitor stocks with live RSI without owning them |
| 📋 **Transaction History** | Full log of trades with RSI values at trade time |
| 💰 **Virtual Money** | Start with ₹5,00,000 to practice trading |
| 📊 **Price Charts** | 30-day price & RSI charts with overbought/oversold zones |
| 🔐 **JWT Auth** | Secure authentication with bcrypt password hashing |

---

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Yahoo Finance API (via axios)
- RSI Calculation (Wilder's method)

**Frontend:**
- React 18 + React Router v6
- Recharts (price/RSI charts)
- Custom dark financial UI
- Context API for global state

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install

```bash
git clone <your-repo>
cd stock-portfolio

# Install all dependencies at once
npm run install-all
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stock_portfolio
JWT_SECRET=your_very_secret_key_here_change_this
```

> **Note:** No API key needed! We use Yahoo Finance's public endpoint for real NSE/BSE data.

### 3. Run the Application

```bash
# From root directory - runs both backend & frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user (gets ₹5L balance) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Stocks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks/popular` | List of 30 popular NSE stocks |
| GET | `/api/stocks/search?q=reliance` | Search stocks |
| GET | `/api/stocks/analyze/:symbol` | Full analysis with RSI + chart data |
| GET | `/api/stocks/quotes?symbols=TCS.NS,INFY.NS` | Multiple live quotes |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Get portfolio with live prices |
| POST | `/api/portfolio/buy` | Buy stock `{ symbol, quantity }` |
| POST | `/api/portfolio/sell` | Sell stock `{ symbol, quantity }` |
| GET | `/api/portfolio/transactions` | Transaction history |

### Watchlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist` | Get watchlist with live RSI |
| POST | `/api/watchlist/add` | Add stock `{ symbol }` |
| DELETE | `/api/watchlist/:symbol` | Remove from watchlist |

---

## 📉 RSI Signal Logic

```
RSI ≤ 30    →  🟢 STRONG BUY   (Oversold)
RSI 30-40   →  🟩 BUY          (Near Oversold)
RSI 40-55   →  🟡 HOLD         (Neutral)
RSI 55-70   →  🟠 SELL         (Near Overbought)
RSI ≥ 70    →  🔴 STRONG SELL  (Overbought)
```

RSI is calculated using **Wilder's Smoothing Method** over 14 periods from 60 days of historical daily close prices.

---

## 📦 Project Structure

```
stock-portfolio/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── stockController.js
│   │   ├── portfolioController.js
│   │   └── watchlistController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Portfolio.js
│   │   └── Watchlist.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── portfolioRoutes.js
│   │   └── watchlistRoutes.js
│   ├── utils/
│   │   └── stockService.js    ← RSI calculation + Yahoo Finance
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js
    │   │   ├── RSIGauge.js
    │   │   └── StockCard.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── StockDetailPage.js
    │   │   ├── PortfolioPage.js
    │   │   ├── WatchlistPage.js
    │   │   └── TransactionsPage.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

---

## 🇮🇳 Supported NSE Stocks

| Symbol | Company | Sector |
|--------|---------|--------|
| RELIANCE.NS | Reliance Industries | Energy |
| TCS.NS | Tata Consultancy Services | IT |
| HDFCBANK.NS | HDFC Bank | Banking |
| INFY.NS | Infosys | IT |
| ICICIBANK.NS | ICICI Bank | Banking |
| SBIN.NS | State Bank of India | Banking |
| BAJFINANCE.NS | Bajaj Finance | Finance |
| BHARTIARTL.NS | Bharti Airtel | Telecom |
| ...and 22 more | | |

---

## ⚠️ Disclaimer

This application is for **educational/paper trading purposes only**. It uses virtual money and is not connected to any real brokerage. RSI is a single technical indicator and should not be the sole basis for real investment decisions.

---

## 🔧 Troubleshooting

**"Failed to fetch stock data"** — Yahoo Finance may rate-limit requests. Wait 30 seconds and try again.

**MongoDB connection error** — Ensure MongoDB is running locally: `mongod --dbpath /data/db`

**CORS error** — Ensure frontend runs on port 3000 and backend on 5000.
