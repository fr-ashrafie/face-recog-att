import { format } from 'date-fns';

export const formatDate = (dateString, dateFormat = 'MMM dd, yyyy') => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), dateFormat);
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'hh:mm a');
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  } catch (error) {
    return dateString;
  }
};

export const getStatusColor = (status) => {
  const colors = {
    present: 'success',
    absent: 'error',
    late: 'warning',
    excused: 'info',
  };
  return colors[status?.toLowerCase()] || 'default';
};

export const getStatusLabel = (status) => {
  const labels = {
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    excused: 'Excused',
  };
  return labels[status?.toLowerCase()] || status;
};

export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase();
};

export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const calculateAttendancePercentage = (present, total) => {
  if (!total || total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
