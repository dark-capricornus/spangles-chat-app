import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    return `${window.location.origin}/api`;
  }

  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  return 'http://localhost:5000/api';
};

const baseURL = getApiBaseUrl();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('lastLoginTime');
      localStorage.removeItem('rememberMe');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
