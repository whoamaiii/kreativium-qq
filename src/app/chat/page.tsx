"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import PigletAvatar from '@/components/PigletAvatar';
import MicControls from '@/components/MicControls';
import { useGeminiLive } from '@/hooks/useGeminiLive';

// Symbol data - same as AAC page
const symbolCategories: Record<string, { id: string; label: string; imgSrc: string }[]> = {
  Core: [
    { id: "s1", label: "I", imgSrc: "/symbol-i.png" },
    { id: "s2", label: "want", imgSrc: "/symbol-want.png" },
    { id: "s3", label: "to", imgSrc: "/symbol-to.png" },
    { id: "s4", label: "eat", imgSrc: "/symbol-eat.png" },
    { id: "s5", label: "drink", imgSrc: "/symbol-drink.png" },
    { id: "s6", label: "play", imgSrc: "/symbol-play.png" },
    { id: "s7", label: "go", imgSrc: "/symbol-go.png" },
    { id: "s8", label: "stop", imgSrc: "/symbol-stop.png" },
    { id: "s9", label: "more", imgSrc: "/symbol-more.png" },
  ],
  Feelings: [
    { id: "f1", label: "happy", imgSrc: "/symbols/feelings/happy.png" },
    { id: "f2", label: "sad", imgSrc: "/symbols/feelings/sad.png" },
    { id: "f3", label: "tired", imgSrc: "/symbols/feelings/tired.png" },
  ],
  Questions: [
    { id: "q1", label: "what", imgSrc: "/symbols/questions/what.png" },
    { id: "q2", label: "where", imgSrc: "/symbols/questions/where.png" },
    { id: "q3", label: "when", imgSrc: "/symbols/questions/when.png" },
  ],
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

export default function ChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isLiveChatActive, setIsLiveChatActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<string>("Core");
  const [search, setSearch] = useState("");
  const [sentence, setSentence] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSymbols, setShowSymbols] = useState(true);
  const [textInput, setTextInput] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const symbols = useMemo(
    () => symbolCategories[currentCategory] || [],
    [currentCategory]
  );

  const filteredSymbols = useMemo(
    () =>
      symbols.filter((s) =>
        s.label.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [symbols, search]
  );

  const { 
    connectionState, 
    isRecording, 
    connect, 
    disconnect, 
    startRecording, 
    stopRecording,
    reset
  } = useGeminiLive({
    model: 'gemini-2.5-flash-preview-native-audio-dialog', // Using the correct model
    onMessage: (message) => {
      console.log('Received message:', message);
      
      // Handle audio responses
      if (message.type === 'audio' && message.audio) {
        setAudioQueue(prev => [...prev, message.audio!]);
      }
      
      // Handle text responses (fallback)
      if (message.type === 'text' && message.content) {
        console.log('Gemini says:', message.content);
        // Add assistant message to chat history
        const newMessage: Message = {
          id: Date.now().toString(),
          text: message.content,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    },
    onError: (error) => {
      console.error('Gemini Live error:', error);
      setIsLiveChatActive(false); // Stop live chat on error
    },
    onStateChange: (state) => {
      console.log('Connection state changed:', state);
      setIsConnected(state === 'connected');
      
      // If connection is lost, stop live chat
      if (state === 'disconnected' || state === 'error') {
        setIsLiveChatActive(false);
      }
    },
    onAudioLevel: (level) => {
      setAudioLevel(level);
    },
  });

  // Play audio responses
  useEffect(() => {
    if (audioQueue.length > 0 && audioRef.current) {
      const audioData = audioQueue[0];
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], 
        { type: 'audio/wav' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current.src = audioUrl;
      audioRef.current.play().then(() => {
        // Remove played audio from queue
        setAudioQueue(prev => prev.slice(1));
        URL.revokeObjectURL(audioUrl);
      }).catch(console.error);
    }
  }, [audioQueue]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-start recording when live chat becomes active and connected
  useEffect(() => {
    if (isLiveChatActive && isConnected && !isRecording) {
      console.log('[ChatPage] Auto-starting recording for live chat');
      startRecording();
    }
  }, [isLiveChatActive, isConnected, isRecording, startRecording]);

  const handleConnect = async () => {
    if (connectionState === 'disconnected') {
      await connect();
    } else {
      handleStopLiveChat(); // Stop live chat and disconnect
    }
  };

  const handleStartLiveChat = async () => {
    console.log('[ChatPage] Starting live chat...');
    if (!isConnected) {
      // First connect, then start live chat
      await connect();
    }
    setIsLiveChatActive(true);
  };

  const handleStopLiveChat = () => {
    console.log('[ChatPage] Stopping live chat...');
    setIsLiveChatActive(false);
    if (isRecording) {
      stopRecording();
    }
    disconnect();
    setAudioQueue([]);
  };

  const handleReset = () => {
    console.log('[ChatPage] Resetting...');
    setIsLiveChatActive(false);
    reset();
    setAudioQueue([]);
  };

  const testMicrophone = async () => {
    console.log('[ChatPage] Testing microphone access...');
    try {
      console.log('Secure context:', window.isSecureContext);
      console.log('getUserMedia available:', !!navigator.mediaDevices?.getUserMedia);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone test successful:', stream);
      stream.getTracks().forEach(track => track.stop());
      alert('Microphone test successful!');
    } catch (error) {
      console.error('Microphone test failed:', error);
      alert(`Microphone test failed: ${(error as Error).message}`);
    }
  };

  const testAudioOutput = async () => {
    console.log('[ChatPage] Testing audio output...');
    try {
      // Create a simple test tone
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5); // Play for 0.5 seconds
      
      console.log('Audio output test completed');
      alert('Audio output test completed - you should have heard a beep!');
    } catch (error) {
      console.error('Audio output test failed:', error);
      alert(`Audio output test failed: ${(error as Error).message}`);
    }
  };

  const handleSymbolClick = (word: string) => {
    setSentence((prev) => [...prev, word]);
    // Text-to-speech for immediate feedback
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const synth = window.speechSynthesis;
      synth.cancel();
      synth.speak(new SpeechSynthesisUtterance(word));
    }
  };

  const handleSendMessage = () => {
    if (sentence.length === 0) return;
    
    const messageText = sentence.join(" ");
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setSentence([]);
    
    // Speak the complete sentence
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(messageText);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendTextMessage = () => {
    if (!textInput.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: textInput,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setTextInput("");
    
    // Speak the message
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(textInput);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendTextMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="h-screen flex flex-col">
        {/* Header with connection status */}
        <div className="bg-slate-800/50 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`
              w-3 h-3 rounded-full 
              ${connectionState === 'connected' ? 'bg-green-500' : 
                connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                connectionState === 'error' ? 'bg-red-500' : 'bg-gray-500'}
            `} />
            <span className="text-sm text-gray-300 capitalize">
              {isLiveChatActive ? 'Live Chat Active' : connectionState}
            </span>
            
            {/* Toggle Symbols Button */}
            <button
              onClick={() => setShowSymbols(!showSymbols)}
              className="px-3 py-1 rounded text-sm bg-slate-600 hover:bg-slate-500 text-white"
            >
              {showSymbols ? 'Hide Symbols' : 'Show Symbols'}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Test buttons */}
            <button
              onClick={testMicrophone}
              className="px-3 py-1 rounded text-xs bg-purple-600 hover:bg-purple-500 text-white"
            >
              Test Mic
            </button>
            
            <button
              onClick={testAudioOutput}
              className="px-3 py-1 rounded text-xs bg-purple-600 hover:bg-purple-500 text-white"
            >
              Test Audio
            </button>
            
            {/* Connection toggle - only show if not in live chat */}
            {!isLiveChatActive && (
              <button
                onClick={handleConnect}
                disabled={connectionState === 'connecting'}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${connectionState === 'connected' 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }
                  ${connectionState === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {connectionState === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-grow flex overflow-hidden">
          {/* Left side - Avatar and Controls */}
          <div className="w-1/3 flex flex-col items-center justify-center space-y-4 p-4">
            <PigletAvatar isConnected={isConnected} isRecording={isLiveChatActive && isRecording} />
            
            {/* Audio Level Indicator */}
            {isLiveChatActive && isRecording && (
              <div className="flex flex-col items-center space-y-2">
                <div className="text-xs text-gray-400">Audio Level</div>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-100"
                    style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {audioLevel > 0.01 ? '🎤 Speaking...' : '🔇 Listening...'}
                </div>
              </div>
            )}
            
            {/* Mic Controls */}
            <MicControls 
              onReset={handleReset}
              onStartLiveChat={handleStartLiveChat}
              onStopLiveChat={handleStopLiveChat}
              isLiveChatActive={isLiveChatActive}
              isConnected={isConnected}
              isRecording={isRecording}
            />
          </div>

          {/* Center - Message History */}
          <div className="flex-grow flex flex-col p-4">
            <div className="flex-grow bg-slate-700/30 rounded-lg p-4 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Text input area */}
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-grow p-3 rounded-lg bg-slate-600/50 border border-slate-500 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              />
              <button
                onClick={handleSendTextMessage}
                disabled={!textInput.trim()}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>

          {/* Right side - Symbol Grid (if visible) */}
          {showSymbols && (
            <div className="w-1/3 flex flex-col p-4">
              <div className="bg-slate-700/30 rounded-lg p-4 flex-grow flex flex-col">
                {/* Search */}
                <input
                  type="search"
                  placeholder="Search symbols..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-2 rounded-md bg-slate-600/50 border border-slate-500 focus:ring-purple-500 focus:border-purple-500 mb-4"
                />
                
                {/* Category tabs */}
                <div className="flex space-x-1 mb-4">
                  {Object.keys(symbolCategories).map((category) => (
                    <button
                      key={category}
                      onClick={() => setCurrentCategory(category)}
                      className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                        currentCategory === category
                          ? "bg-purple-600 text-white"
                          : "bg-slate-600/50 hover:bg-slate-500/50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Symbol grid */}
                <div className="flex-grow overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {filteredSymbols.map((symbol) => (
                      <button
                        key={symbol.id}
                        onClick={() => handleSymbolClick(symbol.label)}
                        className="aspect-square bg-slate-600/50 hover:bg-slate-500/50 p-2 rounded-lg shadow flex flex-col items-center justify-center transition-colors"
                        aria-label={`word ${symbol.label}`}
                      >
                        <img 
                          src={symbol.imgSrc} 
                          alt={symbol.label}
                          className="w-12 h-12 mb-1 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <span className="text-xs text-center">{symbol.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sentence building */}
        <div className="bg-slate-700/30 p-4">
          <div className="bg-slate-600/50 p-3 rounded-md min-h-[3rem] flex items-center">
            <div className="flex-grow flex flex-wrap gap-1">
              {sentence.map((word, idx) => (
                <span
                  key={`${word}-${idx}`}
                  className="bg-slate-500/70 px-2 py-1 rounded text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
            {sentence.length > 0 && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleSendMessage}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm font-medium"
                >
                  Send
                </button>
                <button
                  onClick={() => setSentence([])}
                  className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden audio element for playing responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
} 