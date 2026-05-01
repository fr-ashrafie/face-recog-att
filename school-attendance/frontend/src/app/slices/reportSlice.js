import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from '../../services/reportService';

const initialState = {
  reports: [],
  loading: false,
  generating: false,
  error: null,
};

export const getReports = createAsyncThunk(
  'report/getReports',
  async (_, { rejectWithValue }) => {
    try {
      return await reportService.getReports();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generateReport = createAsyncThunk(
  'report/generate',
  async ({ month, year, grade }, { rejectWithValue }) => {
    try {
      return await reportService.generateReport({ month, year, grade });
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setGenerating: (state, action) => {
      state.generating = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.results || action.payload;
      })
      .addCase(getReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateReport.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generating = false;
        state.reports = [action.payload, ...state.reports];
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      });
  },
});

export const { setGenerating } = reportSlice.actions;
export default reportSlice.reducer;
