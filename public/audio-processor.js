class GeminiAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isRecording = false;
    this.frameCount = 0;
    this.audioBuffer = [];
    this.bufferSize = 256; // Collect more samples before sending
    
    // Listen for messages from the main thread
    this.port.onmessage = (event) => {
      if (event.data.type === 'setRecording') {
        this.isRecording = event.data.value;
        console.log(`[AudioWorklet] Recording set to: ${this.isRecording}`);
        if (!this.isRecording) {
          // Clear buffer when stopping recording
          this.audioBuffer = [];
        }
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    this.frameCount++;
    
    // Log every 100 frames to avoid spam
    if (this.frameCount % 100 === 0) {
      console.log(`[AudioWorklet] Frame ${this.frameCount}, isRecording: ${this.isRecording}, inputs length: ${inputs.length}, input channels: ${input.length}`);
    }
    
    if (input.length > 0 && this.isRecording) {
      let monoChannel;
      
      if (input.length === 1) {
        // Already mono
        monoChannel = input[0];
      } else if (input.length === 2) {
        // Convert stereo to mono by averaging channels
        const leftChannel = input[0];
        const rightChannel = input[1];
        const channelLength = leftChannel.length;
        monoChannel = new Float32Array(channelLength);
        
        for (let i = 0; i < channelLength; i++) {
          monoChannel[i] = (leftChannel[i] + rightChannel[i]) / 2;
        }
      } else {
        // More than 2 channels, just use the first
        monoChannel = input[0];
      }
      
      if (monoChannel && monoChannel.length > 0) {
        // Add to buffer
        for (let i = 0; i < monoChannel.length; i++) {
          this.audioBuffer.push(monoChannel[i]);
        }
        
        // Calculate audio level for visual feedback
        let sum = 0;
        for (let i = 0; i < monoChannel.length; i++) {
          sum += monoChannel[i] * monoChannel[i];
        }
        const rms = Math.sqrt(sum / monoChannel.length);
        const audioLevel = Math.min(1, rms * 10); // Scale for visualization
        
        // Log audio level every 50 frames when recording
        if (this.frameCount % 50 === 0) {
          console.log(`[AudioWorklet] Audio level: ${audioLevel.toFixed(4)}, RMS: ${rms.toFixed(6)}, samples: ${monoChannel.length}, buffer: ${this.audioBuffer.length}`);
        }
        
        // Send buffer when it reaches target size
        if (this.audioBuffer.length >= this.bufferSize) {
          const bufferCopy = new Float32Array(this.audioBuffer);
          this.audioBuffer = []; // Clear the buffer
          
          this.port.postMessage({
            type: 'audioData',
            data: bufferCopy,
            audioLevel: audioLevel
          });
        }
      } else {
        if (this.frameCount % 100 === 0) {
          console.log(`[AudioWorklet] No input channel data available`);
        }
      }
    }

    return true; // Keep the processor alive
  }
}

registerProcessor('gemini-audio-processor', GeminiAudioProcessor); 