import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  Paper,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  CheckCircle as ReadIcon,
  DoneAll as MarkAllIcon,
} from '@mui/icons-material';
import { getNotifications, markAsRead, markAllAsRead } from '../app/slices/notificationSlice';
import { formatDateTime } from '../utils/helpers';

function Notifications() {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance':
        return <NotificationIcon color="success" />;
      case 'alert':
        return <NotificationIcon color="error" />;
      default:
        return <NotificationIcon color="info" />;
    }
  };

  if (loading && !notifications.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Notifications</Typography>
        {unreadCount > 0 && (
          <Button
            startIcon={<MarkAllIcon />}
            onClick={handleMarkAllAsRead}
            variant="outlined"
            size="small"
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </Box>

      <Paper>
        <List>
          {(notifications.length > 0 ? notifications : []).map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  backgroundColor: notification.is_read ? 'inherit' : 'action.hover',
                }}
                secondaryAction={
                  !notification.is_read && (
                    <IconButton
                      edge="end"
                      aria-label="mark as read"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <ReadIcon color="success" />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: notification.is_read ? 'grey.300' : 'primary.main' }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {notification.title}
                      </Typography>
                      {!notification.is_read && (
                        <Chip label="New" color="primary" size="small" />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(notification.created_at)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {notifications.length === 0 && !loading && (
            <ListItem>
              <ListItemText
                align="center"
                primary="No notifications"
                secondary="You're all caught up!"
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default Notifications;
