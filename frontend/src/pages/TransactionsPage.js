import React, { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getTransactions()
      .then(res => setTransactions(res.data.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type === filter);

  const totalBought = transactions.filter(t => t.type === 'BUY').reduce((s, t) => s + t.totalAmount, 0);
  const totalSold = transactions.filter(t => t.type === 'SELL').reduce((s, t) => s + t.totalAmount, 0);

  if (loading) return (
    <div className="loading-screen" style={{ height: '60vh' }}>
      <div className="loading-spinner" />
      <p>Loading transaction history...</p>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Transaction History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>All buy/sell orders with RSI context</p>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>TOTAL TRADES</div>
          <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'JetBrains Mono' }}>{transactions.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>TOTAL BOUGHT</div>
          <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'JetBrains Mono', color: 'var(--accent-green)' }}>
            ₹{totalBought.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>TOTAL SOLD</div>
          <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'JetBrains Mono', color: 'var(--accent-red)' }}>
            ₹{totalSold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['ALL', 'BUY', 'SELL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 20px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '13px', fontFamily: 'Space Grotesk', fontWeight: '500',
              background: filter === f ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--accent-blue)' : 'var(--border)'}`
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ color: 'var(--text-secondary)' }}>No transactions yet. Start trading!</p>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Stock</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>RSI at Trade</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    {new Date(t.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{t.symbol.replace('.NS', '')}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.companyName}</div>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                      background: t.type === 'BUY' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: t.type === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)',
                      display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content'
                    }}>
                      {t.type === 'BUY' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {t.type}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{t.quantity}</td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>₹{t.price?.toFixed(2)}</td>
                  <td style={{
                    fontFamily: 'JetBrains Mono', fontWeight: '600',
                    color: t.type === 'BUY' ? 'var(--accent-red)' : 'var(--accent-green)'
                  }}>
                    {t.type === 'BUY' ? '-' : '+'}₹{t.totalAmount?.toFixed(2)}
                  </td>
                  <td>
                    {t.rsiAtTransaction !== undefined && t.rsiAtTransaction !== null ? (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: '600' }}>
                        {t.rsiAtTransaction.toFixed(1)}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {t.recommendation ? (
                      <span style={{
                        fontSize: '11px', fontWeight: '600',
                        padding: '2px 8px', borderRadius: '4px',
                        background: t.recommendation.includes('BUY') ? 'rgba(16,185,129,0.15)' :
                          t.recommendation.includes('SELL') ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                        color: t.recommendation.includes('BUY') ? 'var(--accent-green)' :
                          t.recommendation.includes('SELL') ? 'var(--accent-red)' : 'var(--accent-yellow)'
                      }}>
                        {t.recommendation}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
