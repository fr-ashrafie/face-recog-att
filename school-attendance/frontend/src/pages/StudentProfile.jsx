import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
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
  Alert,
} from '@mui/material';
import { getStudentById, registerFaceEncoding } from '../app/slices/studentSlice';
import { getStudentHistory } from '../app/slices/attendanceSlice';
import { markManualAttendance } from '../app/slices/attendanceSlice';
import { formatDate, formatTime, getStatusColor, calculateAttendancePercentage, getInitials } from '../utils/helpers';

function StudentProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedStudent, loading } = useSelector((state) => state.student);
  const { studentHistory } = useSelector((state) => state.attendance);
  
  const [openFaceDialog, setOpenFaceDialog] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [manualStatus, setManualStatus] = useState('present');
  const [faceImage, setFaceImage] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    dispatch(getStudentById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedStudent?.id) {
      dispatch(getStudentHistory({ studentId: id, month: selectedMonth, year: selectedYear }));
    }
  }, [dispatch, id, selectedMonth, selectedYear, selectedStudent?.id]);

  const handleFaceRegister = async () => {
    if (!faceImage) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }
    try {
      await dispatch(registerFaceEncoding({ studentId: id, imageData: faceImage })).unwrap();
      setMessage({ type: 'success', text: 'Face registered successfully!' });
      setTimeout(() => {
        setOpenFaceDialog(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error?.detail || 'Failed to register face' });
    }
  };

  const handleManualAttendance = async () => {
    try {
      await dispatch(markManualAttendance({ studentId: id, status: manualStatus })).unwrap();
      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      dispatch(getStudentById(id));
      setTimeout(() => {
        setOpenAttendanceDialog(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error?.detail || 'Failed to mark attendance' });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaceImage(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !selectedStudent) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedStudent) {
    return <Typography>Student not found</Typography>;
  }

  const stats = selectedStudent.attendance_stats || {};
  const attendancePercentage = calculateAttendancePercentage(stats.present, stats.total);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Student Profile
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Chip
                label={getInitials(selectedStudent.first_name, selectedStudent.last_name)}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              />
              <Typography variant="h5" sx={{ mt: 2 }}>
                {selectedStudent.first_name} {selectedStudent.last_name}
              </Typography>
              <Typography color="text.secondary">ID: {selectedStudent.student_id}</Typography>
              <Chip
                label={selectedStudent.today_status || 'Not Marked'}
                color={getStatusColor(selectedStudent.today_status)}
                sx={{ mt: 2 }}
              />
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" onClick={() => setOpenAttendanceDialog(true)}>
                  Mark Attendance
                </Button>
                <Button variant="outlined" onClick={() => setOpenFaceDialog(true)}>
                  Re-register Face
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Details</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Grade: {selectedStudent.grade}</Typography>
                <Typography variant="body2">
                  DOB: {formatDate(selectedStudent.date_of_birth)}
                </Typography>
                <Typography variant="body2">
                  Parent Email: {selectedStudent.parent_email}
                </Typography>
                <Typography variant="body2">
                  Enrolled: {formatDate(selectedStudent.enrolled_since)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats & History */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Present</Typography>
                  <Typography variant="h4" color="success.main">{stats.present || 0}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Absent</Typography>
                  <Typography variant="h4" color="error.main">{stats.absent || 0}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Late</Typography>
                  <Typography variant="h4" color="warning.main">{stats.late || 0}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Attendance %</Typography>
                  <Typography variant="h4">{attendancePercentage}%</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Attendance History</Typography>
                <Box>
                  <TextField
                    select
                    size="small"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    sx={{ mr: 1, minWidth: 120 }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {formatDate(new Date(2000, i), 'MMMM')}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    sx={{ minWidth: 100 }}
                  >
                    {[2024, 2025].map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Marked By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(studentHistory.length > 0 ? studentHistory : []).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>
                          <Chip label={record.status} color={getStatusColor(record.status)} size="small" />
                        </TableCell>
                        <TableCell>{formatTime(record.timestamp)}</TableCell>
                        <TableCell>{record.marked_by}</TableCell>
                      </TableRow>
                    ))}
                    {studentHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No records for this month
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Manual Attendance Dialog */}
      <Dialog open={openAttendanceDialog} onClose={() => setOpenAttendanceDialog(false)}>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            value={manualStatus}
            onChange={(e) => setManualStatus(e.target.value)}
            sx={{ mt: 2, minWidth: 200 }}
          >
            <MenuItem value="present">Present</MenuItem>
            <MenuItem value="late">Late</MenuItem>
            <MenuItem value="absent">Absent</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttendanceDialog(false)}>Cancel</Button>
          <Button onClick={handleManualAttendance} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Face Registration Dialog */}
      <Dialog open={openFaceDialog} onClose={() => setOpenFaceDialog(false)}>
        <DialogTitle>Register Face</DialogTitle>
        <DialogContent>
          <input accept="image/*" type="file" onChange={handleImageUpload} style={{ marginTop: 16 }} />
          {faceImage && <Typography variant="body2" sx={{ mt: 1 }}>Image selected</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFaceDialog(false)}>Cancel</Button>
          <Button onClick={handleFaceRegister} variant="contained">Register</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StudentProfile;
