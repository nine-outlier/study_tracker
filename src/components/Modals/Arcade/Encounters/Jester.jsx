import React, { useState, useEffect } from 'react';
import { StaticStyles, SwingLights } from './EncounterAssets.jsx';

const JesterVisuals = React.memo(({ stage }) => (
  <>
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`} />
    {stage >= 3 && (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] md:w-[50vw] h-[60vh] origin-bottom animate-rise-from-bottom pointer-events-none z-0 mix-blend-screen opacity-40">
          <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-xl" preserveAspectRatio="none">
            <defs>
              <linearGradient id="jesterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#4c1d95" />
                  <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
            <path d="M 250 400 L 150 400 Q 50 300 20 100 Q 10 50 0 80 Q 80 150 150 300 L 250 400 Z" fill="url(#jesterGrad)" />
            <path d="M 250 400 L 350 400 Q 450 300 480 100 Q 490 50 500 80 Q 420 150 350 300 L 250 400 Z" fill="url(#jesterGrad)" />
            <path d="M 250 400 Q 250 200 250 50 Q 230 0 270 0 Q 270 200 250 400 Z" fill="url(#jesterGrad)" opacity="0.8" />
          </svg>
      </div>
    )}
  </>
));

export const Jester = ({ onAccept }) => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2500);
    const t2 = setTimeout(() => setStage(2), 2600);
    const t3 = setTimeout(() => setStage(3), 4500); 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const bgClass = stage < 2 ? 'bg-black' : 'bg-purple-950/95';
  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center backdrop-blur-xl font-mono overflow-hidden transition-colors duration-[2000ms] ${bgClass}`}>
      <StaticStyles />
      <SwingLights color1="rgba(217,70,239,0.9)" color2="rgba(163,230,53,0.9)" color3="rgba(163,230,53,0.9)" color4="rgba(217,70,239,0.9)" opacityClass={stage < 2 ? 'opacity-100' : 'opacity-0'} />
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <JesterVisuals stage={stage} />
            <div className="max-w-4xl w-full px-6 relative z-10 text-center flex flex-col items-center">
                <div className="flex flex-col items-center">
                    <div className={`flex flex-col items-center transition-all duration-300 ${stage === 1 ? 'blur-xl scale-125 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
                        <p className={`font-bold tracking-[0.5em] mb-2 transition-all duration-300 ${stage < 2 ? 'opacity-0 h-0 text-sm' : 'opacity-80 h-auto text-fuchsia-300 text-sm md:text-base'}`}>THE</p>
                        <h1 className={`font-black tracking-tighter transition-all duration-[1500ms] leading-none text-center ${stage < 2 ? 'text-4xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-fuchsia-400 drop-shadow-[0_0_30px_rgba(217,70,239,0.8)] opacity-100'} ${stage < 2 ? '' : stage === 2 ? 'text-[22vw]' : 'text-7xl md:text-9xl'}`}>
                            {stage < 2 ? <span className="block whitespace-nowrap leading-tight">HIGH STAKES<br/>ENCOUNTER</span> : "JESTER"}
                        </h1>
                    </div>
                </div>
                <div className={`overflow-hidden transition-all duration-[1000ms] ease-out w-full ${stage < 3 ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
                    <div className="space-y-6 mb-12 pt-8">
                        <p className="text-2xl text-fuchsia-100 font-light">"Life is a gamble. Pick a crate to determine your fate..."</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                        <button onClick={() => onAccept('CRATE_1')} className="group relative w-48 h-48 md:w-64 md:h-64 bg-slate-900 border-2 border-fuchsia-500/50 rounded-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.4)] animate-wobble">
                            <span className="text-6xl mb-2">📦</span>
                            <span className="text-fuchsia-300 font-bold tracking-widest text-sm group-hover:text-lime-300">MYSTERY A</span>
                            <div className="absolute inset-0 bg-fuchsia-500/10 rounded-2xl group-hover:bg-lime-400/10 transition-colors" />
                        </button>
                        <button onClick={() => onAccept('CRATE_2')} className="group relative w-48 h-48 md:w-64 md:h-64 bg-slate-900 border-2 border-fuchsia-500/50 rounded-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.4)] animate-wobble" style={{ animationDelay: '1s' }}>
                            <span className="text-6xl mb-2">📦</span>
                            <span className="text-fuchsia-300 font-bold tracking-widest text-sm group-hover:text-lime-300">MYSTERY B</span>
                            <div className="absolute inset-0 bg-fuchsia-500/10 rounded-2xl group-hover:bg-lime-400/10 transition-colors" />
                        </button>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-widest">
                            One contains <span className="text-lime-400 font-bold">20x MULTIPLIER</span> (5 Rounds)<br/>
                            The other contains <span className="text-fuchsia-400 font-bold">INVERTED COLORS</span> (5 Rounds)
                        </p>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};