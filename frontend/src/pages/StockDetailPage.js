import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Plus,
  RefreshCw,
  Info,
  ArrowUpRight,
  TimerReset,
  Target,
  CandlestickChart
} from 'lucide-react';
import {
  addToWatchlist,
  buyStock,
  getPortfolio,
  getStockAnalysis,
  sellStock
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import RSIGauge from '../components/RSIGauge';

const formatCurrency = (value) => (
  Number.isFinite(value) ? `₹${value.toFixed(2)}` : '—'
);

const formatCompactVolume = (value) => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)}Cr`;
  }

  if (value >= 100000) {
    return `${(value / 100000).toFixed(2)}L`;
  }

  return value.toLocaleString('en-IN');
};

const getRecommendationClass = (signal = '') => {
  if (signal.includes('BUY')) return 'is-buy';
  if (signal.includes('SELL')) return 'is-sell';
  return 'is-hold';
};

const getStockSnapshot = (symbol) => Promise.all([
  getStockAnalysis(symbol),
  getPortfolio()
]);

const KITE_PUBLISHER_API_KEY = process.env.REACT_APP_KITE_API_KEY;

const buildKiteBasketOrder = ({ stock, quantity, transactionType }) => ({
  tradingsymbol: stock?.kite?.tradingSymbol,
  exchange: stock?.kite?.exchange || 'NSE',
  transaction_type: transactionType,
  order_type: 'MARKET',
  quantity: Math.max(1, parseInt(quantity, 10) || 1),
  product: 'CNC',
  validity: 'DAY',
  variety: 'regular',
  tag: 'PORTIQ'
});

const openKiteBasket = ({ stock, quantity, transactionType }) => {
  const basketUrl = stock?.kite?.basketUrl || 'https://kite.zerodha.com/connect/basket';
  const order = buildKiteBasketOrder({ stock, quantity, transactionType });

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = basketUrl;
  form.target = '_blank';
  form.style.display = 'none';

  const fields = {
    api_key: KITE_PUBLISHER_API_KEY,
    data: JSON.stringify([order])
  };

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

export default function StockDetailPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user, updateBalance } = useAuth();

  const [stock, setStock] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeChart, setActiveChart] = useState('price');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const refreshStock = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stockRes, portfolioRes] = await getStockSnapshot(symbol);

      setStock(stockRes.data.data);
      setPortfolio(portfolioRes.data.portfolio);
    } catch (err) {
      setError('Failed to fetch stock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadStock = async () => {
      try {
        setLoading(true);
        setError(null);

        const [stockRes, portfolioRes] = await getStockSnapshot(symbol);

        if (cancelled) {
          return;
        }

        setStock(stockRes.data.data);
        setPortfolio(portfolioRes.data.portfolio);
      } catch (err) {
        if (!cancelled) {
          setError('Failed to fetch stock data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStock();
    setActiveChart('price');

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const holding = portfolio?.holdings?.find((item) => item.symbol === symbol);
  const totalCost = (stock?.currentPrice || 0) * quantity;
  const canAfford = (user?.balance || 0) >= totalCost;
  const canSell = Boolean(holding && holding.quantity >= quantity);
  const recommendation = stock?.recommendation;
  const chartData = stock?.chartData || [];
  const isPositive = (stock?.changePercent || 0) >= 0;
  const recommendationClass = getRecommendationClass(recommendation?.signal);

  const handlePortfolioBuy = async () => {
    if (!canAfford) {
      setError(`Insufficient balance. Need ${formatCurrency(totalCost)}`);
      return;
    }

    setTradeLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await buyStock({ symbol, quantity: parseInt(quantity, 10) });
      setMessage(response.data.message);
      updateBalance(response.data.newBalance);
      await refreshStock();
    } catch (err) {
      setError(err.response?.data?.message || 'Buy failed.');
    } finally {
      setTradeLoading(false);
    }
  };

  const handlePortfolioSell = async () => {
    if (!canSell) {
      setError(`You only have ${holding?.quantity || 0} shares.`);
      return;
    }

    setTradeLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await sellStock({ symbol, quantity: parseInt(quantity, 10) });
      setMessage(response.data.message);
      updateBalance(response.data.newBalance);
      await refreshStock();
    } catch (err) {
      setError(err.response?.data?.message || 'Sell failed.');
    } finally {
      setTradeLoading(false);
    }
  };

  const handleWatchlist = async () => {
    try {
      await addToWatchlist(symbol);
      setMessage('Added to watchlist!');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Already in watchlist.');
    }
  };

  const handleKiteRedirect = (action = 'chart') => {
    const transactionType = action === 'sell' ? 'SELL' : 'BUY';
    const homeUrl = stock?.kite?.homeUrl || 'https://kite.zerodha.com/';

    if (!homeUrl) {
      setError('Kite redirect is unavailable for this stock right now.');
      return;
    }

    if ((action === 'buy' || action === 'sell') && KITE_PUBLISHER_API_KEY) {
      setMessage(`Opening a prefilled Kite ${transactionType} basket for ${stock?.displaySymbol}.`);
      setError(null);
      openKiteBasket({ stock, quantity, transactionType });
      return;
    }

    const clipboardText = `${stock?.kite?.exchange || 'NSE'}:${stock?.kite?.tradingSymbol || stock?.displaySymbol}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(clipboardText).catch(() => {});
    }

    setMessage(
      action === 'chart'
        ? `Opened Kite home for ${stock?.displaySymbol}. ${clipboardText} was copied to your clipboard for quick search.`
        : `Kite Publisher API key is not configured, so I opened Kite home instead. ${clipboardText} was copied for quick ${transactionType.toLowerCase()} search.`
    );
    setError(null);
    window.open(homeUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ height: '60vh' }}>
        <div className="loading-spinner" />
        <p>Building multi-indicator analysis for {symbol?.replace('.NS', '').replace('.BO', '')}...</p>
      </div>
    );
  }

  if (error && !stock) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const indicatorCards = [
    {
      label: 'SMA 20',
      value: formatCurrency(stock?.movingAverages?.sma20),
      detail:
        stock?.movingAverages?.priceVsSma20 === 'above'
          ? 'Price above SMA 20'
          : stock?.movingAverages?.priceVsSma20 === 'below'
            ? 'Price below SMA 20'
            : 'Awaiting enough data',
      tone:
        stock?.movingAverages?.priceVsSma20 === 'above'
          ? 'positive'
          : stock?.movingAverages?.priceVsSma20 === 'below'
            ? 'negative'
            : 'neutral'
    },
    {
      label: 'SMA 50',
      value: formatCurrency(stock?.movingAverages?.sma50),
      detail:
        stock?.movingAverages?.priceVsSma50 === 'above'
          ? 'Price above SMA 50'
          : stock?.movingAverages?.priceVsSma50 === 'below'
            ? 'Price below SMA 50'
            : 'Awaiting enough data',
      tone:
        stock?.movingAverages?.priceVsSma50 === 'above'
          ? 'positive'
          : stock?.movingAverages?.priceVsSma50 === 'below'
            ? 'negative'
            : 'neutral'
    },
    {
      label: 'SuperTrend',
      value: formatCurrency(stock?.superTrend?.value),
      detail:
        stock?.superTrend?.direction === 'bullish'
          ? 'Bullish trend filter'
          : stock?.superTrend?.direction === 'bearish'
            ? 'Bearish trend filter'
            : 'Awaiting enough data',
      tone:
        stock?.superTrend?.direction === 'bullish'
          ? 'positive'
          : stock?.superTrend?.direction === 'bearish'
            ? 'negative'
            : 'neutral'
    },
    {
      label: 'Structure',
      value: stock?.movingAverages?.regime?.toUpperCase() || 'MIXED',
      detail: stock?.movingAverages?.crossover || 'No fresh crossover',
      tone:
        stock?.movingAverages?.regime === 'bullish'
          ? 'positive'
          : stock?.movingAverages?.regime === 'bearish'
            ? 'negative'
            : 'neutral'
    }
  ];

  const marketStats = [
    { label: 'Open', value: formatCurrency(stock?.open) },
    { label: 'Prev Close', value: formatCurrency(stock?.previousClose) },
    { label: "Day's High", value: formatCurrency(stock?.high), tone: 'positive' },
    { label: "Day's Low", value: formatCurrency(stock?.low), tone: 'negative' },
    { label: 'Volume', value: formatCompactVolume(stock?.volume) },
    { label: 'Exchange', value: stock?.exchange || 'NSE' }
  ];

  const priceTooltipFormatter = (value, name) => {
    const labels = {
      close: 'Close',
      sma20: 'SMA 20',
      sma50: 'SMA 50',
      superTrend: 'SuperTrend'
    };

    return [Number.isFinite(value) ? `₹${value.toFixed(2)}` : '—', labels[name] || name];
  };

  return (
    <div className="stock-detail-page fade-in">
      <button className="btn btn-outline stock-detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      <section className="card stock-hero">
        <div className="stock-hero-main">
          <div className="stock-hero-headline">
            <div className="stock-title-row">
              <h1>{stock?.displaySymbol || symbol.replace('.NS', '').replace('.BO', '')}</h1>
              <span className="stock-chip">{stock?.kite?.exchange || 'NSE'}</span>
              {stock?.sector && <span className="stock-chip stock-chip-accent">{stock.sector}</span>}
            </div>
            <p>{stock?.companyName}</p>
          </div>

          <div className="stock-price-panel">
            <div className="stock-current-price">{formatCurrency(stock?.currentPrice)}</div>
            <div className={`stock-price-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <span>
                {isPositive ? '+' : ''}
                {formatCurrency(stock?.change)} ({isPositive ? '+' : ''}
                {stock?.changePercent?.toFixed(2)}%)
              </span>
            </div>
            <div className="stock-subtle-line">
              Session: {stock?.marketContext?.session || 'N/A'} • Market hours {stock?.marketContext?.marketOpen} - {stock?.marketContext?.marketClose}
            </div>
          </div>
        </div>

        {recommendation && (
          <div className={`stock-hero-signal ${recommendationClass}`}>
            <span className="stock-hero-signal-label">Recommendation</span>
            <div className="stock-hero-signal-value">{recommendation.signal}</div>
            <div className="stock-hero-signal-meta">
              <span>{recommendation.strength}</span>
              <span>Score {recommendation.score}</span>
            </div>
          </div>
        )}
      </section>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stock-detail-layout">
        <div className="stock-detail-main">
          {recommendation && (
            <section className="card stock-analysis-card">
              <div className="stock-section-header">
                <div>
                  <div className="stock-kicker">Indicator Summary</div>
                  <h2>Moving Average + SuperTrend Recommendation</h2>
                </div>
                <div className={`stock-signal-pill ${recommendationClass}`}>
                  {recommendation.signal}
                </div>
              </div>

              <div className="stock-analysis-grid">
                <div className="stock-rsi-panel">
                  <RSIGauge rsi={stock?.rsi} size="lg" />
                </div>

                <div className="stock-factor-panel">
                  <div className="stock-factor-list">
                    {(recommendation.factors || []).slice(0, 4).map((factor) => (
                      <div key={factor} className="stock-factor-item">
                        <span className="stock-factor-dot" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="stock-indicator-grid">
                {indicatorCards.map((card) => (
                  <article key={card.label} className={`stock-indicator-box ${card.tone || 'neutral'}`}>
                    <span className="stock-kicker">{card.label}</span>
                    <strong>{card.value}</strong>
                    <p>{card.detail}</p>
                  </article>
                ))}
              </div>

              <div className="stock-analysis-note">
                <Info size={16} />
                <span>{recommendation.reasoning}</span>
              </div>
            </section>
          )}

          <section className="card stock-chart-card">
            <div className="stock-section-header">
              <div>
                <div className="stock-kicker">Chart View</div>
                <h2>30-Day Price Action</h2>
              </div>
              <div className="stock-chart-toggle">
                {['price', 'rsi'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={activeChart === item ? 'active' : ''}
                    onClick={() => setActiveChart(item)}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={320}>
                  {activeChart === 'price' ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                        formatter={priceTooltipFormatter}
                      />
                      <Area type="monotone" dataKey="close" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2.4} fill="url(#priceGradient)" dot={false} />
                      <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="sma50" stroke="#38bdf8" strokeWidth={2} dot={false} connectNulls />
                      <Line
                        type="monotone"
                        dataKey="superTrend"
                        stroke={stock?.superTrend?.direction === 'bullish' ? '#22c55e' : '#fb7185'}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    </AreaChart>
                  ) : (
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                        formatter={(value) => [Number.isFinite(value) ? value.toFixed(2) : '—', 'RSI']}
                      />
                      <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '70', fill: '#ef4444', fontSize: 11 }} />
                      <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 4" label={{ value: '30', fill: '#10b981', fontSize: 11 }} />
                      <Bar dataKey="rsi" fill="#3b82f6" opacity={0.72} radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="rsi" stroke="#93c5fd" strokeWidth={2} dot={false} connectNulls />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>

                {activeChart === 'price' && (
                  <div className="stock-chart-legend">
                    <span><i style={{ background: isPositive ? '#10b981' : '#ef4444' }} /> Close</span>
                    <span><i style={{ background: '#f59e0b' }} /> SMA 20</span>
                    <span><i style={{ background: '#38bdf8' }} /> SMA 50</span>
                    <span><i style={{ background: stock?.superTrend?.direction === 'bullish' ? '#22c55e' : '#fb7185' }} /> SuperTrend</span>
                  </div>
                )}
              </>
            ) : (
              <div className="stock-empty-state">No chart data available.</div>
            )}
          </section>

          <section className="card stock-options-card">
            <div className="stock-section-header">
              <div>
                <div className="stock-kicker">Options Strategy</div>
                <h2>Time-Based Straddle Setup</h2>
              </div>
              <div
                className="stock-status-pill"
                style={{ '--status-color': stock?.timeBasedStraddle?.color || '#3b82f6' }}
              >
                {stock?.timeBasedStraddle?.status || 'WATCH'}
              </div>
            </div>

            <div className="stock-options-grid">
              <div className="stock-option-box">
                <div className="stock-option-box-head">
                  <Target size={16} />
                  <span>ATM Setup</span>
                </div>
                <strong>{stock?.timeBasedStraddle?.summary || 'N/A'}</strong>
                <p>{stock?.timeBasedStraddle?.reasoning}</p>
              </div>

              <div className="stock-option-box">
                <div className="stock-option-box-head">
                  <TimerReset size={16} />
                  <span>Time Rules</span>
                </div>
                <strong>{stock?.timeBasedStraddle?.entryWindow}</strong>
                <p>Current IST time: {stock?.timeBasedStraddle?.currentTime}. Exit by {stock?.timeBasedStraddle?.exitTime}.</p>
              </div>
            </div>

            <div className="stock-legs-list">
              {(stock?.timeBasedStraddle?.legs || []).map((leg) => (
                <div key={leg} className="stock-leg-item">
                  <CandlestickChart size={15} />
                  <span>{leg}</span>
                </div>
              ))}
            </div>

            <div className="stock-analysis-note">
              <Info size={16} />
              <span>{stock?.timeBasedStraddle?.note}</span>
            </div>

            <div className="stock-risk-note">{stock?.timeBasedStraddle?.riskNote}</div>
          </section>

          <section className="card stock-stats-card">
            <div className="stock-section-header">
              <div>
                <div className="stock-kicker">Market Snapshot</div>
                <h2>Session Stats</h2>
              </div>
            </div>

            <div className="stock-stats-grid">
              {marketStats.map((stat) => (
                <div key={stat.label} className={`stock-stat-box ${stat.tone || 'neutral'}`}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="stock-detail-sidebar">
          {holding && (
            <section className="card stock-position-card">
              <div className="stock-section-header">
                <div>
                  <div className="stock-kicker">Your Position</div>
                  <h2>Portfolio Exposure</h2>
                </div>
              </div>

              <div className="stock-position-list">
                <div className="stock-position-row">
                  <span>Shares</span>
                  <strong>{holding.quantity}</strong>
                </div>
                <div className="stock-position-row">
                  <span>Avg. Buy Price</span>
                  <strong>{formatCurrency(holding.avgBuyPrice)}</strong>
                </div>
                <div className="stock-position-row">
                  <span>Current Value</span>
                  <strong>{formatCurrency((holding.currentPrice || stock?.currentPrice || 0) * holding.quantity)}</strong>
                </div>
                <div className="stock-position-row">
                  <span>Invested</span>
                  <strong>{formatCurrency(holding.totalInvested)}</strong>
                </div>
              </div>

              {(() => {
                const currentValue = (holding.currentPrice || stock?.currentPrice || holding.avgBuyPrice) * holding.quantity;
                const pnl = currentValue - holding.totalInvested;
                const pnlPercent = holding.totalInvested ? (pnl / holding.totalInvested) * 100 : 0;

                return (
                  <div className={`stock-position-pnl ${pnl >= 0 ? 'positive' : 'negative'}`}>
                    <span>Unrealized P&amp;L</span>
                    <strong>
                      {pnl >= 0 ? '+' : ''}
                      {formatCurrency(pnl)} ({pnlPercent.toFixed(2)}%)
                    </strong>
                  </div>
                );
              })()}
            </section>
          )}

          <section className="card stock-execution-card">
            <div className="stock-section-header">
              <div>
                <div className="stock-kicker">Broker Redirect</div>
                <h2>Trade on Kite</h2>
              </div>
            </div>

            <div className="stock-trade-summary">
              <div className="stock-position-row">
                <span>Quantity</span>
                <strong>{quantity}</strong>
              </div>
              <div className="stock-position-row">
                <span>Current Price</span>
                <strong>{formatCurrency(stock?.currentPrice)}</strong>
              </div>
              <div className="stock-position-row">
                <span>Estimated Value</span>
                <strong>{formatCurrency(totalCost)}</strong>
              </div>
            </div>

            <div className="stock-kite-actions">
              <button className="btn btn-primary" onClick={() => handleKiteRedirect('buy')}>
                <ArrowUpRight size={14} />
                Buy on Kite
              </button>
              <button className="btn btn-outline" onClick={() => handleKiteRedirect('sell')}>
                <ArrowUpRight size={14} />
                Sell on Kite
              </button>
            </div>

            <button className="btn btn-outline stock-full-width" onClick={() => handleKiteRedirect('chart')}>
              <CandlestickChart size={14} />
              Open Kite
            </button>

            <p className="stock-small-note">{stock?.kite?.note}</p>
          </section>

          <section className="card stock-simulator-card">
            <div className="stock-section-header">
              <div>
                <div className="stock-kicker">Internal Portfolio</div>
                <h2>Track the Trade</h2>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                max={holding?.quantity || 9999}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, parseInt(event.target.value, 10) || 1))}
                className="form-input"
              />
            </div>

            <div className="stock-trade-summary">
              <div className="stock-position-row">
                <span>Recommendation</span>
                <strong>{recommendation?.signal || 'WAIT'}</strong>
              </div>
              <div className="stock-position-row">
                <span>Available Balance</span>
                <strong>{`₹${(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</strong>
              </div>
              <div className="stock-position-row">
                <span>Total</span>
                <strong>{formatCurrency(totalCost)}</strong>
              </div>
            </div>

            <div className="stock-kite-actions">
              <button
                className="btn btn-success"
                onClick={handlePortfolioBuy}
                disabled={tradeLoading || !canAfford}
                title={!canAfford ? 'Insufficient balance' : ''}
              >
                <ShoppingCart size={14} />
                {tradeLoading ? '...' : 'Add Buy'}
              </button>
              <button
                className="btn btn-danger"
                onClick={handlePortfolioSell}
                disabled={tradeLoading || !holding || holding.quantity === 0}
                title={!holding ? 'No holdings to sell' : ''}
              >
                <DollarSign size={14} />
                {tradeLoading ? '...' : 'Add Sell'}
              </button>
            </div>

            <p className="stock-small-note">
              Use these buttons to update the app portfolio after you place the actual order in your broker.
            </p>
          </section>

          <button className="btn btn-outline stock-full-width" onClick={handleWatchlist}>
            <Plus size={14} />
            Add to Watchlist
          </button>

          <button className="btn btn-outline stock-full-width" onClick={refreshStock}>
            <RefreshCw size={14} />
            Refresh Analysis
          </button>
        </aside>
      </div>
    </div>
  );
}
