import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

export function getSocketIO(server: SocketServer): SocketIOServer | undefined {
  return server.io;
}

export function broadcastToKid(server: SocketServer, kidId: number, event: string, data: any) {
  const io = getSocketIO(server);
  if (io) {
    io.to(`kid-${kidId}`).emit(event, data);
  }
} 