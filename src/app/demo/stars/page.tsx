"use client";

import React from 'react';
import StarsBadge from '@/components/StarsBadge';

export default function StarsBadgeDemoPage() {
  const demoData = [
    { name: 'Emma', stars: 0 },
    { name: 'Liam', stars: 1 },
    { name: 'Sophia', stars: 3 },
    { name: 'Noah', stars: 7 },
    { name: 'Olivia', stars: 12 },
    { name: 'William', stars: 25 },
  ];

  return (
    <div className="container mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">StarsBadge Component Demo</h1>
      
      {/* Basic Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Basic Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoData.map((kid) => (
            <div key={kid.name} className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">{kid.name}</h3>
              <StarsBadge stars={kid.stars} />
            </div>
          ))}
        </div>
      </section>

      {/* Size Variants */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Size Variants</h2>
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm text-slate-300 mb-2">Small</p>
              <StarsBadge stars={5} size="sm" />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">Medium (Default)</p>
              <StarsBadge stars={5} size="md" />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">Large</p>
              <StarsBadge stars={5} size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Variants */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Variants</h2>
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-sm text-slate-300 mb-2">Default</p>
              <StarsBadge stars={8} variant="default" />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">Compact</p>
              <StarsBadge stars={8} variant="compact" />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">Detailed</p>
              <StarsBadge stars={8} variant="detailed" />
            </div>
          </div>
        </div>
      </section>

      {/* Color Progression */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Color Progression</h2>
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-300 mb-2">No Stars (Gray)</p>
              <StarsBadge stars={0} />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">1-4 Stars (Yellow)</p>
              <StarsBadge stars={3} />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">5-9 Stars (Orange)</p>
              <StarsBadge stars={7} />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">10+ Stars (Purple)</p>
              <StarsBadge stars={15} />
            </div>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Usage Examples</h2>
        
        {/* In a card layout */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">In Student Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoData.slice(0, 3).map((kid) => (
              <div key={kid.name} className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{kid.name}</h4>
                  <StarsBadge stars={kid.stars} size="sm" variant="compact" />
                </div>
                <p className="text-sm text-slate-300">
                  Progress: {Math.min(100, kid.stars * 10)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* In a leaderboard */}
        <div>
          <h3 className="text-lg font-medium mb-3">Leaderboard Style</h3>
          <div className="bg-slate-700/50 rounded-lg overflow-hidden">
            {demoData
              .sort((a, b) => b.stars - a.stars)
              .map((kid, index) => (
                <div key={kid.name} className="flex items-center justify-between p-4 border-b border-slate-600 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                    <span className="font-medium">{kid.name}</span>
                  </div>
                  <StarsBadge stars={kid.stars} variant="detailed" size="sm" />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Code Examples</h2>
        <div className="bg-slate-800 p-4 rounded-lg">
          <pre className="text-sm text-slate-300 overflow-x-auto">
{`// Basic usage
<StarsBadge stars={5} />

// With size and variant
<StarsBadge stars={8} size="lg" variant="detailed" />

// Compact for tight spaces
<StarsBadge stars={12} size="sm" variant="compact" />

// With custom styling
<StarsBadge stars={3} className="ml-auto" />`}
          </pre>
        </div>
      </section>
    </div>
  );
} 