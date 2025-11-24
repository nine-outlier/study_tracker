import React, { useEffect, useState } from 'react';

const GoldenAngelBanner = ({ onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
      {/* Backdrop glow */}
      <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay animate-pulse"></div>

      <div className="relative bg-gradient-to-b from-slate-900/90 to-black/90 border-y-2 border-yellow-500/50 w-full py-12 flex flex-col items-center justify-center overflow-hidden">
         
         {/* Moving light streaks */}
         <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>
         
         <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-600 tracking-tighter drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] transform scale-110 animate-bounce-slight">
            GOLDEN ANGEL
         </h1>
         
         <p className="mt-4 text-yellow-200/80 text-lg font-mono tracking-[0.3em] uppercase">
             God Seed Activated
         </p>
         
         <div className="mt-6 flex gap-4 text-xs font-bold text-yellow-500">
             <span className="px-3 py-1 border border-yellow-500/30 rounded bg-yellow-500/10">+35% LUCK</span>
             <span className="px-3 py-1 border border-yellow-500/30 rounded bg-yellow-500/10">2X BOSS DMG</span>
             <span className="px-3 py-1 border border-yellow-500/30 rounded bg-yellow-500/10">MAX LIVES</span>
         </div>
      </div>
      
      <style>{`
        @keyframes scan {
            0%, 100% { transform: translateX(-100%); opacity: 0; }
            50% { transform: translateX(100%); opacity: 1; }
        }
        .animate-bounce-slight {
            animation: bounce-slight 2s infinite ease-in-out;
        }
        @keyframes bounce-slight {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default GoldenAngelBanner;