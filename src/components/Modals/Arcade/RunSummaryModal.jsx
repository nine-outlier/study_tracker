import React from 'react';

const RunSummaryModal = ({ score, round, highScore, onRestart, onExit }) => {
  return (
    <div className="text-center z-50 max-w-md w-full bg-slate-900/90 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl">
      <h2 className="text-red-500 font-black text-4xl mb-2 tracking-tight">GAME OVER</h2>
      <p className="text-slate-400 text-sm uppercase tracking-widest mb-8">Session Terminated</p>

      <div className="flex justify-between items-end mb-2">
          <span className="text-slate-500 text-xs font-bold uppercase">Final Score</span>
          <span className="text-3xl font-mono font-bold text-white">{new Intl.NumberFormat('en-US').format(score)}</span>
      </div>
      <div className="w-full h-px bg-slate-800 mb-4" />
      
      <div className="flex justify-between items-center mb-8 text-sm">
          <span className="text-slate-400">Rounds Survived</span>
          <span className="text-cyan-400 font-bold">{round}</span>
      </div>

      {/* High Score Badge */}
      {score > highScore && (
          <div className="mb-8 py-2 px-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-xs font-bold uppercase animate-pulse">
              New High Score!
          </div>
      )}

      <div className="flex gap-3">
        <button 
            onClick={onExit}
            className="flex-1 py-3 rounded border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors font-bold text-sm"
        >
            EXIT
        </button>
        <button 
            onClick={onRestart}
            className="flex-1 py-3 rounded bg-cyan-600 text-white hover:bg-cyan-500 transition-colors font-bold text-sm shadow-lg shadow-cyan-900/20"
        >
            RETRY
        </button>
      </div>
    </div>
  );
};

export default RunSummaryModal;