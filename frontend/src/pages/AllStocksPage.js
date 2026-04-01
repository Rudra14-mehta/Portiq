import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronLeft, ChevronRight, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { getMultipleQuotes, getPopularStocks } from '../services/api';

const PAGE_SIZE = 24;

function formatPrice(value) {
  return Number.isFinite(value) ? `₹${value.toFixed(2)}` : '—';
}

function formatVolume(value) {
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
}

export default function AllStocksPage() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [sector, setSector] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await getPopularStocks();
        const uniqueStocks = Array.from(
          new Map((response.data.stocks || []).map((stock) => [stock.symbol, stock])).values()
        ).sort((left, right) => left.symbol.localeCompare(right.symbol));

        if (!cancelled) {
          setStocks(uniqueStocks);
        }
      } catch (error) {
        console.error('Failed to fetch stock list:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStocks();

    return () => {
      cancelled = true;
    };
  }, []);

  const sectors = ['ALL', ...new Set(stocks.map((stock) => stock.sector).filter(Boolean))].sort();
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = !searchQ.trim() ||
      stock.symbol.toLowerCase().includes(searchQ.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchQ.toLowerCase());

    const matchesSector = sector === 'ALL' || stock.sector === sector;
    return matchesSearch && matchesSector;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleStocks = filteredStocks.slice(pageStart, pageStart + PAGE_SIZE);
  const visibleSymbols = visibleStocks.map((stock) => stock.symbol);
  const visibleSymbolsKey = visibleSymbols.join(',');

  useEffect(() => {
    setPage(1);
  }, [searchQ, sector]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!visibleSymbolsKey) {
      return;
    }

    let cancelled = false;

    const fetchQuotes = async () => {
      try {
        setQuoteLoading(true);
        const response = await getMultipleQuotes(visibleSymbolsKey.split(','));
        const nextQuotes = {};

        (response.data.stocks || []).forEach((quote) => {
          nextQuotes[quote.symbol] = quote;
        });

        if (!cancelled) {
          setQuotes((previous) => ({ ...previous, ...nextQuotes }));
        }
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
      } finally {
        if (!cancelled) {
          setQuoteLoading(false);
        }
      }
    };

    fetchQuotes();

    return () => {
      cancelled = true;
    };
  }, [visibleSymbolsKey]);

  const refreshVisibleQuotes = async () => {
    if (!visibleSymbols.length) {
      return;
    }

    try {
      setQuoteLoading(true);
      const response = await getMultipleQuotes(visibleSymbols);
      const nextQuotes = {};

      (response.data.stocks || []).forEach((quote) => {
        nextQuotes[quote.symbol] = quote;
      });

      setQuotes((previous) => ({ ...previous, ...nextQuotes }));
    } catch (error) {
      console.error('Failed to refresh quotes:', error);
    } finally {
      setQuoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ height: '60vh' }}>
        <div className="loading-spinner" />
        <p>Loading all listed shares...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>All Listed Shares</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Browse all available shares from the platform list. Showing {filteredStocks.length} stocks.
          </p>
        </div>

        <button
          className="btn btn-outline"
          onClick={refreshVisibleQuotes}
          disabled={quoteLoading}
        >
          <RefreshCw size={14} className={quoteLoading ? 'spin' : ''} />
          {quoteLoading ? 'Refreshing...' : 'Refresh Visible Quotes'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="grid-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 12px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={searchQ}
                onChange={(event) => setSearchQ(event.target.value)}
                placeholder="Reliance, TCS, Banking..."
                className="form-input"
                style={{ border: 'none', paddingLeft: 0 }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sector</label>
            <select
              className="form-input"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
            >
              {sectors.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Page</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', minHeight: '46px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {currentPage} / {totalPages}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {visibleStocks.length} on this page
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--accent-blue)" />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Stocks Directory</span>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {quoteLoading ? 'Updating visible quotes...' : 'Click any row to analyze that stock.'}
          </div>
        </div>

        {visibleStocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-secondary)' }}>
            No stocks matched your filters.
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>Volume</th>
                    <th>Sector</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStocks.map((stock) => {
                    const quote = quotes[stock.symbol];
                    const isPositive = (quote?.changePercent || 0) >= 0;

                    return (
                      <tr
                        key={stock.symbol}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/stock/${stock.symbol}`)}
                      >
                        <td>
                          <div style={{ fontWeight: '600' }}>{stock.symbol.replace('.NS', '').replace('.BO', '')}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stock.name}</div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: '600' }}>
                            {formatPrice(quote?.currentPrice)}
                          </span>
                        </td>
                        <td>
                          {quote ? (
                            <span style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {isPositive ? '+' : ''}{quote.changePercent?.toFixed(2)}%
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Loading...</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                          {formatVolume(quote?.volume)}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--accent-purple)', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                            {stock.sector}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/stock/${stock.symbol}`);
                            }}
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                Showing {pageStart + 1}-{Math.min(pageStart + visibleStocks.length, filteredStocks.length)} of {filteredStocks.length}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
