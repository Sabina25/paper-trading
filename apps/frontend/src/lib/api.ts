import axios from 'axios';

// Базовый URL нашего бэкенда
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

// Interceptor — перехватывает каждый запрос перед отправкой
// и автоматически добавляет токен в заголовок
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для ответов — если токен истёк (401) → разлогиниваем
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Функции для каждого endpoint бэкенда

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const assetsApi = {
  getAll: () => api.get('/assets'),
};

export const portfolioApi = {
  get: () => api.get('/portfolio'),
  placeOrder: (data: { symbol: string; side: 'BUY' | 'SELL'; quantity: number }) =>
    api.post('/portfolio/order', data),
  getOrders: () => api.get('/portfolio/orders'),
};

export default api;