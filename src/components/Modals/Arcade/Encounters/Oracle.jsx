import React, { useState, useEffect } from 'react';
import { StaticStyles, SwingLights } from './EncounterAssets.jsx';

const OracleVisuals = React.memo(({ stage }) => (
  <>
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`} />
    {stage >= 3 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] opacity-20 pointer-events-none animate-pulse">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-300">
                <path d="M50 20C30 20 10 50 10 50C10 50 30 80 50 80C70 80 90 50 90 50C90 50 70 20 50 20ZM50 70C38.95 70 30 61.05 30 50C30 38.95 38.95 30 50 30C61.05 30 70 38.95 70 50C70 61.05 61.05 70 50 70ZM50 40C44.48 40 40 44.48 40 50C40 55.52 44.48 60 50 60C55.52 60 60 55.52 60 50C60 44.48 55.52 40 50 40Z" />
            </svg>
        </div>
    )}
  </>
));

export const Oracle = ({ onAccept }) => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2500);
    const t2 = setTimeout(() => setStage(2), 2600);
    const t3 = setTimeout(() => setStage(3), 4500); 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const bgClass = stage < 2 ? 'bg-black' : 'bg-emerald-950/95';
  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center backdrop-blur-xl font-mono overflow-hidden transition-colors duration-[2000ms] ${bgClass}`}>
      <StaticStyles />
      <SwingLights 
        color1="rgba(16,185,129,0.9)" color2="rgba(52,211,153,0.9)" color3="rgba(52,211,153,0.9)" color4="rgba(16,185,129,0.9)"
        opacityClass={stage < 2 ? 'opacity-100' : 'opacity-0'} 
      />
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <OracleVisuals stage={stage} />
            <div className="max-w-6xl w-full px-6 relative z-10 text-center flex flex-col items-center">
                <div className="flex flex-col items-center">
                    <div className={`flex flex-col items-center transition-all duration-300 ${stage === 1 ? 'blur-xl scale-125 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
                        <p className={`font-bold tracking-[0.5em] mb-2 transition-all duration-300 ${stage < 2 ? 'opacity-0 h-0 text-sm' : 'opacity-80 h-auto text-emerald-300 text-sm md:text-base'}`}>THE</p>
                        <h1 className={`font-black tracking-tighter transition-all duration-[1500ms] leading-none text-center ${stage < 2 ? 'text-4xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.8)] opacity-100'} ${stage < 2 ? '' : stage === 2 ? 'text-[22vw]' : 'text-7xl md:text-9xl'}`}>
                            {stage < 2 ? <span className="block whitespace-nowrap leading-tight">HIGH STAKES<br/>ENCOUNTER</span> : "ORACLE"}
                        </h1>
                    </div>
                </div>
                <div className={`overflow-hidden transition-all duration-[1000ms] ease-out w-full ${stage < 3 ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
                    <div className="space-y-8 mb-12 pt-8">
                        <p className="text-xl text-emerald-200 font-light italic">"I see two paths before you. Choose your timeline..."</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                            <button onClick={() => onAccept('FUTURE_A')} className="group relative bg-slate-900/80 border border-red-500/30 rounded-xl p-6 hover:bg-slate-800 transition-all hover:scale-[1.02] hover:border-red-500 flex flex-col gap-4 text-left">
                                <h3 className="text-2xl font-black text-red-400 uppercase tracking-widest border-b border-red-500/30 pb-2">Future A</h3>
                                <div className="space-y-2 text-sm font-mono text-slate-300">
                                    <div className="flex justify-between"><span className="text-red-400">Devil Chance</span><span>40%</span></div>
                                    <div className="flex justify-between"><span className="text-yellow-400">Golden Variant</span><span>15%</span></div>
                                    <div className="flex justify-between"><span>Difficulty</span><span className="text-red-400">+40% Speed</span></div>
                                    <div className="mt-4 p-2 bg-red-950/50 rounded text-center text-red-200 text-xs border border-red-900">
                                        Rounds 6-9: 1.5x Score Multiplier
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">Select ➔</div>
                            </button>
                            <button onClick={() => onAccept('FUTURE_B')} className="group relative bg-slate-900/80 border border-cyan-500/30 rounded-xl p-6 hover:bg-slate-800 transition-all hover:scale-[1.02] hover:border-cyan-500 flex flex-col gap-4 text-left">
                                <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-500/30 pb-2">Future B</h3>
                                <div className="space-y-2 text-sm font-mono text-slate-300">
                                    <div className="flex justify-between"><span className="text-cyan-400">Angel Chance</span><span>25%</span></div>
                                    <div className="flex justify-between"><span className="text-orange-400">Blacksmith</span><span>20%</span></div>
                                    <div className="flex justify-between"><span>Difficulty</span><span className="text-cyan-400">Standard</span></div>
                                    <div className="mt-4 p-2 bg-cyan-950/50 rounded text-center text-cyan-200 text-xs border border-cyan-900">
                                        Safer Path (No Multiplier Bonus)
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity">Select ➔</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};