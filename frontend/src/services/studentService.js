import api from './api';

const studentService = {
  getStudents: async ({ search = '', grade = '', page = 1 } = {}) => {
    const params = { search, grade, page };
    // Remove empty params
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key];
      }
    });
    
    const response = await api.get('/students/', { params });
    return response.data;
  },

  getStudentById: async (studentId) => {
    const response = await api.get(`/students/${studentId}/`);
    return response.data;
  },

  updateStudent: async (studentId, data) => {
    const response = await api.patch(`/students/${studentId}/`, data);
    return response.data;
  },

  registerFaceEncoding: async (studentId, imageData) => {
    const response = await api.post(`/students/${studentId}/register-face/`, {
      image: imageData,
    });
    return response.data;
  },

  getGrades: async () => {
    const response = await api.get('/students/grades/');
    return response.data;
  },
};

export default studentService;
