import React, { useState, useEffect } from 'react';

const ArcadePauseModal = ({ onResume, onQuit, score, round }) => {
  const [selectedIndex, setSelectedIndex] = useState(0); // 0: Resume, 1: Quit

  // Keyboard Navigation Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault(); // Prevent scrolling

      switch (e.code) {
        // Navigation (Toggle between options)
        case 'ArrowUp':
        case 'KeyW':
        case 'ArrowDown':
        case 'KeyS':
          setSelectedIndex((prev) => (prev === 0 ? 1 : 0));
          break;

        // Selection
        case 'Enter':
        case 'Space':
          if (selectedIndex === 0) onResume();
          if (selectedIndex === 1) onQuit();
          break;

        // Escape resumes the game
        case 'Escape':
          onResume();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onResume, onQuit]);

  return (
    // Added 'cursor-none' and 'select-none'
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fadeIn cursor-none select-none">
      <div className="w-full max-w-md p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl relative overflow-hidden">
        
        {/* Background Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5" 
             style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '100% 4px' }} 
        />

        <div className="text-center relative z-10">
          <h2 className="text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            PAUSED
          </h2>
          <div className="h-1 w-16 mx-auto bg-cyan-500 rounded-full mb-8" />

          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Current Score</p>
              <p className="text-2xl font-mono font-bold text-cyan-400">
                {new Intl.NumberFormat('en-US').format(score)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Round</p>
              <p className="text-2xl font-mono font-bold text-purple-400">
                {round}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            
            {/* Resume Button */}
            <div className={`relative w-full transition-all duration-200 ${selectedIndex === 0 ? 'scale-105' : 'scale-100 opacity-70'}`}>
                <div 
                  className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase shadow-lg border-2 
                    ${selectedIndex === 0 
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-900/40' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                >
                  Resume Game
                </div>
            </div>
            
            {/* Quit Button */}
            <div className={`relative w-full transition-all duration-200 ${selectedIndex === 1 ? 'scale-105' : 'scale-100 opacity-70'}`}>
                <div 
                  className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase border-2 
                    ${selectedIndex === 1 
                        ? 'bg-red-500/10 text-red-400 border-red-500 shadow-red-900/20' 
                        : 'bg-transparent text-slate-500 border-slate-800'
                    }`}
                >
                  Quit Run
                </div>
            </div>

          </div>
          
          {/* Footer Hint */}
          <div className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest">
             [WASD / ARROWS] to Navigate • [SPACE] to Select
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArcadePauseModal;