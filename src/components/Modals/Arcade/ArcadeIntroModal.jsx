import React, { useState, useEffect } from 'react';

const ArcadeIntroModal = ({ onStart, onExit, highScore = 0 }) => {
  const [isBlinking, setIsBlinking] = useState(true);

  // Classic "Insert Coin" / "Press Start" blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col z-50 select-none bg-white dark:bg-black text-slate-900 dark:text-white overflow-hidden pixel-font-container transition-colors duration-300">
      
      {/* Font Import & Pixel Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-font-container {
          font-family: 'Press Start 2P', cursive;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeSpeed;
        }

        /* Hard Pixel Text Shadows for depth */
        .neon-text-shadow {
          text-shadow: 4px 4px 0px rgba(0,0,0,0.2);
        }
        .dark .neon-text-shadow {
          text-shadow: 4px 4px 0px #4c1d95; /* violet-900 */
        }
        
        /* Custom Grid Animation */
        @keyframes grid-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .grid-bg {
          animation: grid-scroll 4s linear infinite;
        }
      `}</style>

      {/* Background Grid - Dynamic color based on theme */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15] pointer-events-none grid-bg" 
           style={{ 
               backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
           }}>
      </div>
      
      {/* --- HEADER ROW --- */}
      <div className="w-full flex justify-between items-start p-8 md:p-12 z-30 relative">
        
        {/* TOP LEFT: Title */}
        <div className="flex flex-col items-start">
          <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-600 dark:from-cyan-400 dark:to-purple-500 tracking-widest transform -skew-x-6 filter drop-shadow-sm">
            ARCADE
          </h1>
          <div className="w-full h-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-cyan-400 dark:to-purple-500 mt-2 transform -skew-x-6 opacity-80" />
        </div>

        {/* TOP RIGHT: High Score & Extras */}
        <div className="flex flex-col items-end">
          <div className="text-right border-2 border-slate-200 dark:border-slate-800 p-3 rounded bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <p className="text-[10px] md:text-xs text-pink-600 dark:text-pink-500 mb-2 tracking-widest uppercase animate-pulse">
              HI-SCORE
            </p>
            <p className="text-xl md:text-3xl text-slate-800 dark:text-cyan-300 tracking-widest">
              {new Intl.NumberFormat('en-US', { minimumIntegerDigits: 6, useGrouping: false }).format(highScore)}
            </p>
          </div>
          
          {/* Extra Stars (Credits) */}
          <div className="mt-2 flex gap-2 p-2">
             {[...Array(3)].map((_, i) => (
                 <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400 drop-shadow-md stroke-black stroke-1">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                 </svg>
             ))}
          </div>
        </div>
      </div>

      {/* --- CENTER: MENU SELECTION --- */}
      <div className="flex-grow flex flex-col items-center justify-center pb-20 z-30">
         
         {/* 1 PLAYER Selection */}
         <button 
            onClick={onStart}
            className="group relative flex flex-col items-center gap-4 focus:outline-none transition-transform active:scale-95"
         >
            <div className="flex items-center gap-6">
                {/* Arrow Left */}
                <div className={`text-3xl md:text-5xl text-purple-600 dark:text-yellow-400 ${isBlinking ? 'opacity-100' : 'opacity-0'}`}>
                  ▶
                </div>

                {/* Main Text */}
                <div className={`text-3xl md:text-5xl font-bold tracking-wider transition-colors duration-100 neon-text-shadow
                    ${isBlinking ? 'text-purple-600 dark:text-yellow-400' : 'text-slate-400 dark:text-slate-600'}
                `}>
                    1 PLAYER
                </div>

                {/* Arrow Right */}
                <div className={`text-3xl md:text-5xl text-purple-600 dark:text-yellow-400 transform rotate-180 ${isBlinking ? 'opacity-100' : 'opacity-0'}`}>
                  ▶
                </div>
            </div>
            
            <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-8 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded border border-slate-200 dark:border-slate-800">
                 PRESS ENTER TO START
            </div>
         </button>

      </div>

      {/* --- FOOTER --- */}
      <div className="absolute bottom-8 right-8 text-right z-30">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              CREDIT 00
          </p>
      </div>
      
      <div className="absolute bottom-8 left-8 text-left z-30">
         <button onClick={onExit} className="text-[10px] text-red-500 hover:text-red-600 uppercase tracking-widest hover:underline">
            [ESC] EXIT SYSTEM
         </button>
      </div>

    </div>
  );
};

export default ArcadeIntroModal;