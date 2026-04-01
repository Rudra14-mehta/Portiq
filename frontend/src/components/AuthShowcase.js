import React from 'react';
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  CandlestickChart,
  Search,
  TrendingUp
} from 'lucide-react';

const INDICATOR_TAGS = [
  'RSI (14)',
  'SMA 20',
  'SMA 50',
  'SuperTrend',
  'Time-Based Straddle'
];

const FEATURE_ITEMS = [
  {
    icon: TrendingUp,
    title: 'Multi-Indicator Signals',
    description: 'RSI, Moving Average, and SuperTrend combine into live buy, sell, and hold guidance.'
  },
  {
    icon: CandlestickChart,
    title: 'Options Strategy Setup',
    description: 'Track the time-based straddle view with entry windows, ATM legs, and session context.'
  },
  {
    icon: Search,
    title: 'All Listed Shares',
    description: 'Browse the full stock directory, search quickly, and jump straight into analysis pages.'
  },
  {
    icon: ArrowUpRight,
    title: 'Kite Redirect Flow',
    description: 'Send stocks to Kite cleanly and use the in-app portfolio to record executed trades.'
  },
  {
    icon: Activity,
    title: 'Live Market Dashboard',
    description: 'Monitor NSE and BSE quotes, movers, charts, and indicator overlays from one screen.'
  },
  {
    icon: Briefcase,
    title: 'Portfolio Tracking',
    description: 'Follow holdings, P&L, transaction history, and recommendation context in one place.'
  }
];

export default function AuthShowcase() {
  return (
    <section className="auth-showcase">
      <div className="auth-showcase-backdrop" />

      <div className="auth-showcase-content">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <TrendingUp size={24} color="white" />
          </div>
          <div>
            <div className="auth-brand-title">Portiq</div>
            <div className="auth-brand-subtitle">Indian Market Portfolio Manager</div>
          </div>
        </div>

        <div className="auth-showcase-copy">
          <div className="auth-kicker">What You Get Inside</div>
          <h1 className="auth-hero-title">
            Trade Smarter with
            <span> Full Market Intelligence</span>
          </h1>
          <p className="auth-hero-description">
            Use every feature built into Portiq: RSI, Moving Average, SuperTrend, time-based straddle ideas,
            all listed shares, portfolio tracking, and direct Kite handoff from the stock page.
          </p>
        </div>

        <div className="auth-indicator-strip">
          {INDICATOR_TAGS.map((tag) => (
            <span key={tag} className="auth-indicator-tag">{tag}</span>
          ))}
        </div>

        <div className="auth-feature-grid">
          {FEATURE_ITEMS.map((feature) => (
            <article key={feature.title} className="auth-feature-card">
              <div className="auth-feature-icon">
                <feature.icon size={18} />
              </div>
              <div>
                <div className="auth-feature-title">{feature.title}</div>
                <p className="auth-feature-description">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
