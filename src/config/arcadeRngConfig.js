export const RNG_TABLES = {
  // --- ENCOUNTERS (Every 15 rounds) ---
  CHECKPOINT_ENCOUNTER: {
    BOSS: 0.70,
    DEVIL: 0.30
  },
  
  // --- DEVIL SUB-TYPES (If Devil is rolled) ---
  DEVIL_TYPE: {
    STANDARD: 0.95,
    GOLDEN: 0.05 // The "Triple or Nothing" rare event
  },

  // --- ANGEL BLESSINGS (After every mini-game) ---
  ANGEL_SPAWN: {
    BASE_CHANCE: 0.015, // 1.5%
    SECOND_LIFE_CHANCE: 0.005 // 0.5% if you already have 1 extra life
  },

  // --- GOLDEN ANGEL (Start of Run) ---
  GOD_SEED_CHANCE: 0.01, // 1% Chance to start with Golden Angel buffs

  // --- DEVIL OUTCOMES ---
  DEVIL_GAMBLE: {
    WIN: 0.50,
    DEATH: 0.50
  },
  
  GOLDEN_DEVIL_GAMBLE: {
    WIN: 0.30, // Triple score
    DEATH: 0.70
  }
};