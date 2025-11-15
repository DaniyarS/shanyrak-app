import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import authLogger from '../utils/authLogger';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Inner component that can use hooks for navigation
const SessionExpiryHandler = ({ onSessionExpired }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = (event) => {
      authLogger.warn('Session Handler', 'Session expired event received', {
        reason: event.detail?.reason
      });

      // Call the logout handler
      onSessionExpired();

      // Navigate to login using React Router (preserves console logs)
      navigate('/login', { replace: true });
    };

    // Listen for session expiry events
    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [navigate, onSessionExpired]);

  return null; // This component only handles events, renders nothing
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Print recent auth logs on app startup for debugging
    authLogger.info('App Startup', 'Application started - checking authentication');
    const recentLogs = authLogger.getLogs().slice(-5);
    if (recentLogs.length > 0) {
      console.log('📋 Recent auth events (from previous session):');
      recentLogs.forEach((log) => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        console.log(`  [${time}] ${log.category}: ${log.message}`);
      });
    }

    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      authLogger.info('App Startup', 'User found in localStorage', {
        userId: currentUser.id,
        role: currentUser.role
      });

      // Setup proactive token refresh if user is authenticated
      authService.setupTokenRefresh(14); // Refresh every 14 minutes
    } else {
      authLogger.info('App Startup', 'No user found in localStorage');
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
    authLogger.info('Auth Context', 'User logout initiated');
    authService.logout();
    setUser(null);
  };

  const handleSessionExpired = () => {
    authLogger.warn('Auth Context', 'Handling session expiry - clearing user state');
    setUser(null);
    // authService.logout() is already called by the interceptor
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

  return (
    <AuthContext.Provider value={value}>
      <SessionExpiryHandler onSessionExpired={handleSessionExpired} />
      {children}
    </AuthContext.Provider>
  );
};
