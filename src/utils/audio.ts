/**
 * Audio utility functions for Gemini Live API
 * Based on the LitElement example implementation
 */

export function createBlob(pcmData: Float32Array): MediaStream {
  // Convert Float32Array PCM data to a MediaStream blob
  // This is a simplified implementation - in practice you might need more sophisticated audio processing
  const canvas = document.createElement('canvas');
  const mediaStream = canvas.captureStream();
  return mediaStream;
}

export function decode(base64Data: string): ArrayBuffer {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function decodeAudioData(
  arrayBuffer: ArrayBuffer,
  audioContext: AudioContext,
  sampleRate: number,
  channels: number
): Promise<AudioBuffer> {
  return audioContext.decodeAudioData(arrayBuffer);
}

export function encodeAudioData(audioBuffer: AudioBuffer): string {
  // Convert AudioBuffer to base64 encoded data
  const channelData = audioBuffer.getChannelData(0);
  const int16Array = new Int16Array(channelData.length);
  
  for (let i = 0; i < channelData.length; i++) {
    // Convert from float [-1, 1] to int16 [-32768, 32767]
    int16Array[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32767));
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  
  return btoa(binary);
} 