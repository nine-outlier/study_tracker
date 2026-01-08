import React, { useState, useEffect } from 'react';

// --- SHARED RAINBOW STYLES ---
// bg-[length:200%_200%] ensures the gradient is large enough to animate smoothly.
const RAINBOW_TEXT_ANIMATED = "bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-rainbow";
const RAINBOW_BORDER = "border-transparent bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 bg-origin-border";

const ArcadeIntroModal = ({ onStart, onExit, highScore = 0 }) => {
  const [isBlinking, setIsBlinking] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0); // 0: Start, 1: Exit

  // Classic "Insert Coin" / "Press Start" blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Navigation Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault(); // Prevent default scrolling/browser actions

      switch (e.code) {
        // Navigation (Up/Down/Left/Right/WASD)
        case 'ArrowUp':
        case 'KeyW':
        case 'ArrowLeft':
        case 'KeyA':
          setSelectedIndex((prev) => (prev === 0 ? 1 : 0));
          break;
        case 'ArrowDown':
        case 'KeyS':
        case 'ArrowRight':
        case 'KeyD':
          setSelectedIndex((prev) => (prev === 0 ? 1 : 0));
          break;

        // Actions
        case 'Enter':
        case 'Space':
          if (selectedIndex === 0) onStart();
          if (selectedIndex === 1) onExit();
          break;
        case 'Escape':
          onExit();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onStart, onExit]);

  return (
    // Added 'cursor-none' to hide mouse
    <div className="absolute inset-0 w-full h-full flex flex-col z-50 select-none bg-slate-950 text-white overflow-hidden pixel-font-container transition-colors duration-300 cursor-none">
      
      {/* Font Import, Animations & Pixel Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-font-container {
          font-family: 'Press Start 2P', cursive;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeSpeed;
        }

        /* HARD RETRO SHADOWS */
        .retro-shadow {
            text-shadow: 4px 4px 0px #000, 6px 6px 0px rgba(250, 204, 21, 0.3), 8px 8px 0px rgba(236, 72, 153, 0.3);
        }
        
        /* Rainbow Flow Animation */
        @keyframes gradient-xy {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-rainbow {
            background-size: 200% auto;
            animation: gradient-xy 3s linear infinite;
        }

        /* Custom Grid Animation */
        @keyframes grid-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .grid-bg {
          animation: grid-scroll 4s linear infinite;
        }
        
        /* Scanline effect */
        .scanlines {
            background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%);
            background-size: 100% 4px;
            pointer-events: none;
        }
      `}</style>

      {/* Background Grid - Now with a subtle rainbow tint */}
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none grid-bg" 
           style={{ 
               backgroundImage: 'linear-gradient(#ec4899 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
           }}>
      </div>
      <div className="absolute inset-0 scanlines z-40 opacity-30"></div>
      
      {/* --- HEADER ROW --- */}
      <div className="w-full flex justify-between items-start p-8 md:p-12 z-30 relative">
        
        {/* TOP LEFT: Title */}
        <div className="flex flex-col items-start">
          {/* RAINBOW TITLE WITH HEAVY SHADOW */}
          <h1 className={`text-5xl md:text-7xl tracking-widest transform -skew-x-6 ${RAINBOW_TEXT_ANIMATED} retro-shadow`}>
            ARCADE
          </h1>
          <div className="w-full h-3 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 mt-2 transform -skew-x-6 opacity-80 animate-pulse" />
        </div>

        {/* TOP RIGHT: High Score & Extras */}
        <div className="flex flex-col items-end">
          {/* RAINBOW BORDER BOX */}
          <div className={`text-right border-4 p-4 rounded-lg bg-slate-900/80 backdrop-blur-sm ${RAINBOW_BORDER}`}>
            <p className={`text-xs md:text-sm mb-2 tracking-[0.2em] uppercase font-bold animate-pulse ${RAINBOW_TEXT_ANIMATED}`}>
              HI-SCORE
            </p>
            <p className="text-2xl md:text-4xl text-cyan-300 tracking-widest font-bold retro-shadow">
              {new Intl.NumberFormat('en-US', { minimumIntegerDigits: 6, useGrouping: false }).format(highScore)}
            </p>
          </div>
          
          {/* Extra Stars (Credits) - Now rainbow filled */}
          <div className="mt-2 flex gap-3 p-2">
             {[...Array(3)].map((_, i) => (
                 <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#rainbow-grad)" className="w-6 h-6 drop-shadow-md stroke-black stroke-2">
                    <defs>
                        <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="50%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                 </svg>
             ))}
          </div>
        </div>
      </div>

      {/* --- CENTER: MENU SELECTION --- */}
      <div className="flex-grow flex flex-col items-center justify-center pb-20 z-30">
         
         {/* 1 PLAYER Selection */}
         {/* Removed onClick, using keyboard state 'selectedIndex' */}
         <div className={`group relative flex flex-col items-center gap-4 transition-transform duration-200 ${selectedIndex === 0 ? 'scale-110' : 'scale-90 opacity-60'}`}>
            <div className="flex items-center gap-6">
                {/* Arrow Left - Shows only if selected */}
                <div className={`text-4xl md:text-6xl ${RAINBOW_TEXT_ANIMATED} retro-shadow ${selectedIndex === 0 && isBlinking ? 'opacity-100' : 'opacity-0'}`}>
                  ▶
                </div>

                {/* Main Text - Rainbow & Blinking if selected */}
                <div className={`text-4xl md:text-6xl font-bold tracking-wider transition-all duration-100 retro-shadow
                    ${selectedIndex === 0 ? (isBlinking ? RAINBOW_TEXT_ANIMATED : 'text-slate-700') : 'text-slate-500'}
                `}>
                    1 PLAYER
                </div>

                {/* Arrow Right - Shows only if selected */}
                <div className={`text-4xl md:text-6xl transform rotate-180 ${RAINBOW_TEXT_ANIMATED} retro-shadow ${selectedIndex === 0 && isBlinking ? 'opacity-100' : 'opacity-0'}`}>
                  ▶
                </div>
            </div>
            
            {/* Start Prompt - Shows only if selected */}
            {selectedIndex === 0 && (
                <div className={`text-xs md:text-sm uppercase tracking-[0.3em] mt-10 px-6 py-3 rounded-full border-2 font-bold animate-pulse ${RAINBOW_BORDER} ${RAINBOW_TEXT_ANIMATED} bg-slate-900/80`}>
                     PRESS ENTER OR SPACE
                </div>
            )}
         </div>

         {/* Exit Selection - Visually dimmed unless selected */}
         <div className={`mt-12 group relative flex flex-col items-center gap-4 transition-transform duration-200 ${selectedIndex === 1 ? 'scale-110 opacity-100' : 'scale-90 opacity-50'}`}>
            <div className="flex items-center gap-6">
                {/* Arrow Left */}
                <div className={`text-2xl md:text-4xl text-red-500 retro-shadow ${selectedIndex === 1 && isBlinking ? 'opacity-100' : 'opacity-0'}`}>
                  ▶
                </div>

                <div className={`text-2xl md:text-4xl font-bold tracking-wider transition-all duration-100 retro-shadow
                    ${selectedIndex === 1 ? 'text-red-500' : 'text-slate-600'}
                `}>
                    EXIT GAME
                </div>

                {/* Arrow Right */}
                <div className={`text-2xl md:text-4xl text-red-500 transform rotate-180 retro-shadow ${selectedIndex === 1 && isBlinking ? 'opacity-100' : 'opacity-0'}`}>
                  ▶
                </div>
            </div>
         </div>

      </div>

      {/* --- FOOTER --- */}
      <div className="absolute bottom-8 right-8 text-right z-30">
          <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">
              CREDIT 00
          </p>
      </div>
      
      <div className="absolute bottom-8 left-8 text-left z-30">
         <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
           [WASD / ARROWS] MOVE • [SPACE] SELECT • [ESC] BACK
         </p>
      </div>

    </div>
  );
};

export default ArcadeIntroModal;