import api from './api';

const attendanceService = {
  getTodayStats: async () => {
    const response = await api.get('/attendance/today/');
    return response.data;
  },

  captureAttendance: async (imageData) => {
    const response = await api.post('/attendance/capture/', {
      image: imageData,
    });
    return response.data;
  },

  markManualAttendance: async (studentId, status) => {
    const response = await api.post('/attendance/manual/', {
      student_id: studentId,
      status,
    });
    return response.data;
  },

  getStudentHistory: async (studentId, month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    
    const response = await api.get(`/attendance/student/${studentId}/`, { params });
    return response.data;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await api.get('/attendance/recent/', { params: { limit } });
    return response.data;
  },
};

export default attendanceService;
