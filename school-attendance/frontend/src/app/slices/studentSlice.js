import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentService from '../../services/studentService';

const initialState = {
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

export const getStudents = createAsyncThunk(
  'student/getStudents',
  async ({ search = '', grade = '', page = 1 } = {}, { rejectWithValue }) => {
    try {
      return await studentService.getStudents({ search, grade, page });
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getStudentById = createAsyncThunk(
  'student/getStudentById',
  async (studentId, { rejectWithValue }) => {
    try {
      return await studentService.getStudentById(studentId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStudent = createAsyncThunk(
  'student/updateStudent',
  async ({ studentId, data }, { rejectWithValue }) => {
    try {
      return await studentService.updateStudent(studentId, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const registerFaceEncoding = createAsyncThunk(
  'student/registerFace',
  async ({ studentId, imageData }, { rejectWithValue }) => {
    try {
      return await studentService.registerFaceEncoding(studentId, imageData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
    updateStudentStatus: (state, action) => {
      const { studentId, status } = action.payload;
      if (state.students.results) {
        const index = state.students.results.findIndex(s => s.id === studentId);
        if (index !== -1) {
          state.students.results[index].today_status = status;
        }
      }
      if (state.selectedStudent && state.selectedStudent.id === studentId) {
        state.selectedStudent.today_status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getStudentById.fulfilled, (state, action) => {
        state.selectedStudent = action.payload;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        if (state.selectedStudent?.id === action.payload.id) {
          state.selectedStudent = action.payload;
        }
        if (state.students.results) {
          const index = state.students.results.findIndex(s => s.id === action.payload.id);
          if (index !== -1) {
            state.students.results[index] = action.payload;
          }
        }
      });
  },
});

export const { setSelectedStudent, clearSelectedStudent, updateStudentStatus } = studentSlice.actions;
export default studentSlice.reducer;
