import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    const savedUserId = localStorage.getItem('userId');
    
    if (savedUser && savedUserId) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
      setUserId(savedUserId);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await apiService.login(username, password);
    
    if (data.success) {
      setIsAuthenticated(true);
      setCurrentUser(data.username);
      setUserId(data.userId);
      localStorage.setItem('currentUser', data.username);
      localStorage.setItem('userId', data.userId);
      return { success: true };
    }
    
    return { success: false, message: data.message || 'Invalid credentials' };
  };

  const register = async (username, password) => {
    const data = await apiService.register(username, password);
    
    if (data.success) {
      // Auto-login after successful registration
      const loginResult = await login(username, password);
      return loginResult;
    }
    
    return { success: false, message: data.message || 'Registration failed' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setUserId('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
  };

  const value = {
    isAuthenticated,
    currentUser,
    userId,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
