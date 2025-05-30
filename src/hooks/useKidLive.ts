"use client";
import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

export interface Message {
  id: string;
  content: string;
  role: string;
  createdAt: string;
}

export function useKidLive(kidId: number, initialStars: number) {
  const [stars, setStars] = useState(initialStars);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Connect to Socket.IO server
    const socket: Socket = io();

    // Join the kid's room
    socket.emit('join-kid-room', kidId);

    // Listen for star updates
    socket.on('stars-update', (data) => {
      if (data.kidId === kidId) {
        setStars(data.total);
      }
    });

    // Listen for feedback updates
    socket.on('feedback-update', (data) => {
      if (data.kidId === kidId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [kidId]);

  return { stars, messages };
} 