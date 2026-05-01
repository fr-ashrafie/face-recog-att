import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import { Download as DownloadIcon, Add as AddIcon } from '@mui/icons-material';
import { getReports, generateReport } from '../app/slices/reportSlice';
import { formatDate } from '../utils/helpers';

function Reports() {
  const dispatch = useDispatch();
  const { reports, loading, generating } = useSelector((state) => state.report);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    grade: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    dispatch(getReports());
  }, [dispatch]);

  const handleGenerate = async () => {
    try {
      await dispatch(generateReport(formData)).unwrap();
      setMessage({ type: 'success', text: 'Report generation started. You will be notified when ready.' });
      setOpenDialog(false);
      dispatch(getReports());
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error?.detail || 'Failed to generate report' });
    }
  };

  const handleDownload = async (reportId, filename) => {
    try {
      // In production, this would trigger a download from S3
      window.open(`/api/reports/${reportId}/download/`, '_blank');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download report' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reports</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={generating}
        >
          Generate Report
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {generating && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Generating report...</Typography>
        </Box>
      )}

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Generated</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(reports.length > 0 ? reports : []).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {formatDate(new Date(report.year, report.month - 1), 'MMMM yyyy')} Report
                      {report.grade && ` - Grade ${report.grade}`}
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(report.year, report.month - 1), 'MMMM yyyy')}
                    </TableCell>
                    <TableCell>{report.grade || 'All'}</TableCell>
                    <TableCell>{formatDate(report.created_at)}</TableCell>
                    <TableCell>
                      <Chip label="Ready" color="success" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(report.id, `report-${report.id}`)}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {reports.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No reports generated yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Generate Monthly Report</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {formatDate(new Date(2000, i), 'MMMM')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              >
                {[2024, 2025, 2026].map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Grade (Optional)"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              >
                <MenuItem value="">All Grades</MenuItem>
                <MenuItem value="9">Grade 9</MenuItem>
                <MenuItem value="10">Grade 10</MenuItem>
                <MenuItem value="11">Grade 11</MenuItem>
                <MenuItem value="12">Grade 12</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerate} variant="contained" disabled={generating}>
            {generating ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Reports;
