import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('canteen_user') || 'null'),
  token: localStorage.getItem('canteen_access_token') || null,
  isAuthenticated: !!localStorage.getItem('canteen_access_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;
      localStorage.setItem('canteen_access_token', accessToken);
      localStorage.setItem('canteen_user', JSON.stringify(user));
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      const { user, accessToken } = res.data;
      localStorage.setItem('canteen_access_token', accessToken);
      localStorage.setItem('canteen_user', JSON.stringify(user));
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('canteen_access_token');
      localStorage.removeItem('canteen_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('canteen_access_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      const { user } = res.data;
      localStorage.setItem('canteen_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem('canteen_access_token');
      localStorage.removeItem('canteen_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.put('/users/profile', data);
      const updatedUser = res.data.user;
      localStorage.setItem('canteen_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      return { success: true, user: updatedUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  }
}));
