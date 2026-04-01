import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMultipleQuotes, getPortfolio, searchStocks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Search, RefreshCw, Briefcase, Activity } from 'lucide-react';
import RSIGauge from '../components/RSIGauge';

const NIFTY50_SYMBOLS = [
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
  'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'BHARTIARTL.NS'
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [stockRes, portRes] = await Promise.all([
        getMultipleQuotes(NIFTY50_SYMBOLS),
        getPortfolio()
      ]);
      setStocks(stockRes.data.stocks || []);
      setPortfolio(portRes.data.portfolio);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await searchStocks(searchQ);
        setSearchResults(res.data.stocks.slice(0, 8));
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const totalInvested = portfolio?.holdings?.reduce((s, h) => s + h.totalInvested, 0) || 0;
  const totalCurrentValue = portfolio?.totalCurrentValue || 0;
  const totalPnL = totalCurrentValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const statCards = [
    {
      label: 'Available Balance',
      value: `₹${user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: '💰',
      color: 'var(--accent-blue)'
    },
    {
      label: 'Portfolio Value',
      value: `₹${totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: '📊',
      color: 'var(--accent-purple)'
    },
    {
      label: 'Total P&L',
      value: `${totalPnL >= 0 ? '+' : ''}₹${Math.abs(totalPnL).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      change: `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`,
      icon: totalPnL >= 0 ? '📈' : '📉',
      color: totalPnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
    },
    {
      label: 'Holdings',
      value: portfolio?.holdings?.length || 0,
      icon: '🏦',
      color: 'var(--accent-yellow)'
    }
  ];

  if (loading) return (
    <div className="loading-screen" style={{ height: '60vh' }}>
      <div className="loading-spinner" />
      <p>Fetching live market data...</p>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • NSE Market Hours: 9:15 AM – 3:30 PM IST
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => { setRefreshing(true); fetchData(); }}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Prices'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {statCards.map(stat => (
          <div key={stat.label} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: stat.color, fontFamily: 'JetBrains Mono' }}>
                  {stat.value}
                </div>
                {stat.change && (
                  <div style={{ fontSize: '12px', color: stat.color, marginTop: '4px' }}>{stat.change}</div>
                )}
              </div>
              <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search stocks... (e.g., Reliance, TCS, HDFC)"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'Space Grotesk' }}
          />
        </div>
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: '10px', marginTop: '4px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
          }}>
            {searchResults.map(stock => (
              <div
                key={stock.symbol}
                onClick={() => { navigate(`/stock/${stock.symbol}`); setSearchQ(''); setSearchResults([]); }}
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: '1px solid var(--border)'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{stock.symbol.replace('.NS', '')}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{stock.name}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-purple)', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  {stock.sector}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Overview */}
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600' }}>🏪 Market Overview — Top NSE Stocks</h2>
        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => navigate('/stocks')}>
          View All <Activity size={12} />
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ marginBottom: '24px' }}>
          <thead>
            <tr>
              <th>Stock</th>
              <th>Price</th>
              <th>Change</th>
              <th>Volume</th>
              <th>RSI Signal</th>
              <th>Sector</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => {
              const isPos = parseFloat(stock.changePercent) >= 0;
              return (
                <tr key={stock.symbol} style={{ cursor: 'pointer' }} onClick={() => navigate(`/stock/${stock.symbol}`)}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{stock.symbol.replace('.NS', '').replace('.BO', '')}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stock.companyName}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: '600' }}>₹{stock.currentPrice?.toFixed(2)}</span>
                  </td>
                  <td>
                    <span style={{ color: isPos ? 'var(--accent-green)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isPos ? '+' : ''}{stock.changePercent}%
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                    {(stock.volume / 100000).toFixed(1)}L
                  </td>
                  <td>
                    <RSIGauge rsi={null} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to analyze</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: 'var(--accent-purple)', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {stock.sector}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={e => { e.stopPropagation(); navigate(`/stock/${stock.symbol}`); }}>
                      Analyze
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Holdings */}
      {portfolio?.holdings?.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>💼 Your Holdings</h2>
            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => navigate('/portfolio')}>
              View Portfolio <Briefcase size={12} />
            </button>
          </div>
          <div className="grid-3">
            {portfolio.holdings.slice(0, 6).map(h => {
              const currentVal = (h.currentPrice || h.avgBuyPrice) * h.quantity;
              const pnl = currentVal - h.totalInvested;
              const pnlPct = (pnl / h.totalInvested) * 100;
              return (
                <div key={h.symbol} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/stock/${h.symbol}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '700' }}>{h.symbol.replace('.NS', '')}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{h.quantity} shares</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontWeight: '600' }}>₹{currentVal.toFixed(2)}</div>
                      <div style={{ fontSize: '12px', color: pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
