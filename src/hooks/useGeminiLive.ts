"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface GeminiMessage {
  type: 'audio' | 'text' | 'system';
  content?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  audio?: string; // Base64 encoded audio
}

interface UseGeminiLiveOptions {
  model?: string;
  onMessage?: (message: GeminiMessage) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ConnectionState) => void;
}

export function useGeminiLive(options: UseGeminiLiveOptions = {}) {
  const {
    model = 'gemini-2.0-flash-exp',
    onMessage,
    onError,
    onStateChange,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch API key from secure endpoint
  const fetchApiKey = useCallback(async () => {
    try {
      const response = await fetch('/api/live-token');
      if (!response.ok) {
        throw new Error('Failed to fetch API key');
      }
      const data = await response.json();
      setApiKey(data.apiKey);
      return data.apiKey;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      throw err;
    }
  }, [onError]);

  // Update connection state
  const updateState = useCallback((newState: ConnectionState) => {
    setConnectionState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  // Connect to Gemini Live WebSocket
  const connect = useCallback(async (modelOverride?: string) => {
    if (connectionState === 'connecting' || connectionState === 'connected') {
      return;
    }

    updateState('connecting');

    try {
      let key = apiKey;
      if (!key) {
        key = await fetchApiKey();
      }

      const modelToUse = modelOverride || model;
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${key}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        updateState('connected');
        
        // Send initial setup message
        const setupMessage = {
          setup: {
            model: `models/${modelToUse}`,
            generation_config: {
              response_modalities: ['AUDIO'],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: {
                    voice_name: 'Puck',
                  },
                },
              },
            },
            system_instruction: {
              parts: [
                {
                  text: "You are PigletChat, a friendly AI assistant. Keep responses conversational and brief.",
                },
              ],
            },
          },
        };
        
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.serverContent?.modelTurn?.parts) {
            const parts = data.serverContent.modelTurn.parts;
            
            for (const part of parts) {
              if (part.inlineData?.mimeType?.includes('audio')) {
                const message: GeminiMessage = {
                  type: 'audio',
                  inlineData: {
                    mimeType: part.inlineData.mimeType,
                    data: part.inlineData.data,
                  },
                  audio: part.inlineData.data, // For easier access
                };
                onMessage?.(message);
              } else if (part.text) {
                const message: GeminiMessage = {
                  type: 'text',
                  content: part.text,
                };
                onMessage?.(message);
              }
            }
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateState('error');
        const err = new Error('WebSocket connection error');
        onError?.(err);
      };

      ws.onclose = () => {
        updateState('disconnected');
        wsRef.current = null;
      };

    } catch (error) {
      updateState('error');
      const err = error instanceof Error ? error : new Error('Connection failed');
      onError?.(err);
    }
  }, [connectionState, apiKey, model, fetchApiKey, updateState, onMessage, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    updateState('disconnected');
  }, [updateState]);

  // Start recording audio
  const startRecording = useCallback(async () => {
    if (isRecording || connectionState !== 'connected') {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            
            const message = {
              clientContent: {
                turns: [
                  {
                    role: 'user',
                    parts: [
                      {
                        inlineData: {
                          mimeType: 'audio/webm;codecs=opus',
                          data: base64,
                        },
                      },
                    ],
                  },
                ],
                turnComplete: true,
              },
            };
            
            wsRef.current?.send(JSON.stringify(message));
          };
          reader.readAsDataURL(event.data);
        }
      };
      
      mediaRecorder.start(1000); // Capture data every second
      setIsRecording(true);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start recording');
      onError?.(err);
    }
  }, [isRecording, connectionState, onError]);

  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (!isRecording) {
      return;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      stopRecording();
    };
  }, [disconnect, stopRecording]);

  return {
    connectionState,
    isRecording,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  };
} 