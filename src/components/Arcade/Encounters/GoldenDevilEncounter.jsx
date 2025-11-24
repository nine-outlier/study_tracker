import React from 'react';

const GoldenDevilEncounter = ({ onChoice }) => {
  return (
    <div className="text-center z-50 max-w-3xl w-full px-6">
       <div className="relative mb-8">
           <div className="w-48 h-48 mx-auto bg-yellow-500 rounded-full blur-[80px] opacity-40 absolute top-0 left-1/2 -translate-x-1/2"></div>
           <h1 className="relative text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-tighter drop-shadow-sm animate-pulse">
               GOLDEN OPPORTUNITY
           </h1>
       </div>
       
       <p className="text-yellow-100/80 text-xl mb-12 font-light">
           A rare entity appears. It offers <span className="text-yellow-400 font-bold">TRIPLE</span> your entire fortune.
       </p>
       
       <div className="flex flex-col items-center gap-6">
           <button 
               onClick={() => onChoice('ACCEPT_GOLD')}
               className="w-full max-w-md py-6 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black text-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.4)] border border-yellow-300"
           >
               TRIPLE OR NOTHING
               <span className="block text-xs font-medium opacity-70 mt-1">70% Chance of Instant Death</span>
           </button>

           <button 
               onClick={() => onChoice('REJECT')}
               className="text-slate-500 hover:text-white text-sm uppercase tracking-widest transition-colors"
           >
               Decline & Continue Safely
           </button>
       </div>
    </div>
  );
};

export default GoldenDevilEncounter;