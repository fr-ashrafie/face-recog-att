import api from './api';

const reportService = {
  getReports: async () => {
    const response = await api.get('/reports/');
    return response.data;
  },

  generateReport: async ({ month, year, grade }) => {
    const response = await api.post('/reports/generate/', {
      month,
      year,
      grade,
    });
    return response.data;
  },

  downloadReport: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportService;
