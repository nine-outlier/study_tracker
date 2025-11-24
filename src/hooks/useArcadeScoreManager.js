import { useState, useEffect, useCallback, useRef } from 'react';
import { ARCADE_CONFIG } from '../config/arcadeConfig';
import { calculatePassiveTick } from '../utils/arcadeMath';

export const useArcadeScoreManager = (gameState) => {
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(ARCADE_CONFIG.STARTING_MULTIPLIER);
  const [highScore, setHighScore] = useState(0); // Could load from persistent storage

  // Passive Score Ticker
  useEffect(() => {
    let interval;
    if (gameState === 'PLAYING') {
      interval = setInterval(() => {
        setScore(prev => prev + calculatePassiveTick(prev));
      }, ARCADE_CONFIG.PASSIVE_SCORE_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Check for 15x Multiplier Unlock (Gold Theme)
  useEffect(() => {
    if (score >= ARCADE_CONFIG.THRESHOLDS.GOLD_THEME && multiplier < ARCADE_CONFIG.GOLD_MODE_MULTIPLIER) {
      setMultiplier(ARCADE_CONFIG.GOLD_MODE_MULTIPLIER);
    }
  }, [score, multiplier]);

  const addScore = useCallback((amount) => {
    setScore(prev => prev + Math.floor(amount * multiplier));
  }, [multiplier]);

  const incrementMultiplier = useCallback(() => {
    // Don't increment if we are already in Gold Mode (locked at 15x)
    if (multiplier >= ARCADE_CONFIG.GOLD_MODE_MULTIPLIER) return;

    setMultiplier(prev => Math.min(prev + ARCADE_CONFIG.MULTIPLIER_GROWTH_RATE, ARCADE_CONFIG.MAX_NORMAL_MULTIPLIER));
  }, [multiplier]);

  const resetScore = useCallback(() => {
    setScore(0);
    setMultiplier(ARCADE_CONFIG.STARTING_MULTIPLIER);
  }, []);

  // Handle Devil Sacrifices (percentage loss)
  const sacrificeScore = useCallback((percent) => {
    setScore(prev => Math.floor(prev * (1 - percent)));
  }, []);

  return {
    score,
    multiplier,
    highScore,
    addScore,
    incrementMultiplier,
    resetScore,
    sacrificeScore
  };
};