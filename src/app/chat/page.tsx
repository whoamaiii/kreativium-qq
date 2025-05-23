import PigletAvatar from '@/components/PigletAvatar';
import Waveform from '@/components/Waveform';
import MicControls from '@/components/MicControls';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 h-screen">
        <div className="grid grid-rows-[30%_40%_30%] h-full gap-6">
          {/* Avatar Section - 30% */}
          <div className="flex items-center justify-center">
            <PigletAvatar />
          </div>

          {/* Waveform Section - 40% */}
          <div className="flex items-center justify-center">
            <Waveform />
          </div>

          {/* Controls Section - 30% */}
          <div className="flex items-center justify-center">
            <MicControls />
          </div>
        </div>
      </div>
    </div>
  );
} 