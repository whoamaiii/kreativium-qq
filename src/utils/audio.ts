/**
 * Audio utility functions for Gemini Live API
 * Based on the LitElement example implementation
 */

/**
 * Convert PCM audio data to a Blob
 * @param pcmData - Float32Array of PCM audio samples
 * @param sampleRate - Sample rate of the audio (e.g., 16000)
 * @returns Blob containing WAV audio data
 */
export function createBlob(pcmData: Float32Array, sampleRate: number = 16000): Blob {
  // Convert Float32Array to Int16Array
  const int16Data = new Int16Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    // Convert from float [-1, 1] to int16 [-32768, 32767]
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  // Create WAV file
  const wavBuffer = createWavBuffer(int16Data, sampleRate);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

/**
 * Create a WAV file buffer from PCM data
 * @param pcmData - Int16Array of PCM samples
 * @param sampleRate - Sample rate
 * @returns ArrayBuffer containing WAV file data
 */
function createWavBuffer(pcmData: Int16Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1; // Mono
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length * bytesPerSample;
  const fileSize = 44 + dataSize; // 44 bytes for WAV header

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // Write WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');                      // ChunkID
  view.setUint32(4, fileSize - 8, true);       // ChunkSize
  writeString(8, 'WAVE');                      // Format
  writeString(12, 'fmt ');                     // Subchunk1ID
  view.setUint32(16, 16, true);               // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);                // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);      // NumChannels
  view.setUint32(24, sampleRate, true);       // SampleRate
  view.setUint32(28, byteRate, true);         // ByteRate
  view.setUint16(32, blockAlign, true);       // BlockAlign
  view.setUint16(34, bitsPerSample, true);    // BitsPerSample
  writeString(36, 'data');                     // Subchunk2ID
  view.setUint32(40, dataSize, true);         // Subchunk2Size

  // Write PCM data
  const dataOffset = 44;
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(dataOffset + i * 2, pcmData[i], true);
  }

  return buffer;
}

/**
 * Create a MediaStream from audio blob (for compatibility)
 * Note: This creates a silent MediaStream as we can't directly create
 * a MediaStream from audio data in the browser
 * @returns MediaStream
 */
export function createMediaStreamFromBlob(): MediaStream {
  // Create an audio context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create a destination stream
  const destination = audioContext.createMediaStreamDestination();
  
  // Create an oscillator that outputs silence (0 frequency)
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.value = 0;
  oscillator.connect(destination);
  oscillator.start();
  
  // Stop after a short time to avoid wasting resources
  setTimeout(() => oscillator.stop(), 100);
  
  return destination.stream;
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
  audioContext: AudioContext
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