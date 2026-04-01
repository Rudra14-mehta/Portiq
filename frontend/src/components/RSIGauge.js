import React from 'react';

export default function RSIGauge({ rsi, size = 'md' }) {
  if (rsi === null || rsi === undefined) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;

  const getColor = (rsi) => {
    if (rsi <= 30) return '#10b981';
    if (rsi <= 40) return '#34d399';
    if (rsi <= 55) return '#f59e0b';
    if (rsi <= 70) return '#f97316';
    return '#ef4444';
  };

  const getLabel = (rsi) => {
    if (rsi <= 30) return 'Oversold';
    if (rsi <= 40) return 'Near Oversold';
    if (rsi <= 55) return 'Neutral';
    if (rsi <= 70) return 'Near Overbought';
    return 'Overbought';
  };

  const color = getColor(rsi);
  const label = getLabel(rsi);

  if (size === 'lg') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>RSI (14)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color, fontFamily: 'JetBrains Mono' }}>{rsi}</span>
            <span style={{ fontSize: '12px', color, padding: '2px 8px', background: `${color}20`, borderRadius: '4px' }}>{label}</span>
          </div>
        </div>
        <div style={{ position: 'relative', height: '10px', background: 'linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)', borderRadius: '5px' }}>
          {/* Zone markers */}
          <div style={{ position: 'absolute', left: '30%', top: '-4px', width: '1px', height: '18px', background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ position: 'absolute', left: '70%', top: '-4px', width: '1px', height: '18px', background: 'rgba(255,255,255,0.3)' }} />
          {/* Indicator */}
          <div style={{
            position: 'absolute',
            top: '-5px',
            left: `${rsi}%`,
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            border: `3px solid ${color}`,
            transform: 'translateX(-50%)',
            boxShadow: `0 0 8px ${color}80`,
            transition: 'left 0.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span style={{ color: '#10b981' }}>0 — Oversold</span>
          <span>30</span>
          <span>50</span>
          <span>70</span>
          <span style={{ color: '#ef4444' }}>100 — Overbought</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', fontWeight: '600', color }}>{rsi}</span>
      <span style={{ fontSize: '11px', color, padding: '1px 6px', background: `${color}20`, borderRadius: '3px' }}>{label}</span>
    </div>
  );
}
