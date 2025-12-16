import React from 'react';

// --- PATH DEFINITIONS ---

// 1. Classic Solid Cup (Standard)
const solidCupPath = "M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.348v.262zm13.668 0c.668.102 1.337.219 2.006.348a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294v-.262z";

// 2. Sharp "W" Crown
const sharpCrownPath = "M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z";

// 3. Simple Outline Cup (Legendary)
const simpleOutlineCupPath = "M18.6 15h-4.3c-.63-2.1-2.4-3.5-4.5-3.5s-3.87 1.4-4.5 3.5h-4.3a.75.75 0 00-.75.75v1.5c0 .41.34.75.75.75h2.1v2.25a2.25 2.25 0 002.25 2.25h11.5a2.25 2.25 0 002.25-2.25V18h2.1c.41 0 .75-.34.75-.75v-1.5a.75.75 0 00-.75-.75zM12 2.25a3 3 0 00-3 3v1.5a3 3 0 006 0v-1.5a3 3 0 00-3-3z";

const getMaskStyle = (path) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path fill-rule='evenodd' clip-rule='evenodd' d='${path}'/></svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  const url = `url("data:image/svg+xml,${encoded}")`;
  
  return {
    maskImage: url, WebkitMaskImage: url,
    maskSize: 'contain', WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center', WebkitMaskPosition: 'center'
  };
};

const TrophyIcon = ({ level, style, className = "w-8 h-8" }) => {
  if (!level) return null; 

  const getShadowClass = (level) => {
    switch (level) {
      case 'LEGEND': return 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))';
      case 'GOLD': return 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))';
      case 'RED': return 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))';
      default: return '';
    }
  };

  return (
    <div className={`${className} relative flex justify-center items-center`} title={`Rank: ${level}`} style={{ filter: getShadowClass(level) }}>
      <div className="absolute -top-3 w-5 h-5 animate-bounce" style={{ ...style, ...getMaskStyle(sharpCrownPath), animationDuration: '2.5s' }} />
      <div className="w-full h-full" style={{ ...style, ...getMaskStyle(solidCupPath) }} />
    </div>
  );
};

export const LegendaryTrophyIcon = ({ style, className = "w-10 h-10" }) => {
  return (
    <div className={`${className} relative flex justify-center items-center`} style={{ filter: 'drop-shadow(0 0 15px #FBBF24)' }}>
      <div className="absolute -top-5 w-6 h-6 animate-pulse" style={{ ...style, ...getMaskStyle(sharpCrownPath) }} />
      <div className="w-full h-full" style={{ ...style, ...getMaskStyle(simpleOutlineCupPath) }} />
    </div>
  );
};

export default TrophyIcon;