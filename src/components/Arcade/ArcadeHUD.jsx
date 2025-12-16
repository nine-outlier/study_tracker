import React from 'react';
import ArcadeCountdownBar from './ArcadeCountdownBar';

const ArcadeHUD = ({ score, lives, multiplier, maxLives = 3 }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none select-none">
      
      {/* Left: Score & Countdown */}
      <div className="flex flex-col items-start space-y-2">
        <div>
          <p className="text-[10px] text-cyan-300/70 font-bold tracking-[0.2em] mb-1 uppercase">
            Current Score
          </p>
          <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] font-mono tabular-nums leading-none">
            {new Intl.NumberFormat('en-US').format(score)}
          </p>
        </div>
        
        {/* Countdown Bar appears when score is high */}
        <ArcadeCountdownBar currentScore={score} />
      </div>
      
      {/* Right: Status Indicators */}
      <div className="flex flex-col items-end space-y-3">
         
         {/* Lives (Hearts) */}
         <div className="flex space-x-2 items-center bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800 backdrop-blur-sm">
           <span className="text-[10px] text-slate-400 font-bold tracking-wider mr-2">SYSTEM INTEGRITY</span>
           <div className="flex space-x-1.5">
             {[...Array(maxLives)].map((_, i) => (
               <div 
                 key={i} 
                 className={`w-3 h-3 transform rotate-45 transition-all duration-300 ${
                    i < lives 
                      ? 'bg-red-500 shadow-[0_0_10px_#ef4444] scale-100' 
                      : 'bg-slate-800 border border-slate-700 scale-75'
                 }`} 
               />
             ))}
           </div>
         </div>

         {/* Multiplier Badge */}
         <div className="relative group">
           <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
           <div className="relative px-4 py-2 bg-slate-950 rounded-lg border border-indigo-500/30 flex items-center">
             <span className="text-indigo-400 font-bold text-xl mr-1 font-mono">{multiplier.toFixed(1)}</span>
             <span className="text-[10px] text-indigo-300 uppercase tracking-widest mt-1">Multiplier</span>
           </div>
         </div>

      </div>
    </div>
  );
};

// Place this component definition ABOVE ArcadeGameRoot
const FloatingScoreItem = React.memo(({ id, amount, type, x, y }) => {
  // Define styles based on score type
  const style = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: 500,
    fontSize: type === 'jackpot' ? '3rem' : '2rem',
    color: type === 'damage' ? 'rgb(239, 68, 68)' : type === 'jackpot' ? 'rgb(250, 204, 21)' : 'rgb(52, 211, 153)',
    textShadow: '0 0 10px rgba(0,0,0,0.8)',
    animation: 'floatUp 2s forwards' // CSS animation defined in global styles or index.css
  };

  return (
    <div key={id} style={style} className="font-pixel drop-shadow-lg opacity-0 animate-floatUp">
      +{amount.toLocaleString()}
    </div>
  );
});

export default ArcadeHUD;