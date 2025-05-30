"use client";

import { useEffect, useState } from 'react';

interface WaveformProps {
  isActive?: boolean;
  audioLevel?: number; // Real-time audio level from 0-1
  audioData?: Float32Array; // Optional: actual audio waveform data
}

const Waveform: React.FC<WaveformProps> = ({ isActive = false, audioLevel = 0, audioData }) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    const generateBars = () => {
      const barCount = 40;
      
      if (audioData && audioData.length > 0) {
        // Use real audio data if available
        const samplesPerBar = Math.floor(audioData.length / barCount);
        const newBars = [];
        
        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          let count = 0;
          
          // Calculate average amplitude for this bar
          for (let j = 0; j < samplesPerBar; j++) {
            const sampleIndex = i * samplesPerBar + j;
            if (sampleIndex < audioData.length) {
              sum += Math.abs(audioData[sampleIndex]);
              count++;
            }
          }
          
          const avgAmplitude = count > 0 ? sum / count : 0;
          // Scale to 0-90 range for display
          newBars.push(avgAmplitude * 90);
        }
        
        setBars(newBars);
      } else if (audioLevel > 0) {
        // Use audio level to generate reactive bars
        const newBars = Array.from({ length: barCount }, (_, index) => {
          // Create a wave pattern based on audio level
          const wavePosition = (Date.now() / 100 + index) % barCount;
          const waveFactor = Math.sin((wavePosition / barCount) * Math.PI * 2) * 0.5 + 0.5;
          const baseHeight = audioLevel * 60;
          const variation = Math.random() * 20;
          return baseHeight * waveFactor + variation + 10;
        });
        setBars(newBars);
      } else {
        // Generate idle animation when no audio
        const newBars = Array.from({ length: barCount }, (_, index) => {
          if (isActive) {
            // Small reactive bars when active but no audio
            return Math.random() * 15 + 5;
          } else {
            // Very small bars when inactive
            return Math.random() * 10 + 2;
          }
        });
        setBars(newBars);
      }
    };

    generateBars();
    
    // Update animation based on state
    const updateInterval = audioData || audioLevel > 0 ? 50 : (isActive ? 100 : 500);
    const interval = setInterval(generateBars, updateInterval);
    
    return () => clearInterval(interval);
  }, [isActive, audioLevel, audioData]);

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-2xl">
      <h3 className="text-lg font-medium text-gray-300">Audio Waveform</h3>
      
      <div className="w-full h-32 bg-gray-800 rounded-lg border border-gray-600 p-4">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 800 100"
          className="overflow-visible"
        >
          {bars.map((height, index) => (
            <rect
              key={index}
              x={index * 20}
              y={50 - height / 2}
              width={16}
              height={height}
              fill={isActive 
                ? `hsl(${240 + index * 2}, 70%, ${60 + height / 3}%)` 
                : `hsl(${240 + index * 2}, 40%, ${40 + height / 4}%)`
              }
              className={`transition-all duration-200 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-60'
              }`}
              rx={2}
            />
          ))}
        </svg>
      </div>
      
      <div className="text-sm text-gray-400">
        {isActive 
          ? audioLevel > 0 
            ? `Recording audio... (Level: ${Math.round(audioLevel * 100)}%)`
            : 'Recording audio...'
          : 'Listening for audio input...'
        }
      </div>
    </div>
  );
};

export default Waveform; 