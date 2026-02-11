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
    console.log('🔐 [AuthContext] Login attempt started');
    console.log('👤 Username:', username);
    
    try {
      const data = await apiService.login(username, password);
      console.log('📥 [AuthContext] Login response received:', data);
      
      if (data.success) {
        console.log('✅ [AuthContext] Login successful');
        setIsAuthenticated(true);
        setCurrentUser(data.username);
        setUserId(data.userId);
        localStorage.setItem('currentUser', data.username);
        localStorage.setItem('userId', data.userId);
        console.log('💾 [AuthContext] User data saved to localStorage');
        return { success: true };
      }
      
      console.warn('⚠️ [AuthContext] Login failed:', data.message);
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
  };

  const register = async (username, password) => {
    console.log('📝 [AuthContext] Registration attempt started');
    console.log('👤 Username:', username);
    
    try {
      const data = await apiService.register(username, password);
      console.log('📥 [AuthContext] Registration response received:', data);
      
      if (data.success) {
        console.log('✅ [AuthContext] Registration successful, attempting auto-login...');
        // Auto-login after successful registration
        const loginResult = await login(username, password);
        return loginResult;
      }
      
      console.warn('⚠️ [AuthContext] Registration failed:', data.message);
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error) {
      console.error('❌ [AuthContext] Registration error:', error);
      return { success: false, message: error.message || 'Registration failed. Please try again.' };
    }
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
