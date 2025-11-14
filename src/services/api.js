import axios from 'axios';

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
    const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update tokens in localStorage
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return accessToken;
  } catch (error) {
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

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops by marking this request as retried
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
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

      try {
        // Attempt to refresh the token
        const newAccessToken = await refreshAccessToken();

        // Process queued requests with new token
        processQueue(null, newAccessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - process queue with error and redirect to login
        processQueue(refreshError, null);

        // Redirect to login page
        window.location.href = '/login';

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
