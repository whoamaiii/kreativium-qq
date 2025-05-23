"use client";

import { useState } from 'react';

type RecordingState = 'idle' | 'recording' | 'stopped';

const MicControls: React.FC = () => {
  const [state, setState] = useState<RecordingState>('idle');

  const handleReset = () => {
    setState('idle');
    console.log('Reset triggered');
  };

  const handleRecord = () => {
    setState('recording');
    console.log('Recording started');
  };

  const handleStop = () => {
    setState('stopped');
    console.log('Recording stopped');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center space-x-8">
        {/* Reset Button */}
        <button
          onClick={handleReset}
          disabled={state === 'idle'}
          className={`
            w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold
            transition-all duration-200 transform hover:scale-105
            ${state === 'idle' 
              ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-600 border-gray-400 text-white hover:bg-gray-500 active:scale-95'
            }
          `}
          title="Reset"
        >
          ▢
        </button>

        {/* Record Button */}
        <button
          onClick={handleRecord}
          disabled={state === 'recording'}
          className={`
            w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl
            transition-all duration-200 transform hover:scale-105
            ${state === 'recording'
              ? 'bg-red-600 border-red-400 text-white animate-pulse cursor-not-allowed'
              : 'bg-red-500 border-red-400 text-white hover:bg-red-400 active:scale-95'
            }
          `}
          title="Record"
        >
          ⭘
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          disabled={state !== 'recording'}
          className={`
            w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl
            transition-all duration-200 transform hover:scale-105
            ${state !== 'recording'
              ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 border-gray-400 text-white hover:bg-gray-500 active:scale-95'
            }
          `}
          title="Stop"
        >
          ■
        </button>
      </div>

      {/* Status Display */}
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">Status</div>
        <div className={`
          text-lg font-medium px-3 py-1 rounded-full
          ${state === 'idle' && 'text-gray-300'}
          ${state === 'recording' && 'text-red-400'}
          ${state === 'stopped' && 'text-green-400'}
        `}>
          {state === 'idle' && 'Ready to record'}
          {state === 'recording' && 'Recording...'}
          {state === 'stopped' && 'Recording stopped'}
        </div>
      </div>
    </div>
  );
};

export default MicControls; 