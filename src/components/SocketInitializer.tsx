"use client";

import { useEffect } from 'react';

export default function SocketInitializer() {
  useEffect(() => {
    // Initialize Socket.IO server
    fetch('/api/socketio').catch(err => {
      console.error('Failed to initialize Socket.IO:', err);
    });
  }, []);

  return null;
} 