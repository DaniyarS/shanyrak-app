import axios from 'axios';
import authLogger from '../utils/authLogger';

// Base URL for API - can be configured via environment variable
// In development, use empty string to leverage Vite proxy
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a separate axios instance for the refresh endpoint
 * This instance has NO interceptors to avoid loops, but respects the same BASE_URL
 */
export const createRefreshAxios = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Token refresh state management
let isRefreshing = false;
let failedRequestsQueue = [];

/**
 * Process queued requests after token refresh
 * @param {string|null} error - Error if refresh failed
 * @param {string|null} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedRequestsQueue = [];
};

/**
 * Refresh the access token using refresh token
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    authLogger.info('Token Refresh', 'Attempting to refresh access token');

    // Use a fresh axios instance without interceptors to avoid loops
    // but still respects BASE_URL (for proxy in dev, direct URL in prod)
    const refreshAxios = createRefreshAxios();
    const response = await refreshAxios.post('/api/v1/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update tokens in localStorage
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
      authLogger.success('Token Refresh', 'Access token refreshed successfully');
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
      authLogger.success('Token Refresh', 'Refresh token updated');
    }

    return accessToken;
  } catch (error) {
    authLogger.error('Token Refresh', 'Refresh failed', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      hasRefreshToken: !!refreshToken,
      endpoint: '/api/v1/auth/refresh',
      baseURL: BASE_URL || '(using proxy)'
    });

    // Clear all auth data if refresh fails
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept the refresh endpoint itself to prevent loops
    if (originalRequest.url?.includes('/auth/refresh')) {
      authLogger.info('Auth Interceptor', 'Skipping interceptor for refresh endpoint');
      return Promise.reject(error);
    }

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      authLogger.warn('Auth Interceptor', '401 error detected', {
        url: originalRequest.url,
        method: originalRequest.method
      });

      // Prevent infinite loops by marking this request as retried
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        authLogger.info('Auth Interceptor', 'Token refresh in progress, queueing request');
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      authLogger.info('Auth Interceptor', 'Starting token refresh process');

      try {
        // Attempt to refresh the token
        const newAccessToken = await refreshAccessToken();

        // Process queued requests with new token
        processQueue(null, newAccessToken);
        authLogger.success('Auth Interceptor', 'Token refresh successful, retrying original request');

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authLogger.error('Auth Interceptor', 'Token refresh failed - triggering logout', {
          status: refreshError.response?.status,
          message: refreshError.response?.data?.message || refreshError.message,
          originalRequest: {
            url: originalRequest.url,
            method: originalRequest.method
          }
        });

        // Refresh failed - process queue with error
        processQueue(refreshError, null);

        // Emit custom event instead of hard redirect
        // This allows React app to handle logout gracefully
        const logoutEvent = new CustomEvent('auth:session-expired', {
          detail: { reason: 'refresh_failed', error: refreshError }
        });
        window.dispatchEvent(logoutEvent);

        // Fallback: If event is not handled in 100ms, do hard redirect
        setTimeout(() => {
          if (!window.location.pathname.includes('/login')) {
            authLogger.warn('Auth Interceptor', 'Event not handled, forcing redirect to login');
            window.location.href = '/login';
          }
        }, 100);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors or if retry already happened, just reject
    return Promise.reject(error);
  }
);

export default api;
