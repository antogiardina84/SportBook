// ============================================
// frontend/src/store/authStore.js
// Zustand Store - Autenticazione Globale
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      // Login
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const { user, token, refreshToken } = response.data;
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null
          });

          // Store token in axios defaults
          localStorage.setItem('auth_token', token);
          localStorage.setItem('refresh_token', refreshToken);

          return { success: true, user };
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Errore durante il login';
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      // Register
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user, token, refreshToken } = response.data;
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null
          });

          localStorage.setItem('auth_token', token);
          localStorage.setItem('refresh_token', refreshToken);

          return { success: true, user };
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Errore durante la registrazione';
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      // Logout
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });

          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.updateProfile(profileData);
          const updatedUser = response.data.user;
          
          set({
            user: updatedUser,
            loading: false,
            error: null
          });

          return { success: true, user: updatedUser };
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Errore nell\'aggiornamento profilo';
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        set({ loading: true, error: null });
        try {
          await authAPI.changePassword({ currentPassword, newPassword });
          set({ loading: false, error: null });
          return { success: true };
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Errore nel cambio password';
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      // Refresh token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await authAPI.refreshToken(refreshToken);
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          set({
            token: newToken,
            refreshToken: newRefreshToken
          });

          localStorage.setItem('auth_token', newToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
          return false;
        }
      },

      // Verify token
      verifyToken: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await authAPI.getProfile();
          set({ user: response.data.user, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Token verification failed:', error);
          get().logout();
          return false;
        }
      },

      // Check if user has role
      hasRole: (roles) => {
        const { user } = get();
        if (!user || !user.role) return false;
        
        if (Array.isArray(roles)) {
          return roles.includes(user.role);
        }
        return user.role === roles;
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;