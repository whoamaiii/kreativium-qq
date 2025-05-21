"use client"; // Add this for client-side hooks and event handlers
import React from 'react';

// Placeholder data for symbols - replace with actual data later
const symbolCategories = {
  Core: [
    { id: 's1', label: 'I', imgSrc: '/symbols/core/i.png' },
    { id: 's2', label: 'want', imgSrc: '/symbols/core/want.png' },
    { id: 's3', label: 'to', imgSrc: '/symbols/core/to.png' },
    { id: 's4', label: 'eat', imgSrc: '/symbols/core/eat.png' },
    { id: 's5', label: 'drink', imgSrc: '/symbols/core/drink.png' },
    { id: 's6', label: 'play', imgSrc: '/symbols/core/play.png' },
    { id: 's7', label: 'go', imgSrc: '/symbols/core/go.png' },
    { id: 's8', label: 'stop', imgSrc: '/symbols/core/stop.png' },
    { id: 's9', label: 'help', imgSrc: '/symbols/core/help.png' },
    { id: 's10', label: 'more', imgSrc: '/symbols/core/more.png' },
    { id: 's11', label: 'again', imgSrc: '/symbols/core/again.png' },
    { id: 's12', label: 'look', imgSrc: '/symbols/core/look.png' },
  ],
  Food: [
    { id: 'f1', label: 'Apple', imgSrc: '/symbols/food/apple.png' },
    { id: 'f2', label: 'Banana', imgSrc: '/symbols/food/banana.png' },
  ],
  // Add more categories and symbols as needed
};

// For now, we'll just display the 'Core' symbols
const currentSymbols = symbolCategories.Core; 
const selectedSentence: string[] = ['I', 'want', 'to', 'eat', 'apple']; // Example sentence

export default function AACPage() {
  const handleSpeak = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const sentenceToSpeak = selectedSentence.join(' ');
      const utterance = new SpeechSynthesisUtterance(sentenceToSpeak);
      // You can customize voice, pitch, rate here if needed
      // utterance.voice = speechSynthesis.getVoices()[0]; // Example: set voice
      speechSynthesis.speak(utterance);
    }
  };
  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem))] text-white"> {/* Adjust for header height */}
      {/* Main content area */}
      <div className="flex-grow flex p-4 gap-4">
        {/* Symbol Grid */}
        <div className="flex-grow bg-slate-700/30 p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <input
              type="search"
              placeholder="Search symbols..."
              className="w-full p-2 rounded-md bg-slate-600/50 border border-slate-500 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {currentSymbols.map((symbol) => (
              <button
                key={symbol.id}
                className="aspect-square bg-slate-600/50 hover:bg-slate-500/50 p-2 rounded-lg shadow flex flex-col items-center justify-center transition-colors"
              >
                <div className="w-16 h-16 bg-slate-500 rounded mb-1 flex items-center justify-center text-xs text-slate-300">
                  (Img) {/* Placeholder for symbol.imgSrc */}
                </div>
                <span className="text-sm text-center">{symbol.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar for Editing/Sentence */}
        <aside className="w-1/3 lg:w-1/4 bg-slate-700/30 p-4 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Edit Symbol</h2>
          {/* Placeholder for symbol editing form */}
          <div className="mb-4">
            <label htmlFor="symbol-label" className="block text-sm font-medium text-slate-300 mb-1">Label</label>
            <input type="text" id="symbol-label" defaultValue="Apple" className="w-full p-2 rounded-md bg-slate-600/50 border border-slate-500" />
          </div>
          <div className="mb-4">
            <span className="block text-sm font-medium text-slate-300 mb-1">Image</span>
            <div className="w-24 h-24 bg-slate-500 rounded flex items-center justify-center text-xs text-slate-300 mb-2">(Img)</div>
            <button className="text-sm bg-slate-600 hover:bg-slate-500 py-1 px-3 rounded">Change Image</button>
          </div>
          <div className="flex gap-2 mt-auto">
            <button className="flex-1 text-sm bg-slate-600 hover:bg-slate-500 py-2 px-3 rounded">Cancel</button>
            <button className="flex-1 text-sm bg-purple-600 hover:bg-purple-700 py-2 px-3 rounded">Save Changes</button>
          </div>
        </aside>
      </div>

      {/* Sentence construction bar & Category tabs */}
      <footer className="bg-slate-700/30 p-4 shadow-md">
        {/* Sentence display */}
        <div className="bg-slate-600/50 p-3 rounded-md mb-3 min-h-[3rem] flex items-center flex-wrap gap-1">
          {selectedSentence.map((word, index) => (
            <span key={index} className="bg-slate-500/70 px-2 py-1 rounded text-sm">
              {word}
            </span>
          ))}
          {selectedSentence.length > 0 && (
            <button onClick={handleSpeak} className="ml-auto bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded text-sm">Speak</button>
          )}
        </div>
        {/* Category tabs */}
        <div className="flex space-x-2">
          {Object.keys(symbolCategories).map((category) => (
            <button
              key={category}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                category === 'Core' ? 'bg-purple-600 text-white' : 'bg-slate-600/50 hover:bg-slate-500/50'
              }`}
            >
              {category}
            </button>
          ))}
           <button className="ml-auto py-2 px-4 rounded-md text-sm font-medium bg-slate-600/50 hover:bg-slate-500/50">Teach Mode</button>
           <button className="py-2 px-4 rounded-md text-sm font-medium bg-slate-600/50 hover:bg-slate-500/50">User Mode</button>
        </div>
      </footer>
    </div>
  );
}
