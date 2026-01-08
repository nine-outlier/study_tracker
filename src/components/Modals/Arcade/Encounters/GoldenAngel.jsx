import React, { useState, useEffect } from 'react';
import { StaticStyles, SwingLights } from './EncounterAssets.jsx';

// --- VISUALS ---
const GoldenAngelVisuals = React.memo(({ stage, isSelecting }) => (
  <>
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`} />
    {stage >= 2 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-scan shadow-[0_0_20px_rgba(250,204,21,0.8)]"></div>
        </div>
    )}
    {stage >= 3 && (
      <>
        <div className={`absolute bottom-0 left-0 md:left-[5%] w-[45vw] md:w-[35vw] h-[70vh] origin-bottom animate-rise-from-bottom pointer-events-none z-0 mix-blend-screen opacity-90 ${isSelecting ? 'animate-gold-burst' : ''}`} style={{ animationDelay: '0.2s' }}>
          <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wingGradientGold" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2a1a00" />
                <stop offset="50%" stopColor="#b4860b" />
                <stop offset="100%" stopColor="#ffd700" />
              </linearGradient>
            </defs>
            <path d="M 20 600 C 80 450 200 300 380 50 C 400 20 350 0 320 20 C 200 150 150 300 100 450 C 80 500 50 550 20 600 Z M 380 50 Q 320 150 200 300 Q 150 400 100 450 M 320 80 Q 250 200 150 350 M 260 140 Q 190 250 120 400" fill="url(#wingGradientGold)" stroke="rgba(255,215,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className={`absolute bottom-0 right-0 md:right-[5%] w-[45vw] md:w-[35vw] h-[70vh] origin-bottom animate-rise-from-bottom pointer-events-none z-0 mix-blend-screen opacity-90 ${isSelecting ? 'animate-gold-burst' : ''}`} style={{ animationDelay: '0.2s' }}>
          <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M 20 600 C 80 450 200 300 380 50 C 400 20 350 0 320 20 C 200 150 150 300 100 450 C 80 500 50 550 20 600 Z M 380 50 Q 320 150 200 300 Q 150 400 100 450 M 320 80 Q 250 200 150 350 M 260 140 Q 190 250 120 400" fill="url(#wingGradientGold)" stroke="rgba(255,215,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </>
    )}
  </>
));

export const GoldenAngel = ({ onAccept }) => {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState('ENTRY');

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 1000);
    const t3 = setTimeout(() => setStage(3), 2000); 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleAccept = () => {
    if (phase !== 'ENTRY') return;
    setPhase('SELECTED');
    setTimeout(() => {
        setPhase('DONE');
        onAccept();
    }, 3000);
  };

  // Keyboard Support
  useEffect(() => {
    if (stage < 3) return;

    const handleKeyDown = (e) => {
        if (['Space', 'Enter'].includes(e.code)) {
            e.preventDefault();
            handleAccept();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, phase]);

  const bgClass = stage < 2 ? 'bg-black' : 'bg-slate-900/95';
  const lightColor = "rgba(255,215,0,0.8)";

  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center backdrop-blur-xl font-mono overflow-hidden transition-colors duration-[2000ms] ${bgClass}`}>
      <StaticStyles />
      <SwingLights color={lightColor} opacityClass={stage < 2 ? 'opacity-100' : 'opacity-0'} />

      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <GoldenAngelVisuals stage={stage} isSelecting={phase === 'SELECTED' || phase === 'DONE'} />

            <div className={`max-w-4xl w-full px-6 relative z-10 text-center flex flex-col items-center ${phase === 'SELECTED' ? 'animate-content-fade-out' : ''}`}>
                <div className="flex flex-col items-center">
                    <div className={`flex flex-col items-center transition-all duration-300 ${stage === 1 ? 'blur-xl scale-125 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
                        <div className={`flex flex-col items-center transition-all duration-300 ${stage < 2 ? 'opacity-0 h-0 -translate-y-4' : 'opacity-100 h-auto translate-y-0 mb-1'}`}>
                            <span className="font-bold tracking-[0.5em] text-yellow-500 text-xs md:text-sm">THE</span>
                            <span className="font-black tracking-[0.2em] text-yellow-300 text-xl md:text-3xl drop-shadow-md">GOLDEN</span>
                        </div>
                        <h1 className={`font-black tracking-tighter transition-all duration-[1500ms] leading-none text-center ${stage < 2 ? 'text-4xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)] opacity-100'} ${stage < 2 ? '' : stage === 2 ? 'text-[22vw]' : 'text-7xl md:text-9xl'}`}>
                            {stage < 2 ? <span className="block whitespace-nowrap leading-tight">HIGH STAKES<br/>ENCOUNTER</span> : "ANGEL"}
                        </h1>
                    </div>
                </div>

                <div className={`overflow-hidden transition-all duration-[1000ms] ease-out w-full ${stage < 3 ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
                    <div className="space-y-6 mb-12 pt-8">
                        <p className="text-2xl text-yellow-200/80 font-mono tracking-[0.3em] uppercase">God Seed Activated</p>
                        <div className="flex justify-center gap-4 text-xs font-bold text-yellow-500 mt-6">
                            <span className="px-4 py-2 border border-yellow-500/30 rounded bg-yellow-500/10 backdrop-blur">+35% LUCK</span>
                            <span className="px-4 py-2 border border-yellow-500/30 rounded bg-yellow-500/10 backdrop-blur">2X BOSS DMG</span>
                            <span className="px-4 py-2 border border-yellow-500/30 rounded bg-yellow-500/10 backdrop-blur">MAX LIVES</span>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <button 
                            onClick={handleAccept} 
                            className="group relative px-12 py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black rounded-full font-black text-xl tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_40px_rgba(234,179,8,0.5)] overflow-hidden border border-yellow-300 ring-4 ring-transparent focus:ring-yellow-200"
                        >
                            <span className="relative z-10">Accept God Seed</span>
                            <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>
                     <div className="mt-8 text-[10px] text-yellow-500/50 uppercase tracking-widest animate-pulse">
                        [PRESS SPACE TO ACCEPT]
                    </div>
                </div>
            </div>
      </div>
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none ${phase === 'SELECTED' ? 'opacity-0 animate-white-out' : ''} ${phase === 'DONE' ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};