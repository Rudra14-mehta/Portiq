import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortfolio } from '../services/api';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolio()
      .then(res => setPortfolio(res.data.portfolio))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-screen" style={{ height: '60vh' }}>
      <div className="loading-spinner" />
      <p>Loading portfolio...</p>
    </div>
  );

  const holdings = portfolio?.holdings || [];
  const totalInvested = holdings.reduce((s, h) => s + h.totalInvested, 0);
  const totalCurrentValue = holdings.reduce((s, h) => s + (h.currentPrice || h.avgBuyPrice) * h.quantity, 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const pieData = holdings.map((h, i) => ({
    name: h.symbol.replace('.NS', ''),
    value: parseFloat(((h.currentPrice || h.avgBuyPrice) * h.quantity).toFixed(2))
  }));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>My Portfolio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Real-time holdings with live prices</p>
        </div>
        <button className="btn btn-outline" onClick={() => { setLoading(true); getPortfolio().then(r => setPortfolio(r.data.portfolio)).finally(() => setLoading(false)); }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Invested', value: `₹${totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'var(--text-primary)' },
          { label: 'Current Value', value: `₹${totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'var(--accent-blue)' },
          { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}₹${Math.abs(totalPnL).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: totalPnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
          { label: 'P&L %', value: `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`, color: pnlPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'JetBrains Mono', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {holdings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ marginBottom: '8px' }}>Your portfolio is empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Start by buying some stocks from the dashboard</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Stocks</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
          {/* Holdings table */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Holdings ({holdings.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Qty</th>
                    <th>Avg Cost</th>
                    <th>Current</th>
                    <th>Invested</th>
                    <th>Curr Value</th>
                    <th>P&L</th>
                    <th>P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map(h => {
                    const currVal = (h.currentPrice || h.avgBuyPrice) * h.quantity;
                    const pnl = currVal - h.totalInvested;
                    const pct = (pnl / h.totalInvested) * 100;
                    return (
                      <tr key={h.symbol} style={{ cursor: 'pointer' }} onClick={() => navigate(`/stock/${h.symbol}`)}>
                        <td>
                          <div style={{ fontWeight: '600' }}>{h.symbol.replace('.NS', '')}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.sector}</div>
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono' }}>{h.quantity}</td>
                        <td style={{ fontFamily: 'JetBrains Mono' }}>₹{h.avgBuyPrice?.toFixed(2)}</td>
                        <td style={{ fontFamily: 'JetBrains Mono' }}>
                          {h.currentPrice ? `₹${h.currentPrice.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono' }}>₹{h.totalInvested?.toFixed(0)}</td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '600', color: 'var(--accent-blue)' }}>₹{currVal.toFixed(0)}</td>
                        <td style={{ fontFamily: 'JetBrains Mono', color: pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                          {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toFixed(2)}
                        </td>
                        <td>
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            color: pct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                            fontFamily: 'JetBrains Mono', fontWeight: '600'
                          }}>
                            {pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie chart */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Allocation</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend formatter={(v) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
