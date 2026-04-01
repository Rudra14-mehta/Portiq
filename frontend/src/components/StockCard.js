import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import RSIGauge from './RSIGauge';

export default function StockCard({ stock, onAddWatchlist, compact = false }) {
  const navigate = useNavigate();
  const isPositive = parseFloat(stock.changePercent) >= 0;

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
      onClick={() => navigate(`/stock/${stock.symbol}`)}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>{stock.symbol.replace('.NS', '').replace('.BO', '')}</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', borderRadius: '3px' }}>NSE</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {stock.companyName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: '700', fontSize: '16px' }}>
            ₹{stock.currentPrice?.toFixed(2)}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{stock.changePercent}%
          </div>
        </div>
      </div>

      {/* Sector badge */}
      {stock.sector && (
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', borderRadius: '4px' }}>
            {stock.sector}
          </span>
        </div>
      )}

      {/* RSI */}
      {stock.rsi && (
        <div style={{ marginBottom: '12px' }}>
          <RSIGauge rsi={stock.rsi} />
        </div>
      )}

      {/* Recommendation */}
      {stock.recommendation && (
        <div style={{
          padding: '8px 12px',
          background: `${stock.recommendation.color}15`,
          border: `1px solid ${stock.recommendation.color}40`,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: stock.recommendation.color }}>
            {stock.recommendation.signal}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RSI Signal</span>
        </div>
      )}

      {/* Actions */}
      {onAddWatchlist && (
        <button
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '12px', fontSize: '13px' }}
          onClick={e => { e.stopPropagation(); onAddWatchlist(stock.symbol); }}
        >
          <Plus size={14} /> Add to Watchlist
        </button>
      )}
    </div>
  );
}
