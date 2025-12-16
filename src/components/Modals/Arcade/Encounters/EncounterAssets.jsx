import React from 'react';

// --- SHARED GLOBAL ANIMATIONS ---
const GLOBAL_STYLES = `
  /* --- ROTATION --- */
  @keyframes swing-cw { from { transform: rotate(0deg); } to { transform: rotate(180deg); } }
  @keyframes swing-ccw { from { transform: rotate(0deg); } to { transform: rotate(-180deg); } }
  .animate-swing-cw { animation: swing-cw 3s ease-out 1 forwards; }
  .animate-swing-ccw { animation: swing-ccw 3s ease-out 1 forwards; }

  /* --- ENTRANCES & EXITS --- */
  @keyframes rise-from-bottom {
    from { opacity: 0; transform: translateY(100%) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-rise-from-bottom { animation: rise-from-bottom 2s cubic-bezier(0.16, 1, 0.3, 1) both; }

  @keyframes white-out { from { opacity: 0; } to { opacity: 1; } }
  .animate-white-out { animation: white-out 0.5s ease-in forwards; animation-delay: 2.5s; }

  @keyframes content-fade-out { to { opacity: 0; transform: scale(0.95); filter: blur(4px); } }
  .animate-content-fade-out { animation: content-fade-out 2.5s ease-in forwards; }

  /* --- DEVIL FX --- */
  @keyframes crack-flicker {
    0% { filter: brightness(1.0); transform: scale(1.0); }
    50% { filter: brightness(1.2); transform: scale(1.002); } 
    100% { filter: brightness(1.0); transform: scale(1.0); }
  }
  .animate-crack-flicker { animation: crack-flicker 0.1s linear infinite alternate; }
  
  .crack-overlay {
      box-shadow: 0 0 150px 50px rgba(255, 0, 0, 0.5) inset, 0 0 150px 50px rgba(255, 0, 0, 0.5);
      border: 5px solid rgba(255, 50, 50, 0.9);
  }
  
  .crack-path {
      stroke-dasharray: 3000;
      stroke-dashoffset: 3000;
      animation: crack-draw 2.5s ease-out forwards;
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
      stroke: rgba(20, 0, 0, 0.9); 
  }
  
  .crack-light {
      stroke-dasharray: 3000;
      stroke-dashoffset: 3000;
      opacity: 0;
      animation: crack-draw 2.5s ease-out forwards, light-burst 2.0s ease-in forwards;
      animation-delay: 0s, 0.5s; 
      stroke: #fff;
      stroke-width: 4;
      filter: blur(2px) drop-shadow(0 0 10px #ffaa00) drop-shadow(0 0 20px #ff5500);
  }

  .shooting-beam {
      stroke: #fff;
      stroke-width: 12px;
      stroke-linecap: round;
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      opacity: 0;
      filter: blur(3px) drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #ffcc00) drop-shadow(0 0 30px #ff4500);
      animation: beam-fire 0.6s cubic-bezier(0.2, 1, 0.3, 1) forwards;
      mix-blend-mode: screen;
  }

  @keyframes crack-draw { to { stroke-dashoffset: 0; } }
  @keyframes beam-fire { 0% { opacity: 1; stroke-dashoffset: 1000; } 100% { opacity: 1; stroke-dashoffset: 0; } }
  
  @keyframes light-burst {
      0% { opacity: 0; stroke-width: 1; filter: blur(1px) drop-shadow(0 0 0px #fff); }
      20% { opacity: 0.6; stroke-width: 3; }
      100% { opacity: 1; stroke-width: 12; filter: blur(4px) drop-shadow(0 0 40px #fff) drop-shadow(0 0 80px #ffaa00); }
  }

  @keyframes strobe-sequence {
      0% { opacity: 0; } 50% { opacity: 0; } 52% { opacity: 0.3; } 54% { opacity: 0; }
      65% { opacity: 0.5; } 67% { opacity: 0; } 75% { opacity: 0.2; } 77% { opacity: 0; }
      85% { opacity: 0.9; } 88% { opacity: 0; } 100% { opacity: 0; }
  }
  .animate-strobe { animation: strobe-sequence 3s linear forwards; }

  /* --- GOLDEN DEVIL FX --- */
  @keyframes horn-glow {
      0% { filter: drop-shadow(0 0 0px rgba(234, 179, 8, 0)); }
      100% { filter: drop-shadow(0 0 50px rgba(253, 224, 71, 1)) drop-shadow(0 0 20px rgba(234, 179, 8, 0.8)); }
  }
  .animate-horn-glow { animation: horn-glow 2s ease-out forwards; }

  /* --- ANGEL FX --- */
  @keyframes float-particle {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
    50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
  }
  .animate-float { animation: float-particle 4s ease-in-out infinite; }

  @keyframes holy-glow {
    0% { filter: drop-shadow(0 0 0px #fff); }
    100% { filter: drop-shadow(0 0 100px #22d3ee) drop-shadow(0 0 50px #fff); }
  }
  .animate-holy-glow { animation: holy-glow 2.5s ease-in forwards; }

  /* --- GOLDEN ANGEL FX --- */
  @keyframes scan { 0%, 100% { transform: translateX(-100%); opacity: 0; } 50% { transform: translateX(100%); opacity: 1; } }
  .animate-scan { animation: scan 3s ease-in-out infinite; }

  @keyframes gold-burst {
    0% { filter: drop-shadow(0 0 0px #fff); }
    100% { filter: drop-shadow(0 0 100px #fcd34d) drop-shadow(0 0 50px #fff); }
  }
  .animate-gold-burst { animation: gold-burst 2.5s ease-in forwards; }
`;

export const StaticStyles = React.memo(() => <style>{GLOBAL_STYLES}</style>);

export const SwingLights = React.memo(({ color, opacityClass }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${opacityClass}`}>
          {/* Top Left */}
          <div className="absolute top-0 left-0 origin-top-left w-[150vmax] h-[150vmax] bg-[conic-gradient(from_90deg_at_top_left,transparent_0deg,var(--tw-gradient-stops))] from-transparent via-transparent to-transparent animate-swing-cw blur-[100px] mix-blend-screen will-change-transform" style={{ '--tw-gradient-stops': `transparent 0deg, ${color} 15deg, transparent 30deg` }} />
          
          {/* Top Right */}
          <div className="absolute top-0 right-0 origin-top-right w-[150vmax] h-[150vmax] bg-[conic-gradient(from_270deg_at_top_right,transparent_0deg,var(--tw-gradient-stops))] from-transparent via-transparent to-transparent animate-swing-ccw blur-[100px] mix-blend-screen will-change-transform" style={{ '--tw-gradient-stops': `transparent 0deg, ${color} 15deg, transparent 30deg` }} />
          
          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 origin-bottom-left w-[150vmax] h-[150vmax] bg-[conic-gradient(from_0deg_at_bottom_left,transparent_0deg,var(--tw-gradient-stops))] from-transparent via-transparent to-transparent animate-swing-cw blur-[100px] mix-blend-screen will-change-transform" style={{ '--tw-gradient-stops': `transparent 0deg, ${color} 15deg, transparent 30deg` }} />
          
          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 origin-bottom-right w-[150vmax] h-[150vmax] bg-[conic-gradient(from_270deg_at_bottom_right,transparent_0deg,var(--tw-gradient-stops))] from-transparent via-transparent to-transparent animate-swing-ccw blur-[100px] mix-blend-screen will-change-transform" style={{ '--tw-gradient-stops': `transparent 0deg, ${color} 15deg, transparent 30deg` }} />
    </div>
  );
});