import api, { createRefreshAxios } from './api';
import authLogger from '../utils/authLogger';

const authService = {
  // Check phone number availability and WhatsApp status
  checkPhone: async (phone) => {
    const response = await api.post('/api/v1/auth/check-phone', { phone });
    return response.data;
  },

  // Send OTP code to phone number
  sendOtp: async (phone) => {
    const response = await api.post('/api/v1/auth/send-otp', { phone });
    return response.data;
  },

  // Login user
  login: async (phone, password) => {
    const response = await api.post('/api/v1/auth/login', {
      login: phone,
      password: password,
    });

    console.log('Login response:', response.data);

    // Store access token and refresh token
    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
    }

    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    // Store user data
    if (response.data.user) {
      // Normalize user data
      const user = {
        id: response.data.user.publicId || response.data.user.uuid || response.data.user.id,
        phone: response.data.user.phone,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        role: response.data.user.role,
        email: response.data.user.email,
        phoneVerified: response.data.user.phoneVerified,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  // Register new user with OTP
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', {
      phone: userData.phone,
      password: userData.password,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      otpCode: userData.otpCode,
    });

    console.log('Register response:', response.data);

    // Store access token and refresh token
    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
    }

    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    // Store user data
    if (response.data.user) {
      // Normalize user data
      const user = {
        id: response.data.user.publicId || response.data.user.uuid || response.data.user.id,
        phone: response.data.user.phone,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        role: response.data.user.role,
        email: response.data.user.email,
        phoneVerified: response.data.user.phoneVerified,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  // Reset password with OTP
  resetPassword: async (phone, otpCode, newPassword) => {
    const response = await api.post('/api/v1/auth/reset-password', {
      phone,
      otpCode,
      newPassword,
    });
    return response.data;
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Use createRefreshAxios to avoid interceptor loops while respecting proxy config
    const refreshAxios = createRefreshAxios();
    const response = await refreshAxios.post('/api/v1/auth/refresh', { refreshToken });

    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
    }

    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data;
  },

  // Setup proactive token refresh (call this on app initialization)
  setupTokenRefresh: (intervalMinutes = 14) => {
    // Clear any existing interval
    if (authService._refreshInterval) {
      clearInterval(authService._refreshInterval);
    }

    // Only setup if user is authenticated
    if (!authService.isAuthenticated()) {
      return;
    }

    // Refresh token every X minutes (default 14 minutes for a 15-minute token)
    authService._refreshInterval = setInterval(async () => {
      try {
        if (authService.isAuthenticated()) {
          authLogger.info('Proactive Refresh', 'Attempting scheduled token refresh');
          await authService.refreshToken();
          authLogger.success('Proactive Refresh', 'Token refreshed successfully');
        } else {
          authLogger.info('Proactive Refresh', 'User no longer authenticated, clearing interval');
          clearInterval(authService._refreshInterval);
        }
      } catch (error) {
        authLogger.error('Proactive Refresh', 'Failed', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.response?.data?.message || error.message
        });

        // If refresh fails (e.g., refresh token expired), logout user
        if (error.response?.status === 401) {
          authLogger.warn('Proactive Refresh', 'Refresh token expired - triggering logout');
          authService.logout();

          // Emit custom event for graceful handling
          const logoutEvent = new CustomEvent('auth:session-expired', {
            detail: { reason: 'proactive_refresh_failed', error }
          });
          window.dispatchEvent(logoutEvent);

          // Fallback redirect if event not handled
          setTimeout(() => {
            if (!window.location.pathname.includes('/login')) {
              authLogger.warn('Proactive Refresh', 'Event not handled, forcing redirect to login');
              window.location.href = '/login';
            }
          }, 100);
        }

        // Clear interval on error
        clearInterval(authService._refreshInterval);
      }
    }, intervalMinutes * 60 * 1000);
  },

  // Clear token refresh interval
  clearTokenRefresh: () => {
    if (authService._refreshInterval) {
      clearInterval(authService._refreshInterval);
      authService._refreshInterval = null;
    }
  },

  _refreshInterval: null,

  // Logout user
  logout: () => {
    // Clear refresh interval
    authService.clearTokenRefresh();

    // Clear tokens and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user from local storage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default authService;
