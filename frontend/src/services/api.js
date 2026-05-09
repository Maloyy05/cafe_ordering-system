import axios from 'axios';
import toast from 'react-hot-toast';

const fallbackRenderUrl = 'https://cafe-ordering-system-rp77.onrender.com';
const base = import.meta.env.VITE_API_URL || (typeof location !== 'undefined' && location.hostname.includes('vercel.app') ? fallbackRenderUrl : 'http://localhost:5000');
console.log('VITE_API_URL (build):', import.meta.env.VITE_API_URL, ' -> using base:', base);
const API = axios.create({
  baseURL: `${base.replace(/\/$/, '')}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handler: handle 401 to prompt re-login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem('token');
      } catch (e) {}
      toast.error('Session expired or unauthorized. Please log in.');
      // redirect to login page
      try {
        window.location.href = '/login';
      } catch (e) {}
    }
    return Promise.reject(err);
  }
);

export default API;
