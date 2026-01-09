import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useArcadeGameEngine, GAME_STATES } from '../../hooks/useArcadeGameEngine.js';
import { MINIGAME_TYPES, ARCADE_CONFIG } from '../../config/appConfig.js';

import ArcadeIntroModal from '../Modals/Arcade/ArcadeIntroModal.jsx';
import ArcadePauseModal from '../Modals/Arcade/ArcadePauseModal.jsx';
import RunSummaryModal from '../Modals/Arcade/RunSummaryModal.jsx';
import LegendUnlockModal from '../Modals/Arcade/LegendUnlockModal.jsx';

// --- ENCOUNTERS ---
import { Devil } from '../Modals/Arcade/Encounters/Devil.jsx';
import { GoldenDevil } from '../Modals/Arcade/Encounters/GoldenDevil.jsx';
import { Angel } from '../Modals/Arcade/Encounters/Angel.jsx';
import { GoldenAngel } from '../Modals/Arcade/Encounters/GoldenAngel.jsx';

import BossFight from './Boss/BossFight.jsx';
import CornerExpansionGame from './Minigames/CornerExpansionGame.jsx';
import MashChaseGame from './Minigames/MashChaseGame.jsx';
import ColorHerdGame from './Minigames/ColorHerdGame.jsx';
import ProjectileDodgeGame from './Minigames/ProjectileDodgeGame.jsx';
import ColorWheelGame from './Minigames/ColorWheelGame.jsx';

// --- SHARED STYLES ---
const RAINBOW_TEXT_ANIMATED = "bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-rainbow";

// --- 1. THE ROLLING FLOATING POINT ---
const FloatingPoint = React.memo(({ x, y, value, delay }) => {
  const [displayVal, setDisplayVal] = useState(0); 
  const [show, setShow] = useState(false); 

  const rotation = Math.random() * 40 - 20; 

  useEffect(() => {
    let timeout = setTimeout(() => {
        setShow(true);
        let startTimestamp;
        const duration = 600; 

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplayVal(Math.floor(value * ease));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);

    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, value]);

  if (!show) return null;

  const style = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    pointerEvents: 'none',
    zIndex: 1000,
    animation: 'floatUp 1.2s forwards',
  };

  return (
    <div style={style} className="drop-shadow-[0_4px_0_rgba(0,0,0,1)] whitespace-nowrap text-3xl flex items-center gap-0.5">
      <span className={`font-sans font-black text-4xl leading-none ${RAINBOW_TEXT_ANIMATED}`} style={{ WebkitTextStroke: '1px black' }}>
        +
      </span>
      <span className={`font-pixel font-black ${RAINBOW_TEXT_ANIMATED}`} style={{ WebkitTextStroke: '1px black' }}>
        {displayVal.toLocaleString()}
      </span>
    </div>
  );
});


