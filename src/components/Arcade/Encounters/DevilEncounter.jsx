import React from 'react';

const DevilEncounter = ({ onChoice }) => {
  return (
    <div className="text-center z-50 max-w-2xl w-full px-6">
       <div className="relative mb-8">
           {/* Devil Icon/Avatar */}
           <div className="w-32 h-32 mx-auto bg-red-600 rounded-full blur-[60px] opacity-50 absolute top-0 left-1/2 -translate-x-1/2"></div>
           <h1 className="relative text-6xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
               DEVIL'S DEAL
           </h1>
       </div>
       
       <p className="text-slate-300 text-lg mb-12 leading-relaxed">
           "I offer you power, but the cost is <span className="text-red-400 font-bold">10%</span> of your soul.<br/>
           Accept my wager, and you may find glory... or death."
       </p>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Safe Option */}
           <button 
               onClick={() => onChoice('REJECT')}
               className="group p-6 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/80 transition-all"
           >
               <div className="text-slate-400 font-bold tracking-widest text-sm mb-2">REJECT</div>
               <div className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                   Walk Away
               </div>
               <div className="text-xs text-slate-500 mt-2">Keep current score. No risk.</div>
           </button>

           {/* Risky Option */}
           <button 
               onClick={() => onChoice('ACCEPT')}
               className="group p-6 rounded-xl border border-red-900 hover:border-red-500 bg-red-950/30 hover:bg-red-900/50 transition-all"
           >
               <div className="text-red-500 font-bold tracking-widest text-sm mb-2">ACCEPT</div>
               <div className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                   Take the Gamble
               </div>
               <div className="text-xs text-red-400/60 mt-2">
                   Lose 10% Score immediately.<br/>
                   Then: 50% Huge Reward / 50% DEATH.
               </div>
           </button>
       </div>
    </div>
  );
};

export default DevilEncounter;