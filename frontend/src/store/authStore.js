// frontend/src/store/authStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Login
      login: async (credentials) => {
        try {
          const response = await authAPI.login(credentials);
          const { user, accessToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          set({ user, isAuthenticated: true });
          
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      // Register
      register: async (userData) => {
        try {
          const response = await authAPI.register(userData);
          const { user, accessToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          set({ user, isAuthenticated: true });
          
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      // Logout
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      // Load user profile
      loadUser: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const response = await authAPI.getProfile();
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Update profile
      updateProfile: async (data) => {
        try {
          const response = await authAPI.updateProfile(data);
          set({ user: response.data.user });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().loadUser();
}