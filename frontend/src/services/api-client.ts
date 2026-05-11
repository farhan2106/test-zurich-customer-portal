import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // Send cookies with every request
});

// No request interceptor needed — JWT is in HTTP-only cookie, sent automatically

// Response interceptor: handle 401 (redirect to home/login)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't redirect for auth profile requests — AuthInitializer handles this silently
      console.log('[api-client] 401 on:', error.config?.url, 'includes check:', error.config?.url?.includes('/auth/profile'));
      if (!error.config?.url?.includes('/auth/profile')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
