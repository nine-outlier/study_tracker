import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateRoundRewards } from '../utils/arcadeScoring.js';

// UPDATED: Now accepts 'encounterType' to distinguish between Menus vs Boss Fights
export const useArcadeScoreManager = (gameState, currentRound, encounterType) => {
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [passiveRate, setPassiveRate] = useState(0);
  const [currentZone, setCurrentZone] = useState('ACCELERATION');

  // --- PASSIVE POINT TICKER (THE FIX) ---
  useEffect(() => {
    let interval;
    
    // LOGIC FIX: 
    // 1. Always tick during normal 'PLAYING'.
    // 2. ONLY tick during 'ENCOUNTER' if it is a 'BOSS'. 
    //    (Pauses for Angel, Devil, Merchant, etc.)
    const isBossFight = (gameState === 'ENCOUNTER' && encounterType === 'BOSS');
    const isPlaying = (gameState === 'PLAYING');

    if (isPlaying || isBossFight) {
      interval = setInterval(() => {
        if (passiveRate > 0) {
          setScore(prev => prev + passiveRate);
        }
      }, 1000); // Tick every second
    }
    
    return () => clearInterval(interval);
  }, [gameState, passiveRate, encounterType]); // Added encounterType dependency

  // --- CALCULATE RATES FOR NEW ROUND ---
  useEffect(() => {
    const stats = calculateRoundRewards(currentRound);
    setPassiveRate(stats.passivePerSec);
    setCurrentZone(stats.zone);
  }, [currentRound]);

  // --- ACTIONS ---

  const addScore = useCallback((amount) => {
    setScore(prev => Math.floor(prev + (amount * multiplier)));
  }, [multiplier]);

  const addRawScore = useCallback((amount) => {
    setScore(prev => Math.floor(prev + amount));
  }, []);

  const incrementMultiplier = useCallback(() => {
    const stats = calculateRoundRewards(currentRound);
    setMultiplier(stats.targetMultiplier);
  }, [currentRound]);

  const resetMultiplier = useCallback(() => {
    setMultiplier(1.0);
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
    setMultiplier(1.0);
    setPassiveRate(0);
  }, []);

  // Helpers for God Mode / Encounters
  const setMultiplierDirect = useCallback((val) => {
      setMultiplier(val);
  }, []);

  const multiplyMultiplier = useCallback((factor) => {
      setMultiplier(prev => parseFloat((prev * factor).toFixed(1)));
  }, []);
  
  const multiplyScore = useCallback((factor) => {
      setScore(prev => Math.floor(prev * factor));
  }, []);

  return {
    score,
    multiplier,
    passiveRate,
    currentZone, 
    addScore,
    addRawScore,
    setMultiplier: setMultiplierDirect, 
    multiplyMultiplier,
    multiplyScore,
    incrementMultiplier,
    resetMultiplier,
    resetScore
  };
};