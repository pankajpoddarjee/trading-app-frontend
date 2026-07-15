import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ AUTH ============
export const registerUser = (data: any) => api.post('/auth/register', data);
export const loginUser = (data: any) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// ============ PROFILE ============
export const updateProfile = (data: any) => api.put('/profile/update', data);
export const changePassword = (data: any) => api.put('/profile/change-password', data);

// ============ YAHOO FINANCE APIs ============
export const getQuote = (symbol: string) => api.get(`/trade/quote/${symbol}`);
export const searchSymbol = (query: string) => api.get(`/trade/search/${query}`);
export const getChartData = (symbol: string, range = '1mo') => 
  api.get(`/trade/chart/${symbol}?range=${range}`);
export const getCompanyProfile = (symbol: string) => api.get(`/trade/profile/${symbol}`);
export const getMarketNews = () => api.get('/trade/news');
export const getIndices = () => api.get('/trade/indices');
export const getScreeners = (type: string) => api.get(`/trade/screeners/${type}`);


// ============ PORTFOLIO APIs ============
export const getPortfolio = () => api.get('/portfolio');
export const addHolding = (data: any) => api.post('/portfolio/add', data);
export const sellHolding = (data: any) => api.post('/portfolio/sell', data);
export const deleteHolding = (id: number) => api.delete(`/portfolio/delete/${id}`);
export const updatePrice = (id: number, currentPrice: number) => api.put(`/portfolio/price/${id}`, { currentPrice });
export const getTransactions = () => api.get('/portfolio/transactions');

// ============ MASTER STOCK APIs ============
export const searchMasterStocks = (query: string) => api.get(`/master/search?q=${query}`);
export const addMasterStock = (data: any) => api.post('/master/add', data);
export const getAllMasterStocks = () => api.get('/master');
export const updateMasterStock = (id: number, data: any) => api.put(`/master/update/${id}`, data);
export const deleteMasterStock = (id: number) => api.delete(`/master/delete/${id}`);
// ============ BULK PORTFOLIO APIs ============
export const getBulkPortfolio = () => api.get('/bulk-portfolio');
export const addBulkHoldings = (data: any) => api.post('/bulk-portfolio/add-bulk', data);
export const deleteBulkHolding = (id: number) => api.delete(`/bulk-portfolio/delete/${id}`);




export default api;