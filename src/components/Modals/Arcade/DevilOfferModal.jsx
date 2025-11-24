import React from 'react';

const DevilOfferModal = ({ onAccept, onReject, currentScore }) => {
  // Calculate the cost (10%)
  const cost = Math.floor(currentScore * 0.1);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-red-950/90 backdrop-blur-xl animate-fadeIn font-mono">
      
      {/* Ambient Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="max-w-3xl w-full px-6 relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-10">
            <h1 className="text-7xl md:text-9xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] opacity-90">
                DEVIL
            </h1>
            <p className="text-red-200/60 text-lg uppercase tracking-[0.5em] -mt-2">
                High Stakes Encounter
            </p>
        </div>

        {/* The Deal */}
        <div className="mb-12 space-y-6">
            <p className="text-2xl text-white font-light">
                "Sacrifice <span className="text-red-500 font-bold border-b border-red-500">{new Intl.NumberFormat('en-US').format(cost)}</span> points..."
            </p>
            <div className="flex items-center justify-center gap-8 text-sm md:text-base">
                <div className="text-green-400">
                    <span className="block text-4xl font-bold mb-1">50%</span>
                    Huge Reward
                </div>
                <div className="h-12 w-px bg-white/10"></div>
                <div className="text-red-500">
                    <span className="block text-4xl font-bold mb-1">50%</span>
                    Instant Death
                </div>
            </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button
                onClick={onReject}
                className="px-8 py-4 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-white hover:bg-white/5 transition-all uppercase tracking-widest text-sm font-bold"
            >
                Refuse & Leave
            </button>

            <button
                onClick={onAccept}
                className="group relative px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-full font-black text-xl tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_50px_rgba(220,38,38,0.4)] overflow-hidden"
            >
                <span className="relative z-10">Accept Deal</span>
                {/* Glitch effect on hover */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
        </div>
        
        <p className="mt-8 text-xs text-red-900/50 uppercase">
            By accepting, you waive all rights to your current run.
        </p>
      </div>
    </div>
  );
};

export default DevilOfferModal;