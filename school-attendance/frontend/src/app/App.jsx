import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Layout from '../components/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import StudentProfile from '../pages/StudentProfile';
import Reports from '../pages/Reports';
import Notifications from '../pages/Notifications';
import FaceCapture from '../pages/FaceCapture';

import socketService from '../services/socketService';
import { logout } from './slices/authSlice';
import { addNotification, setUnreadCount } from './slices/notificationSlice';
import { updateTodayStats, addRecentActivity } from './slices/attendanceSlice';
import { updateStats, addActivity } from './slices/dashboardSlice';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to WebSocket
      socketService.connect(token);

      // Listen for new attendance events
      const unsubscribeAttendance = socketService.on('new_attendance', (data) => {
        console.log('New attendance received:', data);
        
        // Update dashboard stats
        if (data.dashboard_stats) {
          dispatch(updateTodayStats(data.dashboard_stats));
          dispatch(updateStats(data.dashboard_stats));
        }
        
        // Add to recent activity
        if (data.student) {
          dispatch(addRecentActivity(data));
          dispatch(addActivity(data));
        }
      });

      // Listen for notifications
      const unsubscribeNotification = socketService.on('notification', (data) => {
        console.log('Notification received:', data);
        
        if (data.notification) {
          dispatch(addNotification(data.notification));
        }
        
        if (data.unread_count !== undefined) {
          dispatch(setUnreadCount(data.unread_count));
        }
      });

      // Listen for dashboard updates
      const unsubscribeDashboard = socketService.on('dashboard_update', (data) => {
        console.log('Dashboard update received:', data);
        if (data.stats) {
          dispatch(updateStats(data.stats));
          dispatch(updateTodayStats(data.stats));
        }
      });

      return () => {
        unsubscribeAttendance();
        unsubscribeNotification();
        unsubscribeDashboard();
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, token, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="capture" element={<FaceCapture />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
