import { useState, useEffect, useCallback, useRef } from 'react';
import { ARCADE_CONFIG, MINIGAME_TYPES } from '../config/arcadeConfig';
import { ARCADE_EVENTS } from '../utils/arcadeEvents';
import { useArcadeRng } from './useArcadeRng';
import { useArcadeScoreManager } from './useArcadeScoreManager';

export const GAME_STATES = {
  IDLE: 'IDLE',
  INTRO: 'INTRO',           // Golden Angel roll happens here
  PLAYING: 'PLAYING',       // Active mini-game
  TRANSITION: 'TRANSITION', // Between mini-games
  ENCOUNTER: 'ENCOUNTER',   // Boss or Devil screen
  SUMMARY: 'SUMMARY'        // Game Over
};

export const useArcadeGameEngine = () => {
  // --- State ---
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [lives, setLives] = useState(ARCADE_CONFIG.INITIAL_LIVES);
  const [round, setRound] = useState(1);
  const [currentMinigame, setCurrentMinigame] = useState(null);
  const [encounterType, setEncounterType] = useState(null); // 'BOSS', 'DEVIL', 'GOLDEN_DEVIL'
  
  // --- Modifiers ---
  const [isGodRun, setIsGodRun] = useState(false); // Golden Angel active?
  
  // --- Hooks ---
  const rng = useArcadeRng();
  const scoreManager = useArcadeScoreManager(gameState);

  // --- Core Actions ---

  const startGame = useCallback(() => {
    // 1. Reset Stats
    setRound(1);
    scoreManager.resetScore();
    
    // 2. Roll for God Seed (Golden Angel)
    const godSeed = rng.checkGodSeed();
    setIsGodRun(godSeed);
    setLives(godSeed ? 3 : ARCADE_CONFIG.INITIAL_LIVES); // God run starts with 3 lives

    setGameState(GAME_STATES.PLAYING);
    pickNextMinigame();
  }, [rng, scoreManager]);

  const pickNextMinigame = () => {
    const types = Object.values(MINIGAME_TYPES);
    const next = types[Math.floor(Math.random() * types.length)];
    setCurrentMinigame(next);
  };

  const handleMinigameComplete = (success, enemiesDefeated = 0) => {
    if (success) {
      // 1. Add Score
      scoreManager.addScore(enemiesDefeated * ARCADE_CONFIG.BASE_SCORE_PER_ENEMY);
      scoreManager.incrementMultiplier();
      
      // 2. Check for Angel (Life)
      // God runs don't get Angels (max blessings already)
      if (!isGodRun && lives < ARCADE_CONFIG.INITIAL_LIVES + ARCADE_CONFIG.MAX_EXTRA_LIVES) {
        if (rng.checkAngelSpawn(lives - ARCADE_CONFIG.INITIAL_LIVES)) {
          setLives(prev => prev + 1);
          // TODO: Trigger Angel Event Feed
        }
      }

      advanceRound();
    } else {
      handleDamage();
    }
  };

  const handleDamage = () => {
    if (lives > 1) {
      setLives(prev => prev - 1);
      // Retry same round or advance? Usually advance but with penalty.
      advanceRound(); 
    } else {
      setLives(0);
      setGameState(GAME_STATES.SUMMARY);
    }
  };

  const advanceRound = () => {
    const nextRound = round + 1;
    setRound(nextRound);

    // Check for Boss/Encounter Checkpoint
    if (nextRound % ARCADE_CONFIG.BOSS_FREQUENCY === 0) {
      const type = rng.determineCheckpointEncounter();
      setEncounterType(type);
      setGameState(GAME_STATES.ENCOUNTER);
    } else {
      // Normal transition to next mini-game
      setGameState(GAME_STATES.TRANSITION);
      // Short delay before next game
      setTimeout(() => {
        pickNextMinigame();
        setGameState(GAME_STATES.PLAYING);
      }, 2000);
    }
  };

  const resolveEncounter = (outcome) => {
    // Called when Boss/Devil is finished
    if (outcome === 'DEATH') {
      setGameState(GAME_STATES.SUMMARY);
    } else {
      // Success
      setGameState(GAME_STATES.TRANSITION);
      setTimeout(() => {
        pickNextMinigame();
        setGameState(GAME_STATES.PLAYING);
      }, 2000);
    }
  };

  return {
    gameState,
    lives,
    round,
    score: scoreManager.score,
    multiplier: scoreManager.multiplier,
    currentMinigame,
    encounterType,
    isGodRun,
    actions: {
      startGame,
      handleMinigameComplete,
      resolveEncounter
    }
  };
};