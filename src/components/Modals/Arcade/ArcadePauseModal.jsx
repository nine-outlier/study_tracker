import React from 'react';

const ArcadePauseModal = ({ onResume, onQuit, score, round }) => {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fadeIn">
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
          <div className="space-y-3">
            <button 
              onClick={onResume}
              className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-900/20"
            >
              Resume Game
            </button>
            
            <button 
              onClick={onQuit}
              className="w-full py-4 rounded-xl border border-slate-700 hover:border-red-500 hover:text-red-400 text-slate-500 font-bold tracking-widest uppercase transition-all"
            >
              Quit Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcadePauseModal;