// src/utils/arcadeScoringUtils.js

/**
 * MASTER SCORING CONFIGURATION
 * Defines the three zones of the game.
 */
const SCORING_ZONES = {
  ACCELERATION: { maxRound: 30, name: 'ACCELERATION' }, // 1-30: Fast Start
  RESISTANCE: { maxRound: 50, name: 'RESISTANCE' },     // 31-50: The Fire/Slog
  OVERCHARGE: { maxRound: 75, name: 'OVERCHARGE' }      // 51-75: The Explosion
};

/**
 * Calculates the Base Points, Multiplier, and Passive Rate for a specific round.
 * Includes the "Variance" randomization so numbers aren't identical every run.
 */
export const calculateRoundRewards = (round) => {
  let rawBase = 0;
  let multiplierGrowth = 0;
  let passiveRate = 0;
  let zone = '';

  // --- ZONE 1: ACCELERATION (Rounds 1-30) ---
  if (round <= SCORING_ZONES.ACCELERATION.maxRound) {
    zone = SCORING_ZONES.ACCELERATION.name;
    // Exponential Growth
    rawBase = 150 * Math.pow(1.12, round);
    // Standard Multiplier (+0.3)
    multiplierGrowth = 1.0 + (round * 0.3);
    // Standard Passive
    passiveRate = 1.5 * Math.pow(round, 2);
  } 
  
  // --- ZONE 2: RESISTANCE / FIRE (Rounds 31-50) ---
  else if (round <= SCORING_ZONES.RESISTANCE.maxRound) {
    zone = SCORING_ZONES.RESISTANCE.name;
    
    // Calculate Anchor Points at Round 30
    const baseR30 = 150 * Math.pow(1.12, 30); 
    const multR30 = 1.0 + (30 * 0.3);

    // Linear Base Growth (The Slog)
    rawBase = baseR30 + ((round - 30) * 200);
    
    // Slowed Multiplier (+0.15)
    multiplierGrowth = multR30 + ((round - 30) * 0.15);
    
    // BUFFED PASSIVE (1.25x) to help survive the "Fire"
    passiveRate = (1.5 * Math.pow(round, 2)) * 1.25; 
  } 
  
  // --- ZONE 3: OVERCHARGE (Rounds 51+) ---
  else {
    zone = SCORING_ZONES.OVERCHARGE.name;
    
    // Calculate Anchors
    const baseR30 = 150 * Math.pow(1.12, 30);
    const baseR50 = baseR30 + (20 * 200);
    const multR30 = 1.0 + (30 * 0.3);
    const multR50 = multR30 + (20 * 0.15);

    // Return to Exponential + Double Speed Multiplier (+0.6)
    rawBase = baseR50 * Math.pow(1.05, (round - 50));
    multiplierGrowth = multR50 + ((round - 50) * 0.6);
    passiveRate = 1.5 * Math.pow(round, 2);
  }

  // --- VARIANCE POOL (The Fun Factor) ---
  // Randomizes the reward between 85% and 120% of the calculated math
  // This makes every run feel slightly different.
  const variance = 0.85 + (Math.random() * 0.35); 
  const finalBasePoints = Math.max(50, Math.round(rawBase * variance));

  return {
    basePoints: finalBasePoints,
    targetMultiplier: parseFloat(multiplierGrowth.toFixed(1)),
    passivePerSec: Math.round(passiveRate),
    zone: zone
  };
};

/**
 * BOSS SCORING LOGIC
 * Calculates the Boss Jackpot based on the current economy.
 * * Strategy: Relative Scaling
 * Instead of a separate formula, we take the current round's "Base Value"
 * and multiply it by a "Boss Factor" (e.g., 8x).
 * This ensures Bosses always scale perfectly with the difficulty curves.
 */
export const calculateBossScore = (round, currentMultiplier) => {
    // 1. Get what a normal round is worth right now
    const { basePoints } = calculateRoundRewards(round);

    // 2. Define the "Boss Factor" (How many rounds is a boss worth?)
    // We use 8x to make it feel like a massive Jackpot.
    const BOSS_FACTOR = 8;

    // 3. Calculate Raw Boss Score
    // (Base * BossFactor * CurrentMultiplier)
    const rawBossScore = basePoints * BOSS_FACTOR * currentMultiplier;

    // 4. Add Variance (0.9 to 1.5)
    // Bosses have high variance so sometimes you get a "MEGA JACKPOT"
    const variance = 0.9 + (Math.random() * 0.6);

    return Math.floor(rawBossScore * variance);
};