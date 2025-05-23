"use client";

import { useState, useRef, useEffect } from 'react';
import PigletAvatar from '@/components/PigletAvatar';
import Waveform from '@/components/Waveform';
import MicControls from '@/components/MicControls';
import { useGeminiLive } from '@/hooks/useGeminiLive';

export default function ChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { 
    connectionState, 
    isRecording, 
    connect, 
    disconnect, 
    startRecording, 
    stopRecording 
  } = useGeminiLive({
    model: 'gemini-2.0-flash-exp',
    onMessage: (message) => {
      console.log('Received message:', message);
      
      // Handle audio responses
      if (message.type === 'audio' && message.audio) {
        setAudioQueue(prev => [...prev, message.audio!]);
      }
      
      // Handle text responses (fallback)
      if (message.type === 'text' && message.content) {
        console.log('Gemini says:', message.content);
      }
    },
    onError: (error) => {
      console.error('Gemini Live error:', error);
    },
    onStateChange: (state) => {
      console.log('Connection state changed:', state);
      setIsConnected(state === 'connected');
    },
  });

  // Play audio responses
  useEffect(() => {
    if (audioQueue.length > 0 && audioRef.current) {
      const audioData = audioQueue[0];
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], 
        { type: 'audio/wav' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current.src = audioUrl;
      audioRef.current.play().then(() => {
        // Remove played audio from queue
        setAudioQueue(prev => prev.slice(1));
        URL.revokeObjectURL(audioUrl);
      }).catch(console.error);
    }
  }, [audioQueue]);

  const handleConnect = async () => {
    if (connectionState === 'disconnected') {
      await connect();
    } else {
      disconnect();
    }
  };

  const handleRecord = async () => {
    if (!isRecording && isConnected) {
      await startRecording();
    }
  };

  const handleStop = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handleReset = () => {
    disconnect();
    setAudioQueue([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 h-screen">
        <div className="grid grid-rows-[30%_40%_30%] h-full gap-6">
          {/* Avatar Section - 30% */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <PigletAvatar />
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className={`
                w-3 h-3 rounded-full 
                ${connectionState === 'connected' ? 'bg-green-500' : 
                  connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                  connectionState === 'error' ? 'bg-red-500' : 'bg-gray-500'}
              `} />
              <span className="text-sm text-gray-300 capitalize">
                {connectionState}
              </span>
              
              <button
                onClick={handleConnect}
                disabled={connectionState === 'connecting'}
                className={`
                  px-3 py-1 rounded text-xs transition-colors
                  ${connectionState === 'connected' 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-green-600 hover:bg-green-500 text-white'
                  }
                  ${connectionState === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {connectionState === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>

          {/* Waveform Section - 40% */}
          <div className="flex items-center justify-center">
            <Waveform isActive={isRecording} />
          </div>

          {/* Controls Section - 30% */}
          <div className="flex items-center justify-center">
            <MicControls 
              onReset={handleReset}
              onRecord={handleRecord}
              onStop={handleStop}
              isRecording={isRecording}
              isConnected={isConnected}
            />
          </div>
        </div>
      </div>
      
      {/* Hidden audio element for playing responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
} 