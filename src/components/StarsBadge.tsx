"use client";

import React from 'react';

interface StarsBadgeProps {
  stars: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const StarsBadge: React.FC<StarsBadgeProps> = ({ 
  stars, 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs',
      star: 'text-sm',
      number: 'text-xs font-medium'
    },
    md: {
      container: 'px-3 py-2 text-sm',
      star: 'text-lg',
      number: 'text-sm font-semibold'
    },
    lg: {
      container: 'px-4 py-3 text-base',
      star: 'text-xl',
      number: 'text-lg font-bold'
    }
  };

  // Get appropriate styling based on star count
  const getStarStyling = (count: number) => {
    if (count === 0) {
      return {
        bg: 'bg-slate-700/50',
        border: 'border-slate-600',
        text: 'text-slate-400',
        star: '☆' // Empty star
      };
    } else if (count < 5) {
      return {
        bg: 'bg-yellow-900/30',
        border: 'border-yellow-600/50',
        text: 'text-yellow-400',
        star: '⭐'
      };
    } else if (count < 10) {
      return {
        bg: 'bg-orange-900/30',
        border: 'border-orange-600/50',
        text: 'text-orange-400',
        star: '⭐'
      };
    } else {
      return {
        bg: 'bg-purple-900/30',
        border: 'border-purple-600/50',
        text: 'text-purple-400',
        star: '⭐'
      };
    }
  };

  const styling = getStarStyling(stars);
  const config = sizeConfig[size];

  // Render different variants
  if (variant === 'compact') {
    return (
      <span className={`
        inline-flex items-center gap-1 rounded-full border
        ${styling.bg} ${styling.border} ${styling.text}
        ${config.container} ${className}
      `}>
        <span className={config.star}>{styling.star}</span>
        <span className={config.number}>{stars}</span>
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`
        inline-flex items-center gap-2 rounded-lg border
        ${styling.bg} ${styling.border} ${styling.text}
        ${config.container} ${className}
      `}>
        <span className={config.star}>{styling.star}</span>
        <div className="flex flex-col">
          <span className={config.number}>{stars}</span>
          <span className="text-xs opacity-75">
            {stars === 1 ? 'star' : 'stars'} earned
          </span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`
      inline-flex items-center gap-2 rounded-lg border
      ${styling.bg} ${styling.border} ${styling.text}
      ${config.container} ${className}
    `}>
      <span className={config.star}>{styling.star}</span>
      <span className={config.number}>
        {stars} {stars === 1 ? 'star' : 'stars'}
      </span>
    </div>
  );
};

export default StarsBadge; 