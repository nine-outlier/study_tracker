import React, { useState, useEffect } from 'react';
import { StaticStyles, SwingLights } from './EncounterAssets.jsx';

// --- VISUALS ---
const GoldenDevilVisuals = React.memo(({ stage, isSelecting, beams }) => (
  <>
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[120px] pointer-events-none transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`} />
    {stage >= 3 && (
      <>
        <div className={`absolute bottom-0 left-0 md:left-[5%] w-[45vw] md:w-[30vw] h-[65vh] origin-bottom animate-rise-from-bottom pointer-events-none z-0 mix-blend-color-dodge opacity-90 ${isSelecting ? 'animate-horn-glow' : ''}`} style={{ animationDelay: '0.2s' }}>
          <svg viewBox="0 0 300 600" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hornGradientGold" x1="0%" y1="100%" x2="70%" y2="0%">
                <stop offset="0%" stopColor="#2a1a00" />
                <stop offset="50%" stopColor="#b4860b" />
                <stop offset="100%" stopColor="#ffd700" />
              </linearGradient>
            </defs>
            <path d="M 50 600 C 20 300 100 100 300 0 C 180 100 180 400 200 600 Z" fill="url(#hornGradientGold)" />
            <path d="M 60 600 C 35 310 110 110 285 10" fill="none" stroke="rgba(255, 255, 200, 0.4)" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
        <div className={`absolute bottom-0 right-0 md:right-[5%] w-[45vw] md:w-[30vw] h-[65vh] origin-bottom animate-rise-from-bottom pointer-events-none z-0 mix-blend-color-dodge opacity-90 ${isSelecting ? 'animate-horn-glow' : ''}`} style={{ animationDelay: '0.2s' }}>
          <svg viewBox="0 0 300 600" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M 50 600 C 20 300 100 100 300 0 C 180 100 180 400 200 600 Z" fill="url(#hornGradientGold)" />
              <path d="M 60 600 C 35 310 110 110 285 10" fill="none" stroke="rgba(255, 255, 200, 0.4)" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      </>
    )}

    {isSelecting && (
         <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,black_100%)] opacity-80" />
            <div className="absolute inset-0 bg-white animate-strobe mix-blend-overlay z-[55]" />
            <svg className="absolute w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
               <g strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <defs>
                      <path id="crack-pattern" d="M400 300 L380 250 L410 220 L350 180 L300 120 L200 50 L100 20 L0 0 M400 300 L430 340 L410 380 L450 450 L500 520 L600 580 L700 600 L800 600 M400 300 L350 320 L300 310 L250 350 L150 400 L50 500 L0 600 M400 300 L450 280 L500 290 L580 250 L650 180 L750 100 L800 50 L800 0 M350 180 L300 200 L250 180 L150 220 L0 250 M450 450 L500 420 L550 450 L650 400 L800 350 M250 350 L200 380 L100 360 L0 400 M580 250 L620 280 L700 260 L800 200 M380 250 L360 230 L340 250 L320 230 M420 150 L440 130 L460 150 L480 130 M300 310 L280 290 L260 310 M500 290 L520 310 L540 290 M100 20 L80 40 L120 50 M700 50 L720 80 L680 90 M50 500 L80 520 L30 550 M750 100 L780 120 L730 150 M0 0 L50 20 L20 80 M800 0 L750 30 L780 80 M0 600 L40 580 L80 590 M800 600 L760 570 L720 590" />
                  </defs>
                  <use href="#crack-pattern" className="crack-path" strokeWidth="2" />
                  <use href="#crack-pattern" className="crack-light" />
                  <g>
                      {beams.map((b, i) => (
                          <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} className="shooting-beam" style={{ animationDelay: `${b.delay}s` }} />
                      ))}
                  </g>
               </g>
            </svg>
         </div>
    )}
  </>
));

export const GoldenDevil = ({ onAccept, onReject }) => {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState('ENTRY');
  const [beams, setBeams] = useState([]);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 1000);
    const t3 = setTimeout(() => setStage(3), 2000); 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const generateBeams = () => {
    const segments = [[400,300, 380,250], [380,250, 410,220], [410,220, 350,180], [350,180, 300,120], [300,120, 200,50], [400,300, 430,340], [430,340, 410,380], [410,380, 450,450], [450,450, 500,520], [500,520, 600,580]];
    const newBeams = [];
    const count = 7;
    const minDistance = 100;
    const startTime = 1.0; 
    const duration = 1.5; 
    const interval = duration / count;

    for (let i = 0; i < count; i++) {
        let bestCandidate = null;
        for (let attempt = 0; attempt < 50; attempt++) {
            const seg = segments[Math.floor(Math.random() * segments.length)];
            const t = Math.random();
            const x = seg[0] + (seg[2] - seg[0]) * t;
            const y = seg[1] + (seg[3] - seg[1]) * t;
            
            let tooClose = false;
            for (const b of newBeams) {
                const dx = b.x1 - x;
                const dy = b.y1 - y;
                if (Math.sqrt(dx*dx + dy*dy) < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            if (!tooClose) {
                const dx = x - 400; const dy = y - 300;
                const angle = Math.atan2(dy, dx);
                const length = 1200; 
                const x2 = x + Math.cos(angle) * length;
                const y2 = y + Math.sin(angle) * length;
                const delay = startTime + (i * interval) + (Math.random() * 0.15);
                bestCandidate = { x1: x, y1: y, x2, y2, delay: delay };
                break;
            }
        }
        if (bestCandidate) newBeams.push(bestCandidate);
    }
    setBeams(newBeams);
  };

  const handleAccept = () => {
    if (phase !== 'ENTRY') return;
    generateBeams();
    setPhase('SELECTED');
    setTimeout(() => {
        setPhase('DONE');
        const isDeath = Math.random() > 0.5;
        onAccept(isDeath ? 'DEATH' : 'REWARD');
    }, 3000); 
  };

  let bgClass = (stage < 2 ? 'bg-black' : 'bg-yellow-950/95');
  if (phase === 'SELECTED') bgClass = 'bg-yellow-950/90 animate-crack-flicker crack-overlay';

  const lightColor = "rgba(234,179,8,0.9)";

  return (
    <div className={`fixed inset-0 z-[250] flex items-center justify-center backdrop-blur-xl font-mono overflow-hidden transition-colors duration-[2000ms] ${bgClass}`}>
      <StaticStyles />
      <SwingLights color={lightColor} opacityClass={stage < 2 ? 'opacity-100' : 'opacity-0'} />

      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <GoldenDevilVisuals stage={stage} isSelecting={phase === 'SELECTED' || phase === 'DONE'} beams={beams} />

            <div className={`max-w-4xl w-full px-6 relative z-10 text-center flex flex-col items-center ${phase === 'SELECTED' ? 'animate-content-fade-out' : ''}`}>
                <div className="flex flex-col items-center">
                    <div className={`flex flex-col items-center transition-all duration-300 ${stage === 1 ? 'blur-xl scale-125 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
                        <div className={`flex flex-col items-center transition-all duration-300 ${stage < 2 ? 'opacity-0 h-0 -translate-y-4' : 'opacity-100 h-auto translate-y-0 mb-1'}`}>
                            <span className="font-bold tracking-[0.5em] text-yellow-500 text-xs md:text-sm">THE</span>
                            <span className="font-black tracking-[0.2em] text-yellow-300 text-xl md:text-3xl drop-shadow-md">GOLDEN</span>
                        </div>
                        <h1 className={`font-black tracking-tighter transition-all duration-[1500ms] leading-none text-center ${stage < 2 ? 'text-4xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)] opacity-100'} ${stage < 2 ? '' : stage === 2 ? 'text-[22vw]' : 'text-7xl md:text-9xl'}`}>
                            {stage < 2 ? <span className="block whitespace-nowrap leading-tight">HIGH STAKES<br/>ENCOUNTER</span> : "DEVIL"}
                        </h1>
                    </div>
                </div>

                <div className={`overflow-hidden transition-all duration-[1000ms] ease-out w-full ${stage < 3 ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
                    <div className="space-y-6 mb-12 pt-8">
                        <p className="text-2xl text-yellow-100 font-light">"I offer you <span className="text-yellow-400 font-black border-b border-yellow-500">TRIPLE</span> your entire fortune..."</p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-sm md:text-base">
                             <div className="flex flex-col items-center p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                                <span className="text-4xl font-bold text-yellow-400 mb-1">300%</span>
                                <span className="text-yellow-200 uppercase tracking-widest text-xs">Total Wealth</span>
                             </div>
                             <div className="hidden md:block h-12 w-px bg-yellow-500/20"></div>
                             <div className="flex flex-col items-center p-4 bg-red-950/30 rounded-lg border border-red-500/30">
                                <span className="text-4xl font-bold text-red-500 mb-1">70%</span>
                                <span className="text-red-400 uppercase tracking-widest text-xs">Instant Death</span>
                             </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        <button onClick={handleAccept} className="w-full max-w-md py-6 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black text-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.4)] border border-yellow-300 relative overflow-hidden group">
                                <span className="relative z-10">TRIPLE OR NOTHING</span>
                                <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                        <button onClick={onReject} className="text-yellow-500/60 hover:text-white text-sm uppercase tracking-widest transition-colors font-bold">
                            Decline & Continue Safely
                        </button>
                    </div>
                </div>
            </div>
      </div>
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none ${phase === 'SELECTED' ? 'opacity-0 animate-white-out' : ''} ${phase === 'DONE' ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};