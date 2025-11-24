import React, { useEffect, useState } from 'react';
import { useArcadeGameEngine, GAME_STATES } from '../../hooks/useArcadeGameEngine.js';
import { MINIGAME_TYPES, ARCADE_CONFIG } from '../../config/arcadeConfig.js';

import ArcadeHUD from './ArcadeHUD.jsx';
import ArcadeEventFeed from './ArcadeEventFeed.jsx';

import ArcadeIntroModal from '../Modals/Arcade/ArcadeIntroModal.jsx';
import ArcadePauseModal from '../Modals/Arcade/ArcadePauseModal.jsx';
import RunSummaryModal from '../Modals/Arcade/RunSummaryModal.jsx';
import LegendUnlockModal from '../Modals/Arcade/LegendUnlockModal.jsx';

import DevilOfferModal from '../Modals/Arcade/DevilOfferModal.jsx';
import GoldenDevilEncounter from './Encounters/GoldenDevilEncounter.jsx';
import GoldenAngelBanner from './Encounters/GoldenAngelBanner.jsx';
import AngelPopup from './Encounters/AngelPopup.jsx';
import BossFight from './Boss/BossFight.jsx';

import CornerExpansionGame from './Minigames/CornerExpansionGame.jsx';
import MashChaseGame from './Minigames/MashChaseGame.jsx';
import ColorHerdGame from './Minigames/ColorHerdGame.jsx';
import ProjectileDodgeGame from './Minigames/ProjectileDodgeGame.jsx';
import ColorWheelGame from './Minigames/ColorWheelGame.jsx';

const ArcadeGameRoot = ({ onExit }) => {
  const engine = useArcadeGameEngine();
  const { gameState, currentMinigame, score, multiplier, lives, round, encounterType, isGodRun } = engine;

  const [isPaused, setIsPaused] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [hasShownGodBanner, setHasShownGodBanner] = useState(false);
  
  // Local State for High Score (simple persistence)
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
      const saved = localStorage.getItem('ARCADE_HIGH_SCORE');
      if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Update High Score on Game Over
  useEffect(() => {
      if (gameState === GAME_STATES.SUMMARY) {
          if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('ARCADE_HIGH_SCORE', score.toString());
          }
      }
  }, [gameState, score, highScore]);

  // Global Keys
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
  }, [score]);

  const handleStart = () => {
      setHasShownGodBanner(false);
      engine.actions.startGame();
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
        switch (currentMinigame) {
          case MINIGAME_TYPES.CORNER_EXPANSION: return <CornerExpansionGame onComplete={engine.actions.handleMinigameComplete} difficulty={round} />;
          case MINIGAME_TYPES.MASH_CHASE: return <MashChaseGame onComplete={engine.actions.handleMinigameComplete} difficulty={round} />;
          case MINIGAME_TYPES.COLOR_HERD: return <ColorHerdGame onComplete={engine.actions.handleMinigameComplete} difficulty={round} />;
          case MINIGAME_TYPES.PROJECTILE_DODGE: return <ProjectileDodgeGame onComplete={engine.actions.handleMinigameComplete} difficulty={round} />;
          case MINIGAME_TYPES.COLOR_WHEEL: return <ColorWheelGame onComplete={engine.actions.handleMinigameComplete} difficulty={round} />;
          default: return <div className="text-white animate-pulse">Loading Minigame... {currentMinigame}</div>;
        }

      case GAME_STATES.ENCOUNTER:
        if (encounterType === 'BOSS') {
            return <BossFight onComplete={(success) => engine.actions.resolveEncounter(success ? 'WIN' : 'DEATH')} difficulty={round} />;
        } 
        else if (encounterType === 'GOLDEN_DEVIL') {
            return (
                <GoldenDevilEncounter 
                    onChoice={(choice) => {
                        if (choice === 'REJECT') engine.actions.resolveEncounter('SAFE');
                        else {
                            const lived = Math.random() > 0.7;
                            engine.actions.resolveEncounter(lived ? 'WIN_BIG' : 'DEATH');
                        }
                    }} 
                />
            );
        } 
        else {
             return (
                <DevilOfferModal 
                    currentScore={score}
                    onReject={() => engine.actions.resolveEncounter('SAFE')}
                    onAccept={() => {
                         const lived = Math.random() > 0.5;
                         engine.actions.resolveEncounter(lived ? 'WIN' : 'DEATH');
                    }}
                />
            );
        }

      case GAME_STATES.TRANSITION:
        return (
          <div className="flex flex-col items-center justify-center h-full text-white animate-pulse">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-lg">
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

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 font-pixel text-slate-900 dark:text-slate-100 overflow-hidden select-none cursor-none">
      
      {/* --- FONT INJECTION --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .font-pixel {
          font-family: 'Press Start 2P', cursive;
          -webkit-font-smoothing: none; 
        }
      `}</style>

      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* HUD is hidden in Intro/Summary for cleaner look */}
      {gameState !== GAME_STATES.INTRO && gameState !== GAME_STATES.IDLE && gameState !== GAME_STATES.SUMMARY && (
        <ArcadeHUD score={score} lives={lives} multiplier={multiplier} />
      )}
      
      {isGodRun && !hasShownGodBanner && gameState === GAME_STATES.PLAYING && (
          <GoldenAngelBanner onDismiss={() => setHasShownGodBanner(true)} />
      )}
      
      <div className="relative w-full h-full flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default ArcadeGameRoot;