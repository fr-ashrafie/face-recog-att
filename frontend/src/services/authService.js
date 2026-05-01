import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/token/', credentials);
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