// --- SUB-COMPONENT: ROLLING SCORE (HUD) ---
const RollingScore = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isRolling, setIsRolling] = useState(false);
  const targetRef = useRef(value);
  
  useEffect(() => {
    targetRef.current = value;
    let animationFrame;

    const animate = () => {
      setDisplayValue(current => {
        const diff = targetRef.current - current;
        if (diff === 0) {
            setIsRolling(false);
            return current;
        }

        setIsRolling(true);
        let rate = 0.003; 
        if (Math.abs(diff) > 50000) rate = 0.01; 
        if (Math.abs(diff) > 250000) rate = 0.05; 

        let step = diff * rate; 
        if (Math.abs(step) < 1) step = Math.sign(diff); 
        else step = Math.round(step);

        return current + step;
      });
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <span className={`tabular-nums transition-all duration-300 font-black ${isRolling ? RAINBOW_TEXT_ANIMATED + ' drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-110' : 'text-slate-100'}`}>
      {displayValue.toLocaleString()}
    </span>
  );
};

// --- MAIN COMPONENT ---
const ArcadeGameRoot = ({ onExit }) => {
  // Move isPaused state to the top so it can be passed to the engine
  const [isPaused, setIsPaused] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  
  // Pass isPaused to the engine to stop passive points
  const engine = useArcadeGameEngine(isPaused);
  
  const { 
      gameState = GAME_STATES.IDLE, 
      currentMinigame, 
      score = 0, 
      multiplier = 1, 
      lives = 3, 
      round = 1, 
      encounterType, 
      isGodRun,
      passiveRate = 0, 
  } = engine || {};

  const [hasShownGodBanner, setHasShownGodBanner] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const [pointsParticles, setPointsParticles] = useState([]);
  const prevScoreRef = useRef(score);
  const processingRef = useRef(false);

  // --- 3. THE SPLITTER LOGIC ---
  useEffect(() => {
    // Prevent passive points accumulation or visuals when paused
    if (isPaused) {
        prevScoreRef.current = score; // Sync ref so diff doesn't accumulate
        return;
    }

    const diff = score - prevScoreRef.current;
    prevScoreRef.current = score;

    if (diff > 0) { 
        const isActiveWin = diff > (passiveRate * 2) || diff > 100;
        
        if (!isActiveWin) {
            let chance = 1.0;
            if (round <= 7) chance = 0.30;       
            else if (round <= 14) chance = 0.50; 
            else if (round <= 20) chance = 0.80; 
            
            if (Math.random() > chance) return; 
        }
        
        const splitCount = (diff < 6) ? 1 : 6; 
        const valPerPart = Math.floor(diff / splitCount);
        const remainder = diff % splitCount;

        for (let i = 0; i < splitCount; i++) {
            const id = Date.now() + Math.random();
            const partValue = valPerPart + (i < remainder ? 1 : 0);
            const randomX = 15 + Math.random() * 70; 
            const randomY = 20 + Math.random() * 60;
            const delay = i * 100; 

            setPointsParticles(prev => [
                ...prev, 
                { id, x: randomX, y: randomY, value: partValue, delay }
            ]);

            setTimeout(() => {
                setPointsParticles(prev => prev.filter(p => p.id !== id));
            }, delay + 1500);
        }
    }
  }, [score, round, passiveRate, isPaused]); 


  useEffect(() => {
    processingRef.current = false;
  }, [round, lives, gameState]);

  useEffect(() => {
      const saved = localStorage.getItem('ARCADE_HIGH_SCORE');
      if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
      if (gameState === GAME_STATES.SUMMARY) {
          if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('ARCADE_HIGH_SCORE', score.toString());
          }
      }
  }, [gameState, score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.TRANSITION) {
           setIsPaused(prev => !prev);
        } else if (gameState === GAME_STATES.INTRO || gameState === GAME_STATES.SUMMARY) {
           onExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, gameState]);

  useEffect(() => {
      if (score >= ARCADE_CONFIG.THRESHOLDS.LEGEND_TROPHY && !showLegend) {
          setIsPaused(true);
          setShowLegend(true);
      }
  }, [score, showLegend]);

  const handleStart = () => {
      setHasShownGodBanner(false);
      processingRef.current = false;
      engine.actions.startGame();
  };

  const handleMinigameResult = (success, data) => {
      if (processingRef.current) return;
      processingRef.current = true;
      engine.actions.handleMinigameComplete(success, data);
  };

  const safeResolve = (outcome, data) => {
      if (processingRef.current) return;
      processingRef.current = true;
      if (engine && engine.actions && engine.actions.resolveEncounter) {
          engine.actions.resolveEncounter(outcome, data);
      }
  };

  const renderContent = () => {
    if (isPaused) {
        return <ArcadePauseModal onResume={() => setIsPaused(false)} onQuit={onExit} score={score} round={round} />;
    }
    
    if (showLegend) {
        return <LegendUnlockModal score={score} onContinue={() => { setShowLegend(false); setIsPaused(false); }} />;
    }

    switch (gameState) {
      case GAME_STATES.IDLE:
      case GAME_STATES.INTRO:
        return <ArcadeIntroModal onStart={handleStart} onExit={onExit} highScore={highScore} />;

      case GAME_STATES.PLAYING:
        if (!currentMinigame) return <div className="text-white animate-pulse">Preparing Round...</div>;
        
        const gameKey = `${round}-${lives}`;
        
        switch (currentMinigame) {
          case MINIGAME_TYPES.CORNER_EXPANSION: 
            return <CornerExpansionGame key={gameKey} onComplete={handleMinigameResult} difficulty={round} round={round} />;
          case MINIGAME_TYPES.MASH_CHASE: 
            return <MashChaseGame key={gameKey} onComplete={handleMinigameResult} difficulty={round} />;
          case MINIGAME_TYPES.COLOR_HERD: 
            return <ColorHerdGame key={gameKey} onComplete={handleMinigameResult} difficulty={round} />;
          case MINIGAME_TYPES.PROJECTILE_DODGE: 
            return <ProjectileDodgeGame key={gameKey} onComplete={handleMinigameResult} difficulty={round} />;
          case MINIGAME_TYPES.COLOR_WHEEL: 
            return <ColorWheelGame key={gameKey} onComplete={handleMinigameResult} difficulty={round} />;
          default: 
            return <div className="text-white animate-pulse">Loading Minigame... {currentMinigame}</div>;
        }

      case GAME_STATES.ENCOUNTER:
        if (encounterType === 'BOSS') {
            return <BossFight key={`boss-${round}`} onComplete={(success) => safeResolve(success ? 'WIN' : 'DEATH')} difficulty={round} />;
        } 
        
        // Update logic for new Devil/Angel components which handle probabilities internally
        switch (encounterType) {
            case 'GOLDEN_DEVIL': 
                return <GoldenDevil 
                    key={round} 
                    onAccept={(outcome) => safeResolve(outcome === 'REWARD' ? 'WIN_BIG' : 'DEATH')} 
                    onReject={() => safeResolve('SAFE')} 
                />;
            
            case 'GOLDEN_ANGEL': 
                return <GoldenAngel 
                    key={round} 
                    onAccept={() => safeResolve('GOD_SEED')} 
                />;
            
            case 'ANGEL': 
                return <Angel 
                    key={round} 
                    onAccept={() => safeResolve('BLESSING')} 
                    onReject={() => safeResolve('SAFE')} 
                />;
            
            case 'DEVIL': 
            default: 
                return <Devil 
                    key={round} 
                    currentScore={score} 
                    onReject={() => safeResolve('SAFE')} 
                    onAccept={(outcome) => safeResolve(outcome === 'REWARD' ? 'WIN' : 'DEATH')} 
                />;
        }

      case GAME_STATES.TRANSITION:
        return (
          <div className="flex flex-col items-center justify-center h-full text-white animate-pulse">
            <h2 className={`text-4xl md:text-6xl font-black drop-shadow-lg ${RAINBOW_TEXT_ANIMATED}`}>
              ROUND {round}
            </h2>
            <p className="text-xl mt-4 tracking-[0.5em] text-slate-400">GET READY</p>
          </div>
        );

      case GAME_STATES.SUMMARY:
        return <RunSummaryModal score={score} round={round} highScore={highScore} onRestart={handleStart} onExit={onExit} />;

      default: return <div className="text-red-500">Error: Unknown State {gameState}</div>;
    }
  };

  const getHudColors = () => {
      if (score > 2500000) return 'border-purple-500 shadow-purple-500/50'; 
      if (score > 1000000) return 'border-orange-500 shadow-orange-500/50'; 
      return 'border-cyan-500 shadow-cyan-500/50'; 
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 font-pixel text-slate-900 dark:text-slate-100 overflow-hidden select-none cursor-none">
      
      {/* ANIMATIONS */}
      <style>{`
        @keyframes gradient-xy {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-rainbow {
            background-size: 200% auto;
            animation: gradient-xy 2s linear infinite;
        }
        @keyframes floatUp {
            0% { opacity: 0; transform: translate(-50%, -20%) scale(0.5) rotate(0deg); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(-5deg); }
            100% { opacity: 0; transform: translate(-50%, -150%) scale(1) rotate(5deg); }
        }
      `}</style>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* --- RENDER THE FLOATING POINTS LAYER --- */}
      <div className="absolute inset-0 z-[500] pointer-events-none">
        {pointsParticles.map(p => (
            <FloatingPoint key={p.id} {...p} />
        ))}
      </div>

      {/* --- INLINED HUD --- */}
      {gameState !== GAME_STATES.INTRO && gameState !== GAME_STATES.IDLE && gameState !== GAME_STATES.SUMMARY && (
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-[250] flex justify-between items-start pointer-events-none">
            
            {/* Left: Lives & Multiplier */}
            <div className="flex flex-col gap-2">
                <div className="flex gap-1 text-red-500 text-2xl drop-shadow-md">
                    {[...Array(ARCADE_CONFIG.INITIAL_LIVES + ARCADE_CONFIG.MAX_EXTRA_LIVES)].map((_, i) => (
                        <span key={i} className={i < lives ? 'opacity-100' : 'opacity-20 grayscale'}>
                            ♥
                        </span>
                    ))}
                </div>
                {/* RAINBOW MULTIPLIER LABEL */}
                <div className={`text-sm md:text-base tracking-widest drop-shadow-sm font-bold ${RAINBOW_TEXT_ANIMATED}`}>
                    {multiplier.toFixed(1)}x MULTI
                </div>
            </div>

            {/* Right: Score (Rolling) */}
            <div className={`flex flex-col items-end border-b-4 bg-slate-900/50 backdrop-blur px-4 py-2 rounded-lg transition-colors duration-500 ${getHudColors()}`}>
                {/* RAINBOW SCORE LABEL */}
                <div className={`text-xs md:text-sm uppercase tracking-widest mb-1 font-bold ${RAINBOW_TEXT_ANIMATED}`}>
                  Score
                </div>
                <div className="text-xl md:text-3xl font-black tabular-nums">
                    <RollingScore value={score} />
                </div>
            </div>
        </div>
      )}

      {/* God Banner */}
      {isGodRun && !hasShownGodBanner && gameState === GAME_STATES.PLAYING && ( 
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] animate-bounce pointer-events-none"> 
            <div className="bg-yellow-500/20 backdrop-blur border border-yellow-400 text-yellow-200 px-6 py-2 rounded-full font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.4)]"> 
                GOD SEED ACTIVE 
            </div> 
          </div> 
      )}
      
      {/* Main Game Area */}
      <div className="relative w-full h-full flex items-center justify-center"> {renderContent()} </div>
    </div>
  );
};

export default ArcadeGameRoot;