import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);

      // Setup proactive token refresh if user is authenticated
      authService.setupTokenRefresh(14); // Refresh every 14 minutes
    }
    setLoading(false);

    // Cleanup on unmount
    return () => {
      authService.clearTokenRefresh();
    };
  }, []);

  const login = async (phone, password) => {
    try {
      const data = await authService.login(phone, password);

      // Get the updated user from localStorage (authService stores it)
      const currentUser = authService.getCurrentUser();
      console.log('Setting user in context:', currentUser);
      setUser(currentUser);

      // Setup proactive token refresh after successful login
      authService.setupTokenRefresh(14); // Refresh every 14 minutes

      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);

      // Get the updated user from localStorage (authService stores it)
      const currentUser = authService.getCurrentUser();
      console.log('Setting user in context after registration:', currentUser);
      setUser(currentUser);

      // Setup proactive token refresh after successful registration
      authService.setupTokenRefresh(14); // Refresh every 14 minutes

      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedData) => {
    // Merge updated data with current user
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);

    // Update localStorage
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
