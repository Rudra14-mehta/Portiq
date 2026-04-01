import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWatchlist, removeFromWatchlist, getPopularStocks, addToWatchlist } from '../services/api';
import { TrendingUp, TrendingDown, Trash2, Plus, RefreshCw } from 'lucide-react';
import RSIGauge from '../components/RSIGauge';

export default function WatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [popularStocks, setPopularStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [wlRes, popRes] = await Promise.all([getWatchlist(), getPopularStocks()]);
      setWatchlist(wlRes.data.stocks || []);
      setPopularStocks(popRes.data.stocks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist(prev => prev.filter(s => s.symbol !== symbol));
      setMessage('Removed from watchlist');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (symbol) => {
    try {
      await addToWatchlist(symbol);
      setMessage('Added to watchlist!');
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Already in watchlist');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const watchedSymbols = new Set(watchlist.map(s => s.symbol));

  if (loading) return (
    <div className="loading-screen" style={{ height: '60vh' }}>
      <div className="loading-spinner" />
      <p>Loading watchlist with live RSI data...</p>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Watchlist</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Monitor stocks with RSI signals</p>
        </div>
        <button className="btn btn-outline" onClick={() => { setLoading(true); fetchData(); }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {watchlist.length > 0 ? (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Your Watchlist ({watchlist.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Price</th>
                <th>Change</th>
                <th>RSI</th>
                <th>Signal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map(stock => {
                const isPos = parseFloat(stock.changePercent) >= 0;
                return (
                  <tr key={stock.symbol}>
                    <td>
                      <div style={{ fontWeight: '600', cursor: 'pointer', color: 'var(--accent-blue)' }}
                        onClick={() => navigate(`/stock/${stock.symbol}`)}>
                        {stock.symbol.replace('.NS', '')}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stock.companyName}</div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '600' }}>
                      {stock.currentPrice ? `₹${stock.currentPrice.toFixed(2)}` : '—'}
                    </td>
                    <td>
                      {stock.changePercent ? (
                        <span style={{ color: isPos ? 'var(--accent-green)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {isPos ? '+' : ''}{stock.changePercent}%
                        </span>
                      ) : '—'}
                    </td>
                    <td><RSIGauge rsi={stock.rsi} /></td>
                    <td>
                      {stock.recommendation && (
                        <span style={{
                          fontSize: '12px', fontWeight: '700',
                          color: stock.recommendation.color,
                          padding: '3px 10px',
                          background: `${stock.recommendation.color}15`,
                          borderRadius: '4px'
                        }}>
                          {stock.recommendation.signal}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => navigate(`/stock/${stock.symbol}`)}>
                          Trade
                        </button>
                        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px', color: 'var(--accent-red)' }}
                          onClick={() => handleRemove(stock.symbol)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👁️</div>
          <p style={{ color: 'var(--text-secondary)' }}>No stocks in your watchlist. Add some below!</p>
        </div>
      )}

      {/* Popular stocks to add */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add Popular NSE Stocks</h3>
        <div className="grid-3">
          {popularStocks.filter(s => !watchedSymbols.has(s.symbol)).slice(0, 12).map(stock => (
            <div key={stock.symbol} style={{
              padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{stock.symbol.replace('.NS', '')}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stock.sector}</div>
              </div>
              <button className="btn btn-outline" style={{ fontSize: '12px', padding: '5px 10px' }}
                onClick={() => handleAdd(stock.symbol)}>
                <Plus size={12} /> Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
