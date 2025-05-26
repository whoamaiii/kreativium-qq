"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface GeminiMessage {
  type: 'text' | 'audio';
  content?: string;
  audio?: string;
}

export interface UseGeminiLiveOptions {
  model?: string;
  onMessage?: (message: GeminiMessage) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ConnectionState) => void;
  onAudioLevel?: (level: number) => void;
}

interface LiveSessionMessage {
  setupComplete?: boolean;
  serverContent?: {
    modelTurn?: {
      parts?: Array<{
        inlineData?: {
          data: string;
          mimeType: string;
        };
      }>;
    };
    interrupted?: boolean;
  };
}

interface WebkitWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

// Helper functions from Google's implementation
function encodeAudioData(float32Array: Float32Array): Uint8Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = sample * 32767;
  }
  return new Uint8Array(int16Array.buffer);
}

function createBlob(pcmData: Float32Array): Blob {
  const uint8Array = encodeAudioData(pcmData);
  return new Blob([uint8Array], { type: 'audio/pcm' });
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array;
}

async function decodeAudioData(
  uint8Array: Uint8Array,
  audioContext: AudioContext,
  sampleRate: number,
  numberOfChannels: number
): Promise<AudioBuffer> {
  // Convert Uint8Array to Float32Array
  const int16Array = new Int16Array(uint8Array.buffer);
  const float32Array = new Float32Array(int16Array.length);
  
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768;
  }
  
  const audioBuffer = audioContext.createBuffer(
    numberOfChannels,
    float32Array.length / numberOfChannels,
    sampleRate
  );
  
  audioBuffer.copyToChannel(float32Array, 0);
  return audioBuffer;
}

