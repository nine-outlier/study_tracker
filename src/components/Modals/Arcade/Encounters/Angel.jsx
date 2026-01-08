import React, { useState, useEffect } from 'react';
import { StaticStyles, SwingLights } from './EncounterAssets.jsx';

// --- VISUALS ---
const AngelVisuals = React.memo(({ stage, isSelecting }) => (
  <>
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`} />
    {stage >= 2 && (
      <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full blur-[1px] animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-cyan-200 rounded-full blur-[2px] animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-100 rounded-full blur-[1px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white rounded-full blur-[2px] animate-float" style={{ animationDelay: '3s' }} />
      </div>
    )}
    {stage >= 3 && (
      <>
        <div className={`absolute bottom-0 left-0 md:left-[5%] w-[45vw] md:w-[35vw] h-[70vh] origin-bottom animate-rise-from-bottom pointer-events-none z-0 mix-blend-screen opacity-90 ${isSelecting ? 'animate-holy-glow' : ''}`} style={{ animationDelay: '0.2s' }}>
          <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wingGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <path d="M 20 600 C 80 450 200 300 380 50 C 400 20 350 0 320 20 C 200 150 150 300 100 450 C 80 500 50 550 20 600 Z M 380 50 Q 320 150 200 300 Q 150 400 100 450 M 320 80 Q 250 200 150 350 M 260 140 Q 190 250 120 400" fill="url(#wingGradient)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className={`absolute bottom-0 right-0 md:right-[5%] w-[45vw] md:w-[35vw] h-[70vh] origin-bottom animate-rise-from-bottom pointer-events-none z-0 mix-blend-screen opacity-90 ${isSelecting ? 'animate-holy-glow' : ''}`} style={{ animationDelay: '0.2s' }}>
          <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M 20 600 C 80 450 200 300 380 50 C 400 20 350 0 320 20 C 200 150 150 300 100 450 C 80 500 50 550 20 600 Z M 380 50 Q 320 150 200 300 Q 150 400 100 450 M 320 80 Q 250 200 150 350 M 260 140 Q 190 250 120 400" fill="url(#wingGradient)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </>
    )}
  </>
));

export const Angel = ({ onAccept, onReject }) => {
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
    if (stage < 3) return; // Only allow interaction after intro

    const handleKeyDown = (e) => {
        if (['Space', 'Enter'].includes(e.code)) {
            e.preventDefault();
            handleAccept();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, phase]);

  const bgClass = stage < 2 ? 'bg-black' : 'bg-sky-950/95';
  const lightColor = "rgba(207,250,254,0.9)";

  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center backdrop-blur-xl font-mono overflow-hidden transition-colors duration-[2000ms] ${bgClass}`}>
      <StaticStyles />
      <SwingLights color={lightColor} opacityClass={stage < 2 ? 'opacity-100' : 'opacity-0'} />

      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <AngelVisuals stage={stage} isSelecting={phase === 'SELECTED' || phase === 'DONE'} />

            <div className={`max-w-4xl w-full px-6 relative z-10 text-center flex flex-col items-center ${phase === 'SELECTED' ? 'animate-content-fade-out' : ''}`}>
                <div className="flex flex-col items-center">
                    <div className={`flex flex-col items-center transition-all duration-300 ${stage === 1 ? 'blur-xl scale-125 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
                        <p className={`font-bold tracking-[0.5em] mb-2 transition-all duration-300 ${stage < 2 ? 'opacity-0 h-0 text-sm' : 'opacity-80 h-auto text-cyan-200 text-sm md:text-base'}`}>THE</p>
                        <h1 className={`font-black tracking-tighter transition-all duration-[1500ms] leading-none text-center ${stage < 2 ? 'text-4xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] opacity-100'} ${stage < 2 ? '' : stage === 2 ? 'text-[22vw]' : 'text-7xl md:text-9xl'}`}>
                            {stage < 2 ? <span className="block whitespace-nowrap leading-tight">HIGH STAKES<br/>ENCOUNTER</span> : "ANGEL"}
                        </h1>
                    </div>
                </div>

                <div className={`overflow-hidden transition-all duration-[1000ms] ease-out w-full ${stage < 3 ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
                    <div className="space-y-6 mb-12 pt-12">
                        <p className="text-2xl text-cyan-100 font-light">"A divine blessing has been bestowed upon you."</p>
                        <div className="flex items-center justify-center gap-8 text-sm md:text-base">
                            <div className="text-cyan-200"><span className="block text-4xl font-bold mb-1 text-white">+1</span>Extra Life</div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <button 
                            onClick={handleAccept} 
                            className="group relative px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full font-black text-xl tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_40px_rgba(34,211,238,0.5)] overflow-hidden border border-cyan-300/50 ring-4 ring-transparent focus:ring-cyan-200"
                        >
                            <span className="relative z-10">Receive Blessing</span>
                            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>
                    <div className="mt-8 text-[10px] text-cyan-300/50 uppercase tracking-widest animate-pulse">
                        [PRESS SPACE TO ACCEPT]
                    </div>
                </div>
            </div>
      </div>
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none ${phase === 'SELECTED' ? 'opacity-0 animate-white-out' : ''} ${phase === 'DONE' ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};