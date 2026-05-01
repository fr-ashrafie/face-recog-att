import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

const initialState = {
  stats: null,
  weeklyTrend: [],
  recentActivity: [],
  loading: false,
  error: null,
};

export const getDashboardStats = createAsyncThunk(
  'dashboard/getStats',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getStats();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getWeeklyTrend = createAsyncThunk(
  'dashboard/getWeeklyTrend',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getWeeklyTrend();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateStats: (state, action) => {
      state.stats = action.payload;
    },
    addActivity: (state, action) => {
      state.recentActivity = [action.payload, ...state.recentActivity].slice(0, 10);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getWeeklyTrend.fulfilled, (state, action) => {
        state.weeklyTrend = action.payload;
      });
  },
});

export const { updateStats, addActivity } = dashboardSlice.actions;
export default dashboardSlice.reducer;
