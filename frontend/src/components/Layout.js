import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Briefcase, Eye, History, TrendingUp,
  LogOut, Menu, X, IndianRupee, Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/stocks', icon: Activity, label: 'Stocks' },
  { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { path: '/watchlist', icon: Eye, label: 'Watchlist' },
  { path: '/transactions', icon: History, label: 'Transactions' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatBalance = (bal) => {
    if (bal >= 100000) return `₹${(bal / 100000).toFixed(2)}L`;
    if (bal >= 1000) return `₹${(bal / 1000).toFixed(1)}K`;
    return `₹${bal?.toFixed(2)}`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '72px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border)',
          minHeight: '72px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <TrendingUp size={20} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Portiq</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NSE • BSE</div>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            margin: '12px auto',
            width: '40px',
            height: '40px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            flexShrink: 0
          }}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px' }}>
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? 'var(--accent-blue-light)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  borderLeft: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent'
                }}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Balance + User */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
        }}>
          {sidebarOpen && (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>AVAILABLE BALANCE</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>
                {formatBalance(user?.balance)}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--accent-red)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ fontSize: '14px' }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '240px' : '72px',
        transition: 'margin-left 0.25s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Topbar */}
        <header style={{
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            🇮🇳 NSE/BSE Market Data • Live
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              background: 'var(--accent-green)',
              borderRadius: '50%',
              marginLeft: '8px',
              animation: 'pulse-green 2s infinite'
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <IndianRupee size={14} color="var(--accent-green)" />
              <span style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'JetBrains Mono', color: 'var(--accent-green)' }}>
                {user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: 'white'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
