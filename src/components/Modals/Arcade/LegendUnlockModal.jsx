import React, { useEffect } from 'react';

const LegendUnlockModal = ({ onContinue, score }) => {
  
  // Trigger confetti or sound here if you have a sound engine
  useEffect(() => {
      // Placeholder for "Legend" sound effect
  }, []);

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950 overflow-hidden">
      
      {/* Radiant Background */}
      <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-[100px] animate-spin-slow" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        
        {/* Trophy Icon */}
        <div className="mb-8 animate-bounce-slight">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 mx-auto text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.348v.262zm13.668 0c.668.102 1.337.219 2.006.348a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294v-.262z" clipRule="evenodd" />
            </svg>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 mb-4 tracking-tighter">
            LEGENDARY
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 font-light tracking-wide mb-8">
            You have ascended beyond the system.
        </p>

        <div className="inline-block bg-slate-900/80 border border-slate-700 rounded-xl px-8 py-4 mb-12">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Final Score Reached</p>
            <p className="text-4xl font-mono font-bold text-white">{new Intl.NumberFormat('en-US').format(score)}</p>
        </div>

        <div>
            <button 
                onClick={onContinue}
                className="px-12 py-4 bg-white text-slate-900 font-black text-lg tracking-widest uppercase rounded-full hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)]"
            >
                Continue into Infinity
            </button>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 20s linear infinite; }
        .animate-bounce-slight { animation: bounce 3s infinite ease-in-out; }
        @keyframes spin { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LegendUnlockModal;