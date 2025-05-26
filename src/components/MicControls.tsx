"use client";

// import { useState } from 'react'; // No longer needed

type RecordingState = 'idle' | 'recording' | 'stopped'; // Kept for clarity, but not directly used for internal state

interface MicControlsProps {
  onReset?: () => void;
  onStartLiveChat?: () => void;
  onStopLiveChat?: () => void;
  isLiveChatActive?: boolean;
  isConnected?: boolean;
  isRecording?: boolean;
}

const MicControls: React.FC<MicControlsProps> = ({ 
  onReset,
  onStartLiveChat,
  onStopLiveChat,
  isLiveChatActive = false,
  isConnected = false,
  isRecording = false,
}) => {
  // const [internalState, setInternalState] = useState<RecordingState>('idle'); // Removed internal state

  // Rely solely on props for state determination
  const determineDisplayState = (): RecordingState => {
    if (isRecording) return 'recording';
    if (isConnected) return 'idle'; // Or 'stopped' if you had a way to show that post-recording
    return 'idle'; // Default if not connected
  };

  const displayState = determineDisplayState();

  const handleReset = () => {
    // setInternalState('idle'); // Removed
    onReset?.();
    console.log('[MicControls] Reset triggered via onReset prop');
  };

  const handleStartLiveChat = () => {
    if (!isConnected && !isLiveChatActive) {
      console.log('[MicControls] Starting live chat (will auto-connect)');
    } else if (isConnected && !isLiveChatActive) {
      console.log('[MicControls] Starting live chat on existing connection');
    } else {
      console.log('[MicControls] Live chat already active');
      return;
    }
    onStartLiveChat?.();
  };

  const handleStopLiveChat = () => {
    // Add confirmation to prevent accidental stops
    if (confirm('Are you sure you want to stop the live chat?')) {
      console.log('[MicControls] Stopping live chat (confirmed)');
      onStopLiveChat?.();
    } else {
      console.log('[MicControls] Stop live chat cancelled by user');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center space-x-8">
        {/* Reset Button */}
        <button
          onClick={handleReset}
          disabled={isLiveChatActive} // Disable reset during live chat
          className={`
            w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold
            transition-all duration-200 transform hover:scale-105
            ${isLiveChatActive
              ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-600 border-gray-400 text-white hover:bg-gray-500 active:scale-95'
            }
          `}
          title="Reset"
        >
          ▢
        </button>

        {/* Live Chat Toggle Button */}
        {!isLiveChatActive ? (
          // Start Live Chat Button
          <button
            onClick={handleStartLiveChat}
            disabled={isLiveChatActive}
            className={`
              w-20 h-20 rounded-full border-2 flex items-center justify-center text-sm font-bold
              transition-all duration-200 transform hover:scale-105
              ${isLiveChatActive
                ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 border-green-400 text-white hover:bg-green-400 active:scale-95'
              }
            `}
            title="Start Live Chat"
          >
            🎤
          </button>
        ) : (
          // Stop Live Chat Button
          <button
            onClick={handleStopLiveChat}
            disabled={!isLiveChatActive}
            className={`
              w-20 h-20 rounded-full border-2 flex items-center justify-center text-sm font-bold
              transition-all duration-200 transform hover:scale-105 animate-pulse
              ${!isLiveChatActive
                ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 border-red-400 text-white hover:bg-red-400 active:scale-95'
              }
            `}
            title="Stop Live Chat"
          >
            🛑
          </button>
        )}

        {/* Info Button (placeholder for future features) */}
        <button
          disabled={true}
          className={`
            w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl
            transition-all duration-200 transform hover:scale-105
            bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed
          `}
          title="Info"
        >
          ℹ
        </button>
      </div>

      {/* Status Display */}
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">Status</div>
        <div className={`
          text-lg font-medium px-4 py-2 rounded-full border-2
          ${!isConnected && !isLiveChatActive && 'text-gray-500 border-gray-600 bg-gray-800'}
          ${isConnected && !isLiveChatActive && 'text-gray-300 border-gray-500 bg-gray-700'} 
          ${isLiveChatActive && !isRecording && 'text-yellow-400 border-yellow-500 bg-yellow-900/20 animate-pulse'}
          ${isLiveChatActive && isRecording && 'text-green-400 border-green-500 bg-green-900/20 animate-pulse'}
        `}>
          {!isConnected && !isLiveChatActive && 'Not connected'}
          {isConnected && !isLiveChatActive && 'Ready for live chat'} 
          {isLiveChatActive && !isRecording && 'Live chat starting...'}
          {isLiveChatActive && isRecording && '🔴 LIVE CHAT ACTIVE 🎙️'}
        </div>
        
        {/* Additional instruction when live chat is active */}
        {isLiveChatActive && (
          <div className="text-xs text-gray-400 mt-2">
            Speak now - Gemini is listening
          </div>
        )}
      </div>
    </div>
  );
};

export default MicControls; 