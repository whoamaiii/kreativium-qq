import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';

export const wss = new WebSocketServer({ noServer: true });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as any).server.wss) {
    res.status(200).end(); // already set up
    return;
  }
  (res.socket as any).server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    wss.handleUpgrade(req, socket as any, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });
  (res.socket as any).server.wss = wss;
  res.status(200).end();
} 