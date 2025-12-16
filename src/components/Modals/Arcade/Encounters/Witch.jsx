import React, { useState, useEffect } from 'react';
import { StaticStyles, SwingLights } from './EncounterAssets.jsx';

const WitchVisuals = React.memo(({ stage }) => (
  <>
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`} />
    {stage >= 2 && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="absolute w-4 h-4 rounded-full border-2 border-violet-400/50 animate-bubble"
                 style={{ 
                     left: `${40 + Math.random() * 20}%`, 
                     bottom: '10%',
                     animationDelay: `${Math.random() * 3}s`
                 }} 
            />
          ))}
      </div>
    )}
    {stage >= 3 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50vh] h-[40vh] opacity-90 pointer-events-none">
            <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl animate-rise-from-bottom">
               <defs>
                 <linearGradient id="cauldronGradWitch" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="50%" stopColor="#4c1d95" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                 </linearGradient>
                 <linearGradient id="potionGradWitch" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#7c3aed" />
                 </linearGradient>
               </defs>
               <ellipse cx="100" cy="30" rx="80" ry="15" fill="#5b21b6" stroke="#4c1d95" strokeWidth="2" />
               <ellipse cx="100" cy="30" rx="70" ry="10" fill="url(#potionGradWitch)" className="animate-pulse" />
               <path d="M 20 30 Q 0 80 20 130 Q 100 160 180 130 Q 200 80 180 30" fill="url(#cauldronGradWitch)" stroke="#4c1d95" strokeWidth="2" />
               <path d="M 40 130 L 30 150" stroke="#1e1b4b" strokeWidth="8" strokeLinecap="round" />
               <path d="M 160 130 L 170 150" stroke="#1e1b4b" strokeWidth="8" strokeLinecap="round" />
            </svg>
        </div>
    )}
  </>
));

export const Witch = ({ onAccept }) => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2500);
    const t2 = setTimeout(() => setStage(2), 2600);
    const t3 = setTimeout(() => setStage(3), 4500); 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const bgClass = stage < 2 ? 'bg-black' : 'bg-violet-950/95';
  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center backdrop-blur-xl font-mono overflow-hidden transition-colors duration-[2000ms] ${bgClass}`}>
      <StaticStyles />
      <SwingLights 
        color1="rgba(139,92,246,0.9)" color2="rgba(167,139,250,0.9)" color3="rgba(167,139,250,0.9)" color4="rgba(139,92,246,0.9)"
        opacityClass={stage < 2 ? 'opacity-100' : 'opacity-0'} 
      />
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <WitchVisuals stage={stage} />
            <div className="max-w-6xl w-full px-6 relative z-10 text-center flex flex-col items-center">
                <div className="flex flex-col items-center">
                    <div className={`flex flex-col items-center transition-all duration-300 ${stage === 1 ? 'blur-xl scale-125 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
                        <p className={`font-bold tracking-[0.5em] mb-2 transition-all duration-300 ${stage < 2 ? 'opacity-0 h-0 text-sm' : 'opacity-80 h-auto text-violet-300 text-sm md:text-base'}`}>THE</p>
                        <h1 className={`font-black tracking-tighter transition-all duration-[1500ms] leading-none text-center ${stage < 2 ? 'text-4xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-violet-400 drop-shadow-[0_0_30px_rgba(139,92,246,0.8)] opacity-100'} ${stage < 2 ? '' : stage === 2 ? 'text-[22vw]' : 'text-7xl md:text-9xl'}`}>
                            {stage < 2 ? <span className="block whitespace-nowrap leading-tight">HIGH STAKES<br/>ENCOUNTER</span> : "WITCH"}
                        </h1>
                    </div>
                </div>
                <div className={`overflow-hidden transition-all duration-[1000ms] ease-out w-full ${stage < 3 ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
                    <div className="space-y-8 mb-12 pt-8">
                        <p className="text-xl text-violet-200 font-light italic">"The alchemy of souls... What will you transmute?"</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                            <button onClick={() => onAccept('BLOOD_ALCHEMY')} className="group relative bg-slate-900/80 border border-red-900 rounded-xl p-6 hover:bg-slate-800 transition-all hover:scale-[1.02] hover:border-red-500 flex flex-col gap-4 text-left">
                                <div className="flex items-center gap-3 border-b border-red-900/50 pb-2">
                                    <span className="text-2xl">🩸</span>
                                    <h3 className="text-xl font-black text-red-400 uppercase tracking-widest">Blood Alchemy</h3>
                                </div>
                                <div className="space-y-4 text-sm font-mono mt-2">
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase mb-1">Immediate Cost</p>
                                        <p className="text-red-500 font-bold text-lg">PERMANENTLY LOSE 1 HEART</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase mb-1">Reward</p>
                                        <p className="text-violet-400 font-bold italic">"Your fortune shall multiply (1.33x)..."</p>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">Transmute Life</div>
                            </button>
                            <button onClick={() => onAccept('ESSENCE_DISTILLATION')} className="group relative bg-slate-900/80 border border-yellow-900 rounded-xl p-6 hover:bg-slate-800 transition-all hover:scale-[1.02] hover:border-yellow-500 flex flex-col gap-4 text-left">
                                <div className="flex items-center gap-3 border-b border-yellow-900/50 pb-2">
                                    <span className="text-2xl">⚗️</span>
                                    <h3 className="text-xl font-black text-yellow-400 uppercase tracking-widest">Essence Distillation</h3>
                                </div>
                                <div className="space-y-4 text-sm font-mono mt-2">
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase mb-1">Immediate Cost</p>
                                        <p className="text-yellow-500 font-bold text-lg">MULTIPLIER HALVED</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase mb-1">Reward</p>
                                        <p className="text-violet-400 font-bold italic">"Vitality shall return to you (+1 Heart)..."</p>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-yellow-500 transition-opacity">Transmute Power</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};