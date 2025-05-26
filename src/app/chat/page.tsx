"use client";

import { useState, useRef, useEffect } from 'react';
import PigletAvatar from '@/components/PigletAvatar';
import Waveform from '@/components/Waveform';
import MicControls from '@/components/MicControls';
import { useGeminiLive } from '@/hooks/useGeminiLive';

export default function ChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isLiveChatActive, setIsLiveChatActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { 
    connectionState, 
    isRecording, 
    connect, 
    disconnect, 
    startRecording, 
    stopRecording,
    reset
  } = useGeminiLive({
    model: 'gemini-2.5-flash-preview-native-audio-dialog', // Using the correct model
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
      setIsLiveChatActive(false); // Stop live chat on error
    },
    onStateChange: (state) => {
      console.log('Connection state changed:', state);
      setIsConnected(state === 'connected');
      
      // If connection is lost, stop live chat
      if (state === 'disconnected' || state === 'error') {
        setIsLiveChatActive(false);
      }
    },
    onAudioLevel: (level) => {
      setAudioLevel(level);
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

  // Auto-start recording when live chat becomes active and connected
  useEffect(() => {
    if (isLiveChatActive && isConnected && !isRecording) {
      console.log('[ChatPage] Auto-starting recording for live chat');
      startRecording();
    }
  }, [isLiveChatActive, isConnected, isRecording, startRecording]);

  const handleConnect = async () => {
    if (connectionState === 'disconnected') {
      await connect();
    } else {
      handleStopLiveChat(); // Stop live chat and disconnect
    }
  };

  const handleStartLiveChat = async () => {
    console.log('[ChatPage] Starting live chat...');
    if (!isConnected) {
      // First connect, then start live chat
      await connect();
    }
    setIsLiveChatActive(true);
  };

  const handleStopLiveChat = () => {
    console.log('[ChatPage] Stopping live chat...');
    setIsLiveChatActive(false);
    if (isRecording) {
      stopRecording();
    }
    disconnect();
    setAudioQueue([]);
  };

  const handleReset = () => {
    console.log('[ChatPage] Resetting...');
    setIsLiveChatActive(false);
    reset();
    setAudioQueue([]);
  };

  const testMicrophone = async () => {
    console.log('[ChatPage] Testing microphone access...');
    try {
      console.log('Secure context:', window.isSecureContext);
      console.log('getUserMedia available:', !!navigator.mediaDevices?.getUserMedia);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone test successful:', stream);
      stream.getTracks().forEach(track => track.stop());
      alert('Microphone test successful!');
    } catch (error) {
      console.error('Microphone test failed:', error);
      alert(`Microphone test failed: ${(error as Error).message}`);
    }
  };

  const testAudioOutput = async () => {
    console.log('[ChatPage] Testing audio output...');
    try {
      // Create a simple test tone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5); // Play for 0.5 seconds
      
      console.log('Audio output test completed');
      alert('Audio output test completed - you should have heard a beep!');
    } catch (error) {
      console.error('Audio output test failed:', error);
      alert(`Audio output test failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8 h-screen">
        <div className="grid grid-rows-[auto_1fr_auto] h-full gap-8">
          {/* Header with connection status */}
          <div className="flex justify-center items-center space-x-4">
            <div className={`
              w-3 h-3 rounded-full 
              ${connectionState === 'connected' ? 'bg-green-500' : 
                connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                connectionState === 'error' ? 'bg-red-500' : 'bg-gray-500'}
            `} />
            <span className="text-sm text-gray-300 capitalize">
              {isLiveChatActive ? 'Live Chat Active' : connectionState}
            </span>
            
            {/* Test Microphone Button */}
            <button
              onClick={testMicrophone}
              className="px-3 py-1 rounded text-xs bg-purple-600 hover:bg-purple-500 text-white"
            >
              Test Mic
            </button>
            
            {/* Test Audio Output Button */}
            <button
              onClick={testAudioOutput}
              className="px-3 py-1 rounded text-xs bg-purple-600 hover:bg-purple-500 text-white"
            >
              Test Audio Output
            </button>
            
            {/* Connection toggle - only show if not in live chat */}
            {!isLiveChatActive && (
              <button
                onClick={handleConnect}
                disabled={connectionState === 'connecting'}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${connectionState === 'connected' 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }
                  ${connectionState === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {connectionState === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            )}
          </div>

          {/* Main sphere visualization */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <PigletAvatar isConnected={isConnected} isRecording={isLiveChatActive && isRecording} />
            
            {/* Audio Level Indicator */}
            {isLiveChatActive && isRecording && (
              <div className="flex flex-col items-center space-y-2">
                <div className="text-xs text-gray-400">Audio Level</div>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-100"
                    style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {audioLevel > 0.01 ? '🎤 Speaking...' : '🔇 Listening...'}
                </div>
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="flex items-center justify-center pb-8">
            <MicControls 
              onReset={handleReset}
              onStartLiveChat={handleStartLiveChat}
              onStopLiveChat={handleStopLiveChat}
              isLiveChatActive={isLiveChatActive}
              isConnected={isConnected}
              isRecording={isRecording}
            />
          </div>
        </div>
      </div>
      
      {/* Hidden audio element for playing responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
} 