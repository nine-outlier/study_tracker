import { useCallback, useRef } from 'react';
import { RNG_TABLES } from '../config/arcadeRngConfig.js';

export const useArcadeRng = () => {
  // If we implement seed strings later, this ref will hold the PRNG state
  const seedRef = useRef(Math.random()); 

  // Helper: Simple roll against a threshold
  // modifiers: float (e.g., 1.35 for +35% luck)
  const roll = useCallback((threshold, modifier = 1.0) => {
    const effectiveThreshold = threshold * modifier;
    return Math.random() < effectiveThreshold;
  }, []);

  // --- Specific Checks ---

  const checkGodSeed = useCallback(() => {
    return roll(RNG_TABLES.GOD_SEED_CHANCE);
  }, [roll]);

  const checkAngelSpawn = useCallback((currentExtraLives) => {
    const chance = currentExtraLives === 0 
      ? RNG_TABLES.ANGEL_SPAWN.BASE_CHANCE 
      : RNG_TABLES.ANGEL_SPAWN.SECOND_LIFE_CHANCE;
    
    return roll(chance);
  }, [roll]);

  const determineCheckpointEncounter = useCallback(() => {
    if (roll(RNG_TABLES.CHECKPOINT_ENCOUNTER.DEVIL)) {
      // It is a Devil. Is it Golden?
      if (roll(RNG_TABLES.DEVIL_TYPE.GOLDEN)) {
        return 'GOLDEN_DEVIL';
      }
      return 'DEVIL';
    }
    return 'BOSS';
  }, [roll]);

  const resolveDevilGamble = useCallback((isGolden, luckModifier = 1.0) => {
    const winChance = isGolden 
      ? RNG_TABLES.GOLDEN_DEVIL_GAMBLE.WIN 
      : RNG_TABLES.DEVIL_GAMBLE.WIN;
      
    return roll(winChance, luckModifier);
  }, [roll]);

  // NEW: Pick a random encounter based on probability weights
  const getRandomEncounter = useCallback(() => {
    const rand = Math.random();
    let cumulative = 0;
    
    // Safety check if table is missing
    if (!RNG_TABLES.ENCOUNTER_POOL) return 'DEVIL';

    for (const [type, chance] of Object.entries(RNG_TABLES.ENCOUNTER_POOL)) {
      cumulative += chance;
      if (rand < cumulative) return type;
    }
    return 'DEVIL';
  }, []);

  return {
    checkGodSeed,
    checkAngelSpawn,
    determineCheckpointEncounter,
    resolveDevilGamble,
    getRandomEncounter
  };
};