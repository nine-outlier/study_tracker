import React from 'react';

const ArcadeCountdownBar = ({ currentScore }) => {
  const START_THRESHOLD = 0;
  const END_GOAL = 5000000;

  if (currentScore < START_THRESHOLD) return null;

  const progress = Math.min(1, (currentScore - START_THRESHOLD) / (END_GOAL - START_THRESHOLD));
  const percentage = (progress * 100).toFixed(1);

  return (
    <div className="mt-2 w-64 animate-fadeIn">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest animate-pulse">
            Overdrive Sequence
        </span>
        <span className="text-[10px] text-yellow-200 font-mono">
            {percentage}%
        </span>
      </div>
      
      <div className="h-2 w-full bg-yellow-900/20 rounded-full border border-yellow-500/30 overflow-hidden">
        <div 
            className="h-full bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] relative"
            style={{ width: `${percentage}%` }}
        >
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite] transform -skew-x-12" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ArcadeCountdownBar;