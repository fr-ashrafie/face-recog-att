import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for attendance updates
    this.socket.on('new_attendance', (data) => {
      this.emit('new_attendance', data);
    });

    // Listen for notifications
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    // Listen for dashboard updates
    this.socket.on('dashboard_update', (data) => {
      this.emit('dashboard_update', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
