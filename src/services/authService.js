import api from './api';

const authService = {
  // Login user
  login: async (phone, password) => {
    const formData = new URLSearchParams();
    formData.append('phone', phone);
    formData.append('password', password);

    const response = await api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Login response:', response.data);

    // Store token
    const token = response.data.token || response.data.access_token;
    if (token) {
      localStorage.setItem('authToken', token);

      // If user data is in the response, store it
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Create a user object from available data
        const user = {
          id: response.data.uuid || response.data.publicId || response.data.id,
          phone: phone,
          fullName: response.data.fullName || response.data.full_name || phone,
          role: response.data.role || 'CUSTOMER',
          email: response.data.email,
          login: response.data.login,
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);

    console.log('Register response:', response.data);

    // Store token
    const token = response.data.token || response.data.access_token;
    if (token) {
      localStorage.setItem('authToken', token);

      // If user data is in the response, store it
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Create user object from registration data and response
        const user = {
          id: response.data.uuid || response.data.publicId || response.data.id,
          phone: userData.phone,
          fullName: userData.fullName,
          role: userData.role || 'CUSTOMER',
          email: response.data.email,
          login: response.data.login,
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
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
