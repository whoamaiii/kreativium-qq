"use client";

import { useEffect, useState } from 'react';

interface WaveformProps {
  isActive?: boolean;
}

const Waveform: React.FC<WaveformProps> = ({ isActive = false }) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate dummy waveform data
    const generateBars = () => {
      const barCount = 40;
      const newBars = Array.from({ length: barCount }, () => 
        isActive 
          ? Math.random() * 80 + 10 // Active: Random height between 10-90
          : Math.random() * 20 + 5  // Inactive: Smaller height between 5-25
      );
      setBars(newBars);
    };

    generateBars();
    
    // Animate the waveform only when active
    if (isActive) {
      const interval = setInterval(generateBars, 100); // Faster when active
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(generateBars, 500); // Slower when inactive
      return () => clearInterval(interval);
    }
  }, [isActive]);

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
        {isActive ? 'Recording audio...' : 'Listening for audio input...'}
      </div>
    </div>
  );
};

export default Waveform; 