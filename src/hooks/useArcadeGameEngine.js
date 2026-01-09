import { useState, useEffect, useCallback, useRef } from 'react';
import { ARCADE_CONFIG, MINIGAME_TYPES } from '../config/appConfig.js';
import { useArcadeScoreManager } from './useArcadeScoreManager.js';
import { calculateRoundRewards, calculateBossScore } from '../utils/arcadeScoring.js';

export const GAME_STATES = {
  IDLE: 'IDLE',
  INTRO: 'INTRO',
  PLAYING: 'PLAYING',
  TRANSITION: 'TRANSITION',
  ENCOUNTER: 'ENCOUNTER',
  SUMMARY: 'SUMMARY'
};

export const useArcadeGameEngine = (isPaused = false) => {
  // --- State ---
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [lives, setLives] = useState(ARCADE_CONFIG.INITIAL_LIVES);
  const [round, setRound] = useState(1);
  const [currentMinigame, setCurrentMinigame] = useState(null);
  const [encounterType, setEncounterType] = useState(null);
  
  const [isGodRun, setIsGodRun] = useState(false);
  
  // Track Angel Spawns: 5% -> 3% -> 0%
  const [angelSpawnCount, setAngelSpawnCount] = useState(0);

  // Track last played game to prevent repeats
  const lastMinigameRef = useRef(null);
  
  // Track exactly when the last *interval* encounter happened for probability chaining
  const lastEncounterRoundRef = useRef(0); 
  
  // Pass round to score manager so it can handle Passive Points scaling
  // If paused, pass a non-scoring state to the manager
  const scoreState = isPaused ? 'PAUSED' : gameState;
  const scoreManager = useArcadeScoreManager(scoreState, round, encounterType);

  // --- Helpers ---
  const pickNextMinigame = useCallback(() => {
    const types = Object.values(MINIGAME_TYPES);
    let pool = types;
    
    // Filter out the last played game unless it's the only one available
    if (lastMinigameRef.current && types.length > 1) {
        pool = types.filter(t => t !== lastMinigameRef.current);
    }
    
    const next = pool[Math.floor(Math.random() * pool.length)];
    lastMinigameRef.current = next;
    setCurrentMinigame(next);
  }, []);

  // --- Core Logic ---

  // 1. Advance Round
  const advanceRound = useCallback((wasFailure = false) => {
    const nextRound = round + 1;
    setRound(nextRound);

    // Config Safeguards
    const bossFreq = ARCADE_CONFIG.BOSS_FREQUENCY || 10;
    
    // -------------------------------------------------
    // A. BOSS CHECK (Highest Priority)
    // -------------------------------------------------
    if (nextRound % bossFreq === 0) {
        console.log(`[Arcade] Round ${nextRound}: Boss Encounter Triggered`);
        setEncounterType('BOSS');
        setGameState(GAME_STATES.ENCOUNTER);
        return;
    } 
    
    // -------------------------------------------------
    // B. INTERVAL ENCOUNTERS (Devils) - Every 5th Round
    // -------------------------------------------------
    if (nextRound % 5 === 0) {
        let intervalChance = 0;
        let reason = "";

        // Logic: Did we get an encounter 5 rounds ago?
        // 5th, 15th, 25th... (Odd intervals relative to 5) = Base Chance
        // 10th, 20th... (Even intervals) = Dependent Chance
        
        if (nextRound % 10 === 5) {
            // Minor Interval (e.g., Round 5): Base 35% chance
            intervalChance = 0.35;
            reason = "Minor Interval (35%)";
        } else {
            // Major Interval (e.g., Round 10): "The Next 5th Round"
            const receivedLastTime = lastEncounterRoundRef.current === (nextRound - 5);
            
            if (receivedLastTime) {
                // We got one recently, lower the odds
                intervalChance = 0.25; 
                reason = "Major Interval (Received last time -> 25%)";
            } else {
                // We missed out last time, boost the odds (Bad Luck Protection)
                intervalChance = 0.70; 
                reason = "Major Interval (Missed last time -> 70%)";
            }
        }

        const roll = Math.random();
        const success = roll < intervalChance;
        
        console.log(`[Arcade] Round ${nextRound} Interval Check (${reason}): ${roll.toFixed(2)} < ${intervalChance} ? ${success}`);
        
        if (success) {
            // Record this round as a success for the NEXT interval check
            lastEncounterRoundRef.current = nextRound;

            // Determine Variant: 5% Golden Devil, 95% Standard Devil
            const isGolden = Math.random() < 0.05;
            setEncounterType(isGolden ? 'GOLDEN_DEVIL' : 'DEVIL');
            
            setGameState(GAME_STATES.ENCOUNTER);
            return;
        }
    }

    // -------------------------------------------------
    // C. ROUND ENCOUNTERS (Angel) - Any Round
    // -------------------------------------------------
    // Only if we haven't already triggered a Boss or Interval encounter
    let angelChance = 0;
    if (angelSpawnCount === 0) angelChance = 0.05;      // 5% Initial
    else if (angelSpawnCount === 1) angelChance = 0.03; // 3% Second
    else angelChance = 0;                               // 0% After 2 spawns

    if (angelChance > 0 && Math.random() < angelChance) {
        console.log(`[Arcade] Round ${nextRound}: Angel Spawned (Spawn #${angelSpawnCount + 1})`);
        setEncounterType('ANGEL');
        // Increment happens in resolveEncounter to ensure they actually play it
        setGameState(GAME_STATES.ENCOUNTER);
        return;
    }

    // -------------------------------------------------
    // D. NORMAL MINIGAME (Fallback)
    // -------------------------------------------------
    setGameState(GAME_STATES.TRANSITION);
    setTimeout(() => {
        pickNextMinigame();
        setGameState(GAME_STATES.PLAYING);
    }, 2000);
    
  }, [round, pickNextMinigame, angelSpawnCount]);

  // 2. Handle Damage
  const handleDamage = useCallback(() => {
    if (lives > 1) {
      setLives(prev => prev - 1);
      scoreManager.resetMultiplier(); 
      
      setGameState(GAME_STATES.TRANSITION);
      setTimeout(() => {
          advanceRound(true); 
      }, 1000);
    } else {
      setLives(0);
      setGameState(GAME_STATES.SUMMARY);
    }
  }, [lives, scoreManager, advanceRound]);

  // 3. Handle Minigame Completion
  const handleMinigameComplete = useCallback((success, data) => {
    if (success) {
      const rewards = calculateRoundRewards(round);
      
      scoreManager.addScore(rewards.basePoints);
      scoreManager.incrementMultiplier();
      
      advanceRound();
    } else {
      handleDamage();
    }
  }, [lives, isGodRun, scoreManager, advanceRound, handleDamage, round]);

  // 4. Start Game
  const startGame = useCallback(() => {
    setRound(1);
    scoreManager.resetScore();
    setEncounterType(null); 
    lastEncounterRoundRef.current = 0; // Reset history
    setAngelSpawnCount(0); // Reset Angel tracker
    
    // --- SEED ENCOUNTER LOGIC ---
    // 1% chance at start only.
    const isGodSeed = Math.random() < 0.01;
    setIsGodRun(isGodSeed);
    
    lastMinigameRef.current = null; 
    
    if (isGodSeed) {
        setEncounterType('GOLDEN_ANGEL');
        setGameState(GAME_STATES.ENCOUNTER);
    } else {
        setLives(ARCADE_CONFIG.INITIAL_LIVES);
        setGameState(GAME_STATES.TRANSITION);
        setTimeout(() => {
            pickNextMinigame();
            setGameState(GAME_STATES.PLAYING);
        }, 2000);
    }
  }, [scoreManager, pickNextMinigame]);

  // 5. Resolve Encounter
  const resolveEncounter = useCallback((outcome, data = null) => {
    
    // BOSS LOGIC
    if (encounterType === 'BOSS' && (outcome === 'BOSS_VICTORY' || outcome === 'WIN')) {
        const bossPoints = calculateBossScore(round, scoreManager.multiplier);
        scoreManager.addRawScore(bossPoints);
        scoreManager.incrementMultiplier(); 
    }

    // ANGEL LOGIC (Increment Spawn Count)
    else if (encounterType === 'ANGEL') {
        if (outcome === 'BLESSING') {
            setLives(l => l + 1);
        }
        setAngelSpawnCount(prev => prev + 1);
    }

    // GOLDEN ANGEL (God Seed)
    else if (encounterType === 'GOLDEN_ANGEL') {
        if (outcome === 'GOD_SEED') {
            setLives(3); // Reset or Max lives? Usually God Seed grants perks.
            scoreManager.setMultiplier(5); 
        }
    }

    // DEVIL / GOLDEN DEVIL LOGIC
    else if (encounterType === 'DEVIL' || encounterType === 'GOLDEN_DEVIL') {
        if (outcome === 'WIN') scoreManager.addScore(1000); 
        else if (outcome === 'WIN_BIG') scoreManager.addScore(5000); // Golden Devil Reward
        else if (outcome === 'DEATH') {
            setLives(0);
            setGameState(GAME_STATES.SUMMARY);
            return; 
        }
    }

    // Clear the encounter type so it doesn't persist
    setEncounterType(null);

    setGameState(GAME_STATES.TRANSITION);
    setTimeout(() => {
        pickNextMinigame();
        setGameState(GAME_STATES.PLAYING);
    }, 1500);

  }, [scoreManager, pickNextMinigame, round, encounterType]);

  return {
    gameState,
    lives,
    round,
    score: scoreManager.score,
    multiplier: scoreManager.multiplier,
    passiveRate: scoreManager.passiveRate,
    currentZone: scoreManager.currentZone,
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