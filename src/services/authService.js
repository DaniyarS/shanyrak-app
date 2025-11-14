import api from './api';

const authService = {
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

    const response = await api.post('/api/v1/auth/refresh', { refreshToken });

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
          await authService.refreshToken();
          console.log('Token refreshed proactively');
        } else {
          // Clear interval if user is no longer authenticated
          clearInterval(authService._refreshInterval);
        }
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
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
