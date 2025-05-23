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

  // Test API access before connecting
  const testApiAccess = useCallback(async (key: string) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
      if (!response.ok) {
        throw new Error(`API test failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Available models:', data.models?.slice(0, 3).map((m: any) => m.name));
      return true;
    } catch (error) {
      console.error('API access test failed:', error);
      return false;
    }
  }, []);

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

      // Test API access first
      const hasAccess = await testApiAccess(key!);
      if (!hasAccess) {
        updateState('error');
        const err = new Error('API key does not have access to Generative AI services');
        onError?.(err);
        return;
      }

      const modelToUse = modelOverride || model;
      console.log('Connecting with model:', modelToUse);
      console.log('API key length:', key?.length || 0);
      
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${key}`;
      console.log('WebSocket URL:', key ? wsUrl.replace(key, '[API_KEY]') : wsUrl); // Log URL without exposing key

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          updateState('error');
          const err = new Error('WebSocket connection timeout');
          onError?.(err);
        }
      }, 10000); // 10 second timeout

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
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
        
        console.log('Sending setup message:', JSON.stringify(setupMessage, null, 2));
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
        clearTimeout(connectionTimeout);
        console.error('WebSocket error:', error);
        console.error('WebSocket URL was:', wsUrl.replace(key || '', '[API_KEY]'));
        console.error('WebSocket readyState:', ws.readyState);
        updateState('error');
        const err = new Error('WebSocket connection error');
        onError?.(err);
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket closed:', event.code, event.reason);
        updateState('disconnected');
        wsRef.current = null;
      };

    } catch (error) {
      updateState('error');
      const err = error instanceof Error ? error : new Error('Connection failed');
      onError?.(err);
    }
  }, [connectionState, apiKey, model, fetchApiKey, testApiAccess, updateState, onMessage, onError]);

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