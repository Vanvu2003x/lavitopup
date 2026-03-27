import axios from 'axios';

const api = axios.create({
  baseURL: (typeof window === 'undefined' ? (process.env.INTERNAL_API_URL || process.env.API_URL) : undefined) || process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000 // 30 seconds timeout
});


// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Check if we should skip redirect for this specific request
      if (error.config?.skipRedirectOn401) {
        return Promise.reject(error);
      }

      // Don't redirect if on auth pages (login, register, forgot-password)
      // so that error toasts can be shown correctly
      const isAuthPage = typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/auth/');

      if (!isAuthPage) {
        // Clear local storage
        localStorage.removeItem('name');
        localStorage.removeItem('balance');

        // Only redirect if we're in browser and not already on home
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          console.warn('🔒 Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
          window.location.href = '/';
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Lỗi kết nối mạng:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
