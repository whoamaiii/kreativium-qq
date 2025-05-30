import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

interface ExtendedSocket extends NetSocket {
  server: SocketServer;
}

interface SocketResponse extends NextApiResponse {
  socket: ExtendedSocket;
}

export default function handler(req: NextApiRequest, res: SocketResponse) {
  if (res.socket.server.io) {
    console.log('Socket.IO already running');
  } else {
    console.log('Initializing Socket.IO');

    const io = new SocketIOServer(res.socket.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle joining kid rooms
      socket.on('join-kid-room', (kidId: number) => {
        socket.join(`kid-${kidId}`);
        console.log(`Socket ${socket.id} joined room kid-${kidId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  
  res.end();
} 