import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@api/axios';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success(`Benvenuto, ${user.firstName}!`);
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il login';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registrazione completata con successo!');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la registrazione';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      toast.info('Logout effettuato');
      navigate('/login');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.data.user);
      toast.success('Profilo aggiornato con successo');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'aggiornamento';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
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