export function useGeminiLive({
  model = 'gemini-2.5-flash-preview-native-audio-dialog', // Using Google's model
  onMessage,
  onError,
  onStateChange,
  onAudioLevel,
}: UseGeminiLiveOptions = {}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isRecording, setIsRecording] = useState(false);
  
  const sessionRef = useRef<{ close: () => void; send: (data: unknown) => void } | null>(null);
  const clientRef = useRef<GoogleGenAI | null>(null);
  
  // Audio contexts matching Google's implementation
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  
  // Recording nodes
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  
  // Audio playback
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const updateConnectionState = useCallback((newState: ConnectionState) => {
    console.log(`[useGeminiLive] Connection state changing to: ${newState}`);
    setConnectionState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  const initAudio = useCallback(() => {
    console.log('[useGeminiLive] Initializing audio contexts...');
    const inputContext = new (window.AudioContext || (window as WebkitWindow).webkitAudioContext)({
      sampleRate: 16000
    });
    const outputContext = new (window.AudioContext || (window as WebkitWindow).webkitAudioContext)({
      sampleRate: 24000
    });
    
    inputAudioContextRef.current = inputContext;
    outputAudioContextRef.current = outputContext;
    
    // Create gain nodes
    inputNodeRef.current = inputContext.createGain();
    outputNodeRef.current = outputContext.createGain();
    
    // Connect output to destination
    outputNodeRef.current.connect(outputContext.destination);
    
    nextStartTimeRef.current = outputContext.currentTime;
    console.log('[useGeminiLive] Audio contexts initialized.');
  }, []);

  const connect = useCallback(async () => {
    console.log('[useGeminiLive] Attempting to connect...');
    updateConnectionState('connecting');
      
    try {
      initAudio();
      
      console.log('[useGeminiLive] Fetching API token...');
      const response = await fetch('/api/live-token');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const apiKey = data.apiKey;
      console.log('[useGeminiLive] Fetched API Key for GoogleGenAI:', apiKey ? `Exists (length: ${apiKey.length})` : 'MISSING');
      
      if (!apiKey) {
        throw new Error('API key is missing from token endpoint response.');
      }
      
      const client = new GoogleGenAI({ apiKey });
      clientRef.current = client;
      console.log('[useGeminiLive] GoogleGenAI client initialized.');
      
      console.log('[useGeminiLive] Connecting to Gemini Live session...');
      const session = await client.live.connect({
        model: model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } }
          }
        },
        callbacks: {
          onopen: () => {
            console.log('[useGeminiLive] Live session opened successfully.');
            updateConnectionState('connected');
          },
          onmessage: async (message: LiveSessionMessage) => {
            console.log('[useGeminiLive] Received message:', JSON.stringify(message, null, 2));
            
            // Check for setup complete
            if (message.setupComplete) {
              console.log('[useGeminiLive] ✅ Setup complete - ready for audio input');
            }
            
            // Check for model turn (audio response)
            if (message.serverContent?.modelTurn) {
              console.log('[useGeminiLive] 🎵 Received model turn (audio response)');
            }
            
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
            
            if (audio && outputAudioContextRef.current && outputNodeRef.current) {
              try {
                console.log('[useGeminiLive] Processing received audio data...');
                console.log('[useGeminiLive] Audio data length:', audio.data.length);
                console.log('[useGeminiLive] Output audio context state:', outputAudioContextRef.current.state);
                
                // Ensure output context is running
                if (outputAudioContextRef.current.state === 'suspended') {
                  console.log('[useGeminiLive] Resuming output audio context...');
                  await outputAudioContextRef.current.resume();
                }
                
                nextStartTimeRef.current = Math.max(
                  nextStartTimeRef.current,
                  outputAudioContextRef.current.currentTime
                );

                const audioBuffer = await decodeAudioData(
                  decode(audio.data),
                  outputAudioContextRef.current,
                  24000,
                  1
                );
                
                console.log('[useGeminiLive] Audio buffer created - Duration:', audioBuffer.duration, 'seconds');
                
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNodeRef.current);
                
                source.addEventListener('ended', () => {
                  console.log('[useGeminiLive] Audio source ended.');
                  sourcesRef.current.delete(source);
                });

                console.log('[useGeminiLive] Starting audio playback at time:', nextStartTimeRef.current);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                sourcesRef.current.add(source);
                console.log('[useGeminiLive] Audio playback scheduled successfully.');
                
                onMessage?.({
                  type: 'audio',
                  audio: audio.data
                });
              } catch (error) {
                console.error('[useGeminiLive] Error playing audio:', error);
              }
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              console.log('[useGeminiLive] Received interruption signal.');
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (error: Error | { message?: string } | string) => {
            console.error('[useGeminiLive] Live session onerror callback:', error);
            const errorMessage = (error as Error)?.message || (typeof error === 'string' ? error : 'Unknown live session error');
            updateConnectionState('error');
            onError?.(error instanceof Error ? error : new Error(errorMessage));
          },
          onclose: (event: CloseEvent | { code?: number; reason?: string; wasClean?: boolean }) => {
            console.log('[useGeminiLive] Live session onclose callback. Event:', event);
            console.log(`[useGeminiLive] Session closed. Code: ${event?.code}, Reason: ${event?.reason}, WasClean: ${event?.wasClean}`);
            updateConnectionState('disconnected');
            cleanup();
          }
        }
      });
      
      sessionRef.current = session;
      console.log('[useGeminiLive] Gemini Live session assigned to ref.');
      
    } catch (error) {
      console.error('[useGeminiLive] Failed to connect:', error);
      updateConnectionState('error');
      onError?.(error as Error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, onMessage, onError, updateConnectionState, initAudio]);

  const cleanup = useCallback(() => {
    console.log('[useGeminiLive] Running cleanup...');
    setIsRecording(false);
    
    // Clean up recording nodes
    if (audioWorkletNodeRef.current && sourceNodeRef.current) {
      console.log('[useGeminiLive] Disconnecting audio worklet and source node.');
      if ('port' in audioWorkletNodeRef.current) {
        // It's an AudioWorkletNode - stop recording
        audioWorkletNodeRef.current.port.postMessage({
          type: 'setRecording',
          value: false
        });
      }
      audioWorkletNodeRef.current.disconnect();
      sourceNodeRef.current.disconnect();
    }
    
    audioWorkletNodeRef.current = null;
    sourceNodeRef.current = null;
    
    // Stop media stream
    if (mediaStreamRef.current) {
      console.log('[useGeminiLive] Stopping media stream tracks.');
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Stop all audio sources
    if (sourcesRef.current.size > 0) {
        console.log('[useGeminiLive] Stopping playing audio sources.');
        for (const source of sourcesRef.current.values()) {
            source.stop();
            sourcesRef.current.delete(source);
        }
    }
    
    // Close audio contexts
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      console.log('[useGeminiLive] Closing input audio context.');
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      console.log('[useGeminiLive] Closing output audio context.');
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    inputNodeRef.current = null;
    outputNodeRef.current = null;
    nextStartTimeRef.current = 0;
    console.log('[useGeminiLive] Cleanup complete.');
  }, []);

  const disconnect = useCallback(() => {
    console.log('[useGeminiLive] Disconnecting...');
    if (sessionRef.current) {
      console.log('[useGeminiLive] Closing active session manually.');
      sessionRef.current.close(); // This should trigger onclose -> cleanup
      sessionRef.current = null;
    } else {
      // If no session, still ensure cleanup happens
      cleanup();
    }
    updateConnectionState('disconnected');
  }, [cleanup, updateConnectionState]);

  const startRecording = useCallback(async () => {
    console.log('[useGeminiLive] Attempting to start recording...');
    
    // Check if we're in a secure context
    if (!window.isSecureContext) {
      console.warn('[useGeminiLive] Not in secure context - microphone access requires HTTPS or localhost');
      onError?.(new Error('Microphone access requires HTTPS or localhost'));
      return;
    }
    
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[useGeminiLive] getUserMedia not available');
      onError?.(new Error('getUserMedia not available in this browser'));
      return;
    }
    
    if (!sessionRef.current) {
      console.warn('[useGeminiLive] Start recording failed: No active session.');
      return;
    }
    if (!inputAudioContextRef.current) {
      console.warn('[useGeminiLive] Start recording failed: Input audio context not ready.');
      return;
    }
    if (isRecording) {
      console.warn('[useGeminiLive] Start recording called but already recording.');
      return;
    }

    try {
      // Check if inputAudioContextRef is null before proceeding
      if (!inputAudioContextRef.current) {
        console.error('[useGeminiLive] Input audio context is null before starting recording. This is likely due to a previous session closure (e.g., quota exceeded).');
        onError?.(new Error('Cannot start recording: Audio context not available. Please check session status.'));
        updateConnectionState('error');
        return;
      }

      console.log('[useGeminiLive] Resuming inputAudioContext...');
      await inputAudioContextRef.current.resume();
      console.log('[useGeminiLive] inputAudioContext resumed.');

      console.log('[useGeminiLive] Requesting microphone access (getUserMedia)...');
      
      // Check permissions safely
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({name: 'microphone' as PermissionName});
          console.log('[useGeminiLive] Current permissions state:', permissionStatus);
        } else {
          console.log('[useGeminiLive] Permissions API not available');
        }
      } catch (permError) {
        console.warn('[useGeminiLive] Could not check permissions:', permError);
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false
      });
      console.log('[useGeminiLive] Microphone access granted. Stream:', stream);
      console.log('[useGeminiLive] Stream tracks:', stream.getTracks());
      
      mediaStreamRef.current = stream;
      
      if (!inputAudioContextRef.current) {
        throw new Error('Input audio context became null after getUserMedia');
      }
      
      sourceNodeRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
      
      if (!inputNodeRef.current) {
        throw new Error('Input node is null');
      }
      
      sourceNodeRef.current.connect(inputNodeRef.current);
      
      // Load AudioWorklet module and create AudioWorkletNode
      console.log('[useGeminiLive] Loading AudioWorklet module...');
      try {
        await inputAudioContextRef.current.audioWorklet.addModule('/audio-processor.js');
        console.log('[useGeminiLive] AudioWorklet module loaded successfully.');
        
        audioWorkletNodeRef.current = new AudioWorkletNode(
          inputAudioContextRef.current, 
          'gemini-audio-processor',
          { 
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1] // Force mono output from the worklet
          }
        );
        
        // Set up message handling for audio data from the worklet
        audioWorkletNodeRef.current.port.onmessage = (event) => {
          if (event.data.type === 'audioData' && isRecording && sessionRef.current) {
            const { data: pcmData, audioLevel } = event.data;
            
            // Call audio level callback for UI feedback
            onAudioLevel?.(audioLevel);
            
            // Log audio activity - reduce logging frequency 
            if (Math.random() < 0.01) { // Log ~1% of frames to reduce spam
              console.log(`[useGeminiLive] Audio frame - Level: ${audioLevel.toFixed(4)}, PCM length: ${pcmData.length}`);
            }

            try {
              if (sessionRef.current?.sendRealtimeInput) { 
                const blob = createBlob(pcmData);
                
                sessionRef.current.sendRealtimeInput({
                  media: blob
                });
                
                // Log success occasionally for debugging
                if (Math.random() < 0.01) { 
                  console.log(`[useGeminiLive] Audio sent - Blob size: ${blob.size} bytes, PCM length: ${pcmData.length}`);
                }
              } else {
                console.warn('[useGeminiLive] sessionRef.current.sendRealtimeInput is not available.');
              }
            } catch (error) {
              console.warn('[useGeminiLive] Error sending audio:', error);
            }
          }
        };
        
        // Connect the audio nodes
        sourceNodeRef.current.connect(audioWorkletNodeRef.current);
        audioWorkletNodeRef.current.connect(inputAudioContextRef.current.destination);
        
        // Start recording by sending message to worklet
        audioWorkletNodeRef.current.port.postMessage({
          type: 'setRecording',
          value: true
        });
        
        setIsRecording(true);
        console.log('[useGeminiLive] Recording started successfully with AudioWorkletNode.');
        
      } catch (workletError) {
        console.warn('[useGeminiLive] Failed to load AudioWorklet, falling back to ScriptProcessorNode:', workletError);
        
        // Fallback to ScriptProcessorNode for compatibility
        const bufferSize = 256;
        console.log(`[useGeminiLive] Creating fallback ScriptProcessorNode with buffer size: ${bufferSize}`);
        
        if (!inputAudioContextRef.current) {
          // If context is null here, it means cleanup was likely called due to session closure (e.g. quota)
          console.warn('[useGeminiLive] Input audio context is null, cannot create fallback node. This might be due to session closure.');
          // We should not throw an error here, but rather let the existing error handling (for session closure) manage the state.
          // setIsRecording(false) and updateConnectionState('error') will be handled by the session error/close path.
          return; 
        }
        
        const scriptProcessorNode = inputAudioContextRef.current.createScriptProcessor(
          bufferSize,
          1,
          1
        );
        
        scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
          if (!isRecording || !sessionRef.current) {
              return;
          }
          
          const inputBuffer = audioProcessingEvent.inputBuffer;
          const pcmData = inputBuffer.getChannelData(0);
          
          // Calculate audio level for visual feedback
          let sum = 0;
          for (let i = 0; i < pcmData.length; i++) {
            sum += pcmData[i] * pcmData[i];
          }
          const rms = Math.sqrt(sum / pcmData.length);
          const audioLevel = Math.min(1, rms * 10); // Scale for visualization
          
          // Call audio level callback for UI feedback
          onAudioLevel?.(audioLevel);
          
          // Log audio activity - reduce logging frequency
          if (Math.random() < 0.01) { // Log ~1% of frames to reduce spam
            console.log(`[useGeminiLive] Audio frame (fallback) - Level: ${audioLevel.toFixed(4)}, PCM length: ${pcmData.length}`);
          }

          try {
            if (sessionRef.current?.sendRealtimeInput) { 
              const blob = createBlob(pcmData);
              sessionRef.current.sendRealtimeInput({
                media: blob
              });
              // Log success occasionally
              if (Math.random() < 0.01) {
                console.log('[useGeminiLive] Audio data sent to Gemini successfully (fallback)');
              }
            } else {
              console.warn('[useGeminiLive] sessionRef.current.sendRealtimeInput is not available.');
            }
          } catch (error) {
            console.warn('[useGeminiLive] Error sending audio:', error);
          }
        };
        
        sourceNodeRef.current.connect(scriptProcessorNode);
        scriptProcessorNode.connect(inputAudioContextRef.current.destination);
        
        // Store the fallback node in the same ref (we'll handle cleanup properly)
        audioWorkletNodeRef.current = scriptProcessorNode as unknown as AudioWorkletNode;
        
        setIsRecording(true);
        console.log('[useGeminiLive] Recording started successfully with fallback ScriptProcessorNode.');
      }
    } catch (error) {
      console.error('[useGeminiLive] Failed to start recording:', error);
      
      // Safely log error details
      if (error && typeof error === 'object') {
        console.warn('[useGeminiLive] Error name:', (error as Error).name || 'Unknown');
        console.warn('[useGeminiLive] Error message:', (error as Error).message || 'No message');
        console.warn('[useGeminiLive] Error stack:', (error as Error).stack || 'No stack');
      } else {
        console.warn('[useGeminiLive] Error (not an object):', error);
      }
      
      // Handle specific getUserMedia errors
      if (error && typeof error === 'object' && 'name' in error) {
        const errorName = (error as Error).name;
        if (errorName === 'NotAllowedError') {
          console.warn('[useGeminiLive] Microphone permission denied by user');
        onError?.(new Error('Microphone permission denied. Please allow microphone access and try again.'));
        } else if (errorName === 'NotFoundError') {
          console.warn('[useGeminiLive] No microphone found');
        onError?.(new Error('No microphone found. Please connect a microphone and try again.'));
        } else if (errorName === 'NotReadableError') {
          console.warn('[useGeminiLive] Microphone is already in use');
        onError?.(new Error('Microphone is already in use by another application.'));
        } else {
          onError?.(error instanceof Error ? error : new Error(String(error)));
        }
      } else {
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
      updateConnectionState('error'); 
      setIsRecording(false); 
    }
  }, [onError, isRecording, updateConnectionState, onAudioLevel]);

  const stopRecording = useCallback(() => {
    console.log('[useGeminiLive] Attempting to stop recording...');
    if (!isRecording) {
      console.warn('[useGeminiLive] Stop recording called but not currently recording.');
      return;
    }
    
    setIsRecording(false); // Set immediately
    
    // Stop recording in AudioWorkletNode if it exists
    if (audioWorkletNodeRef.current) {
      if ('port' in audioWorkletNodeRef.current) {
        // It's an AudioWorkletNode
        audioWorkletNodeRef.current.port.postMessage({
          type: 'setRecording',
          value: false
        });
        console.log('[useGeminiLive] Stopped recording in AudioWorkletNode.');
      }
      // Disconnect the node
      audioWorkletNodeRef.current.disconnect();
    }
    
    // Clean up recording-specific resources
    if (sourceNodeRef.current) {
      console.log('[useGeminiLive] Disconnecting source node for stopRecording.');
      sourceNodeRef.current.disconnect();
    }
    
    audioWorkletNodeRef.current = null; // Nullify to prevent re-use from previous recordings
    sourceNodeRef.current = null;

    if (mediaStreamRef.current) {
      console.log('[useGeminiLive] Stopping media stream tracks for stopRecording.');
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    console.log('[useGeminiLive] Recording stopped.');
  }, [isRecording]);

  const sendMessage = useCallback(async (text: string) => {
    if (!sessionRef.current) {
      console.error('[useGeminiLive] SendMessage failed: No active session');
      return;
    }
    console.log(`[useGeminiLive] Sending text message: "${text}"`);
    try {
      await sessionRef.current.sendClientContent({
        turns: [{
          role: 'user',
          parts: [{ text }]
        }],
        turnComplete: true
      });
      console.log('[useGeminiLive] Text message sent successfully.');
    } catch (error) {
      console.error('[useGeminiLive] Failed to send text message:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  const reset = useCallback(() => {
    console.log('[useGeminiLive] Resetting session...');
    disconnect(); 
  }, [disconnect]);

  useEffect(() => {
    console.log('[useGeminiLive] Hook mounted.');
    return () => {
      console.log('[useGeminiLive] Hook unmounting, running cleanup...');
      cleanup();
    };
  }, [cleanup]);

  return {
    connectionState,
    isRecording,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendMessage,
    reset,
  };
} 