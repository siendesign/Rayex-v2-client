import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

let socket: Socket;

export const initSocket = () => {
  if (!socket) {
    // Remove /api suffix if present for the socket connection
    const socketBaseUrl = SOCKET_URL.replace(/\/api$/, '');
    
    socket = io(socketBaseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};
