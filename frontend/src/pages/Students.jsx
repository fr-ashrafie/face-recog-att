import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { debounce, getInitials, getStatusColor } from '../utils/helpers';
import { getStudents } from '../app/slices/studentSlice';

function Students() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, loading, pagination } = useSelector((state) => state.student);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [grade, setGrade] = useState('');
  const [page, setPage] = useState(1);

  const fetchStudents = useCallback(() => {
    dispatch(getStudents({ search: searchTerm, grade, page }));
  }, [dispatch, searchTerm, grade, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchChange = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(1);
    }, 500),
    []
  );

  const handleGradeChange = (event) => {
    setGrade(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const studentList = students?.results || students || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Students
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search by name or ID..."
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Grade</InputLabel>
            <Select value={grade} label="Grade" onChange={handleGradeChange}>
              <MenuItem value="">All Grades</MenuItem>
              <MenuItem value="9">Grade 9</MenuItem>
              <MenuItem value="10">Grade 10</MenuItem>
              <MenuItem value="11">Grade 11</MenuItem>
              <MenuItem value="12">Grade 12</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading && !studentList.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {studentList.map((student) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={student.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={getInitials(student.first_name, student.last_name)}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          mr: 2,
                          fontWeight: 700,
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1" noWrap>
                          {student.first_name} {student.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {student.student_id}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Grade: {student.grade}
                      </Typography>
                    </Box>
                    <Chip
                      label={student.today_status || 'Not Marked'}
                      color={getStatusColor(student.today_status)}
                      size="small"
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      View Profile
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {pagination?.count > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(pagination.count / 12)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default Students;
