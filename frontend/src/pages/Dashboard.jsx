import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  AccessTime as LateIcon,
  People as TotalIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { getDashboardStats, getWeeklyTrend } from '../app/slices/dashboardSlice';
import { getTodayStats } from '../app/slices/attendanceSlice';
import { formatDate, formatTime, getStatusColor } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const statCards = [
  { key: 'present', label: 'Present', icon: <PresentIcon />, color: 'success' },
  { key: 'absent', label: 'Absent', icon: <AbsentIcon />, color: 'error' },
  { key: 'late', label: 'Late', icon: <LateIcon />, color: 'warning' },
  { key: 'total', label: 'Total Students', icon: <TotalIcon />, color: 'primary' },
];

function Dashboard() {
  const dispatch = useDispatch();
  const { stats, weeklyTrend, loading } = useSelector((state) => state.dashboard);
  const { recentActivity } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getWeeklyTrend());
    dispatch(getTodayStats());
  }, [dispatch]);

  const chartData = {
    labels: weeklyTrend.map((d) => formatDate(d.date, 'MMM dd')),
    datasets: [
      {
        label: 'Present',
        data: weeklyTrend.map((d) => d.present),
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
      },
      {
        label: 'Absent',
        data: weeklyTrend.map((d) => d.absent),
        backgroundColor: 'rgba(244, 67, 54, 0.7)',
      },
      {
        label: 'Late',
        data: weeklyTrend.map((d) => d.late),
        backgroundColor: 'rgba(255, 152, 0, 0.7)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '7-Day Attendance Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.key}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                      {stats?.[stat.key] ?? 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: `${stat.color}.light`,
                      color: `${stat.color}.main`,
                      borderRadius: '50%',
                      p: 1.5,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Weekly Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(recentActivity.length > 0 ? recentActivity : []).slice(0, 5).map((activity) => (
                      <TableRow key={activity.id || Math.random()}>
                        <TableCell>
                          <Typography variant="body2">
                            {activity.student?.first_name} {activity.student?.last_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            color={getStatusColor(activity.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption">
                            {formatTime(activity.timestamp)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentActivity.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No recent activity
                          </Typography>
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
    </Box>
  );
}

export default Dashboard;
