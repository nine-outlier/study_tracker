import React, { useState, useEffect } from 'react';
import { StaticStyles, SwingLights } from './EncounterAssets.jsx';

const ReaperVisuals = React.memo(({ stage }) => (
  <>
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`} />
    {stage >= 2 && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-gray-400 opacity-50 animate-ash" 
                  style={{ 
                      left: `${Math.random() * 100}%`, 
                      top: `-${Math.random() * 20}%`,
                      animationDelay: `${Math.random() * 4}s`,
                      animationDuration: `${3 + Math.random() * 3}s`
                  }} 
            />
          ))}
      </div>
    )}
    {stage >= 3 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vh] h-[60vh] opacity-30 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <path d="M100 20 Q 150 10 180 60 Q 150 40 120 50 L 100 180" fill="none" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
                <path d="M100 20 Q 150 10 180 60 L 170 70 Q 140 30 100 30 Z" fill="#cbd5e1" />
            </svg>
        </div>
    )}
  </>
));

const REAPER_ITEMS = [
    { id: 'DEATHS_OBOL', icon: '💀', title: 'Death\'s Obol', desc: 'Survive the next death blow. (One use)' },
    { id: 'GRIM_PASSAGE', icon: '🎫', title: 'Grim Passage', desc: 'Escape your next Devil encounter for free.' },
    { id: 'SOUL_KEEPER', icon: '⚱️', title: 'Soul Keeper', desc: 'Multiplier protection for 15 rounds.' }
];

export const Reaper = ({ onAccept, currentScore }) => {
  const [stage, setStage] = useState(0);
  const cost = Math.floor(currentScore * 0.25);
  const [availableItems] = useState(() => {
      const shuffled = [...REAPER_ITEMS].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2);
  });
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2500);
    const t2 = setTimeout(() => setStage(2), 2600);
    const t3 = setTimeout(() => setStage(3), 4500); 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const bgClass = stage < 2 ? 'bg-black' : 'bg-neutral-950/95';
  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center backdrop-blur-xl font-mono overflow-hidden transition-colors duration-[2000ms] ${bgClass}`}>
      <StaticStyles />
      <SwingLights color1="rgba(148,163,184,0.9)" color2="rgba(203,213,225,0.9)" color3="rgba(148,163,184,0.9)" color4="rgba(203,213,225,0.9)" opacityClass={stage < 2 ? 'opacity-100' : 'opacity-0'} />
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <ReaperVisuals stage={stage} />
            <div className="max-w-6xl w-full px-6 relative z-10 text-center flex flex-col items-center">
                <div className="flex flex-col items-center">
                    <div className={`flex flex-col items-center transition-all duration-300 ${stage === 1 ? 'blur-xl scale-125 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
                        <p className={`font-bold tracking-[0.5em] mb-2 transition-all duration-300 ${stage < 2 ? 'opacity-0 h-0 text-sm' : 'opacity-80 h-auto text-slate-400 text-sm md:text-base'}`}>THE</p>
                        <h1 className={`font-black tracking-tighter transition-all duration-[1500ms] leading-none text-center ${stage < 2 ? 'text-4xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-slate-200 drop-shadow-[0_0_30px_rgba(148,163,184,0.8)] opacity-100'} ${stage < 2 ? '' : stage === 2 ? 'text-[22vw]' : 'text-7xl md:text-9xl'}`}>
                            {stage < 2 ? <span className="block whitespace-nowrap leading-tight">HIGH STAKES<br/>ENCOUNTER</span> : "REAPER"}
                        </h1>
                    </div>
                </div>
                <div className={`overflow-hidden transition-all duration-[1000ms] ease-out w-full ${stage < 3 ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
                    <div className="space-y-8 mb-12 pt-8">
                        <p className="text-xl text-slate-400 font-light">"Death comes for all. Pay the toll to delay it..."</p>
                        <p className="text-sm font-mono text-red-400 uppercase tracking-widest">
                            Toll Cost: <span className="text-white font-bold">{new Intl.NumberFormat('en-US').format(cost)}</span> Points (25%)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                            {availableItems.map((item) => (
                                <button key={item.id} onClick={() => onAccept(item.id)} className="group relative bg-neutral-900 border border-slate-700 rounded-xl p-6 hover:bg-neutral-800 transition-all hover:scale-105 hover:border-slate-400 flex flex-col items-center gap-4 text-center">
                                    <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300">{item.icon}</div>
                                    <h3 className="text-xl font-bold text-white uppercase">{item.title}</h3>
                                    <p className="text-xs text-slate-400">{item.desc}</p>
                                    <div className="mt-4 px-4 py-2 bg-slate-800 rounded text-xs text-slate-300 font-bold group-hover:bg-slate-700 group-hover:text-white transition-colors">
                                        PAY & ACCEPT
                                    </div>
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-xl"/>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};