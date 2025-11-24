import React from 'react';

const ArcadeEntryButton = ({ onClick }) => {
  return (
    <button 
        onClick={onClick}
        className="relative group px-6 py-2 overflow-hidden rounded-full bg-slate-900 border border-slate-700 hover:border-cyan-500 transition-all duration-300"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-100 tracking-widest uppercase transition-colors">
                Arcade Mode
            </span>
        </div>
    </button>
  );
};

export default ArcadeEntryButton;