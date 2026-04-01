import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AllStocksPage from './pages/AllStocksPage';
import PortfolioPage from './pages/PortfolioPage';
import StockDetailPage from './pages/StockDetailPage';
import WatchlistPage from './pages/WatchlistPage';
import TransactionsPage from './pages/TransactionsPage';
import Layout from './components/Layout';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/portfolio" element={
            <PrivateRoute>
              <Layout>
                <PortfolioPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/stocks" element={
            <PrivateRoute>
              <Layout>
                <AllStocksPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/stock/:symbol" element={
            <PrivateRoute>
              <Layout>
                <StockDetailPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/watchlist" element={
            <PrivateRoute>
              <Layout>
                <WatchlistPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/transactions" element={
            <PrivateRoute>
              <Layout>
                <TransactionsPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
