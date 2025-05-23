"use client";

import { useState } from 'react';

type RecordingState = 'idle' | 'recording' | 'stopped';

interface MicControlsProps {
  onReset?: () => void;
  onRecord?: () => void;
  onStop?: () => void;
  isRecording?: boolean;
  isConnected?: boolean;
}

const MicControls: React.FC<MicControlsProps> = ({ 
  onReset,
  onRecord,
  onStop,
  isRecording = false,
  isConnected = false,
}) => {
  const [internalState, setInternalState] = useState<RecordingState>('idle');

  // Use external state if provided, otherwise fall back to internal state
  const currentState = isRecording ? 'recording' : 
                      (internalState === 'recording' ? 'stopped' : internalState);

  const handleReset = () => {
    setInternalState('idle');
    onReset?.();
    console.log('Reset triggered');
  };

  const handleRecord = () => {
    if (!isConnected) {
      console.log('Cannot record: not connected');
      return;
    }
    
    setInternalState('recording');
    onRecord?.();
    console.log('Recording started');
  };

  const handleStop = () => {
    setInternalState('stopped');
    onStop?.();
    console.log('Recording stopped');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center space-x-8">
        {/* Reset Button */}
        <button
          onClick={handleReset}
          disabled={currentState === 'idle' && !isRecording}
          className={`
            w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold
            transition-all duration-200 transform hover:scale-105
            ${(currentState === 'idle' && !isRecording)
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
          disabled={isRecording || !isConnected}
          className={`
            w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl
            transition-all duration-200 transform hover:scale-105
            ${isRecording
              ? 'bg-red-600 border-red-400 text-white animate-pulse cursor-not-allowed'
              : isConnected
                ? 'bg-red-500 border-red-400 text-white hover:bg-red-400 active:scale-95'
                : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
            }
          `}
          title={isConnected ? "Record" : "Connect first"}
        >
          ⭘
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          disabled={!isRecording}
          className={`
            w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl
            transition-all duration-200 transform hover:scale-105
            ${!isRecording
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
          ${!isConnected && 'text-gray-500'}
          ${currentState === 'idle' && isConnected && 'text-gray-300'}
          ${isRecording && 'text-red-400'}
          ${currentState === 'stopped' && 'text-green-400'}
        `}>
          {!isConnected && 'Not connected'}
          {isConnected && !isRecording && currentState === 'idle' && 'Ready to record'}
          {isRecording && 'Recording...'}
          {isConnected && !isRecording && currentState === 'stopped' && 'Recording stopped'}
        </div>
      </div>
    </div>
  );
};

export default MicControls; 