import React from 'react';

// Props: unlocked = { red: boolean, gold: boolean, legend: boolean }
const ArcadeTrophiesStrip = ({ unlocked = { red: false, gold: false, legend: false } }) => {
  
  const TrophyIcon = ({ color, active, label }) => (
    <div className={`flex flex-col items-center group ${active ? 'opacity-100' : 'opacity-30 grayscale'}`}>
       <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-300 
            ${active ? `border-${color}-500 bg-${color}-500/10 shadow-[0_0_15px_var(--shadow-color)]` : 'border-slate-700 bg-slate-900'}`}
            style={{ '--shadow-color': active ? (color === 'yellow' ? '#eab308' : color === 'red' ? '#ef4444' : '#a855f7') : 'transparent' }}
       >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
               className={`w-6 h-6 ${active ? `text-${color}-400` : 'text-slate-500'}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 114.5 0v1.5a2.25 2.25 0 01-4.5 0zm-7 0V5.625a2.25 2.25 0 00-4.5 0v1.5a2.25 2.25 0 004.5 0z" />
          </svg>
       </div>
       <span className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${active ? `text-${color}-400` : 'text-slate-600'}`}>
           {label}
       </span>
    </div>
  );

  return (
    <div className="flex justify-center space-x-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800 inline-flex backdrop-blur-sm">
      <TrophyIcon color="red" active={unlocked.red} label="Red" />
      <TrophyIcon color="yellow" active={unlocked.gold} label="Gold" />
      <TrophyIcon color="purple" active={unlocked.legend} label="Legend" />
    </div>
  );
};

export default ArcadeTrophiesStrip;