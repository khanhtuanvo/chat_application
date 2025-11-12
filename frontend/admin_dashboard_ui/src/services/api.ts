import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// User API (Day 7 backend)
export const userApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth interceptor
const addAuthHeader = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

userApi.interceptors.request.use(addAuthHeader);

// Add response interceptor for auth errors
const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

userApi.interceptors.response.use(undefined, handleAuthError);

// Export individual services for backward compatibility
export { userService } from './userService';
export { authService } from './authService'; 