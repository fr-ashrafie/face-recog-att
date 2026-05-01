import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from '../../services/attendanceService';

const initialState = {
  todayStats: null,
  recentActivity: [],
  studentHistory: [],
  loading: false,
  error: null,
  captureResult: null,
};

export const getTodayStats = createAsyncThunk(
  'attendance/getTodayStats',
  async (_, { rejectWithValue }) => {
    try {
      return await attendanceService.getTodayStats();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const captureAttendance = createAsyncThunk(
  'attendance/capture',
  async (imageData, { rejectWithValue }) => {
    try {
      return await attendanceService.captureAttendance(imageData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markManualAttendance = createAsyncThunk(
  'attendance/markManual',
  async ({ studentId, status }, { rejectWithValue }) => {
    try {
      return await attendanceService.markManualAttendance(studentId, status);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getStudentHistory = createAsyncThunk(
  'attendance/getStudentHistory',
  async ({ studentId, month, year }, { rejectWithValue }) => {
    try {
      return await attendanceService.getStudentHistory(studentId, month, year);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    addRecentActivity: (state, action) => {
      state.recentActivity = [action.payload, ...state.recentActivity].slice(0, 10);
    },
    updateTodayStats: (state, action) => {
      state.todayStats = action.payload;
    },
    setCaptureResult: (state, action) => {
      state.captureResult = action.payload;
    },
    clearCaptureResult: (state) => {
      state.captureResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTodayStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayStats.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStats = action.payload;
      })
      .addCase(getTodayStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(captureAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(captureAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.captureResult = action.payload;
        if (action.payload.attendance) {
          state.recentActivity = [action.payload.attendance, ...state.recentActivity].slice(0, 10);
        }
      })
      .addCase(captureAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getStudentHistory.fulfilled, (state, action) => {
        state.studentHistory = action.payload.results || action.payload;
      });
  },
});

export const { addRecentActivity, updateTodayStats, setCaptureResult, clearCaptureResult } = attendanceSlice.actions;
export default attendanceSlice.reducer;
