import { ARCADE_CONFIG } from '../config/arcadeConfig';

export const calculateEnemyScore = (basePoints, currentMultiplier) => {
  return Math.floor(basePoints * currentMultiplier);
};

export const calculatePassiveTick = (currentScore) => {
  // +10 points per 10,000 score
  const units = Math.floor(currentScore / 10000);
  return units * ARCADE_CONFIG.PASSIVE_SCORE_PER_10K;
};

export const getMinigameDuration = (roundNumber) => {
  // Difficulty Curve: Duration shrinks as rounds increase
  // Cap at minimum duration
  const decay = Math.min(roundNumber * 0.2, 5); // Lose up to 5 seconds over time
  return Math.max(
    ARCADE_CONFIG.MINIGAME_DURATION_BASE - decay,
    ARCADE_CONFIG.MINIGAME_DURATION_MIN
  );
};

export const formatScore = (score) => {
  return new Intl.NumberFormat('en-US').format(Math.floor(score));
};