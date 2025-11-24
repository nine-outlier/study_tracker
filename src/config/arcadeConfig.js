export const ARCADE_CONFIG = {
  // --- CORE SETTINGS ---
  INITIAL_LIVES: 3,
  MAX_EXTRA_LIVES: 2, // Cap on Angel hearts
  GAME_TICK_RATE: 100, // ms (10 ticks per second)
  
  // --- SCORING ---
  BASE_SCORE_PER_ENEMY: 475,
  PASSIVE_SCORE_INTERVAL: 1000, // 1 second
  PASSIVE_SCORE_PER_10K: 10,    // +10 points per 10k current score
  
  // --- MULTIPLIERS ---
  STARTING_MULTIPLIER: 1.0,
  MAX_NORMAL_MULTIPLIER: 10.0,
  GOLD_MODE_MULTIPLIER: 15.0,   // Unlocked at 2.5M
  MULTIPLIER_GROWTH_RATE: 0.1,  // How much it grows per successful mini-game
  
  // --- THRESHOLDS (The "Meta" Goals) ---
  THRESHOLDS: {
    RED_THEME: 1000000,
    GOLD_THEME: 2500000,
    LEGEND_TROPHY: 5000000,
    COUNTDOWN_START: 4000000
  },
  
  // --- TIMING ---
  MINIGAME_DURATION_BASE: 12, // Seconds
  MINIGAME_DURATION_MIN: 5,   // It gets faster over time
  BOSS_FREQUENCY: 15,         // Rounds between bosses
};

export const MINIGAME_TYPES = {
  COLOR_HERD: 'COLOR_HERD',
  COLOR_WHEEL: 'COLOR_WHEEL',
  MASH_CHASE: 'MASH_CHASE',
  PROJECTILE_DODGE: 'PROJECTILE_DODGE',
  CORNER_EXPANSION: 'CORNER_EXPANSION'
};