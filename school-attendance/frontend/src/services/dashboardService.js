import api from './api';

const dashboardService = {
  getStats: async () => {
    const response = await api.get('/attendance/today/');
    return response.data;
  },

  getWeeklyTrend: async () => {
    const response = await api.get('/dashboard/weekly-trend/');
    return response.data;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await api.get('/attendance/recent/', { params: { limit } });
    return response.data;
  },
};

export default dashboardService;
