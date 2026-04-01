import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Stock APIs
export const getPopularStocks = () => API.get('/stocks/popular');
export const searchStocks = (q) => API.get(`/stocks/search?q=${q}`);
export const getStockAnalysis = (symbol) => API.get(`/stocks/analyze/${symbol}`);
export const getMultipleQuotes = (symbols) => API.get(`/stocks/quotes?symbols=${symbols.join(',')}`);

// Portfolio APIs
export const getPortfolio = () => API.get('/portfolio');
export const buyStock = (data) => API.post('/portfolio/buy', data);
export const sellStock = (data) => API.post('/portfolio/sell', data);
export const getTransactions = () => API.get('/portfolio/transactions');

// Watchlist APIs
export const getWatchlist = () => API.get('/watchlist');
export const addToWatchlist = (symbol) => API.post('/watchlist/add', { symbol });
export const removeFromWatchlist = (symbol) => API.delete(`/watchlist/${symbol}`);

export default API;
