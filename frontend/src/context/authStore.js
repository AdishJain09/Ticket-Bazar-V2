import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.signup(userData);
          const { user, token } = response.data.data;
          
          localStorage.setItem('token', token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success('Account created successfully!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Signup failed';
          set({ isLoading: false, error: message });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response.data.data;
          
          localStorage.setItem('token', token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success('Welcome back!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: message });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      googleLogin: async (credential) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.googleLogin({ credential });
          const { user, token } = response.data.data;
          
          localStorage.setItem('token', token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success('Welcome via Google!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Google login failed';
          set({ isLoading: false, error: message });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        toast.success('Logged out successfully');
      },

      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          const { user } = response.data.data;
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.updateProfile(data);
          const { user } = response.data.data;
          set({
            user,
            isLoading: false,
          });
          toast.success('Profile updated successfully');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed';
          set({ isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      updatePassword: async (data) => {
        set({ isLoading: true });
        try {
          await authAPI.updatePassword(data);
          set({ isLoading: false });
          toast.success('Password updated successfully');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Password update failed';
          set({ isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      becomeSeller: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.becomeSeller();
          const { user } = response.data.data;
          set({
            user,
            isLoading: false,
          });
          toast.success('You are now a seller!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to become seller';
          set({ isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
