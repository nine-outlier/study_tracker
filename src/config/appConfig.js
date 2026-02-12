export const config = {
  MASTERY_LABELS: {
    'Critical': 'Critical', 'Weak': 'Weak', 'Developing': 'Developing',
    'Strong': 'Strong', 'Mastered': 'Mastered'
  },
  PASSING_SCORE: 80,
  MIN_ATTEMPTS_FOR_MASTERY: 2,
  MASTERY_AVG_THRESHOLD: 70,
  MASTERY_LATEST_SCORE_THRESHOLD: 90,
  TEST_TYPES: {
    miniQuiz: "Mini Quiz",
    officialQuiz: "Official Quiz",
    miniTest: "Mini Test",
    practiceTest: "Practice Test",
  },
  ALL_DOMAINS_KEY: "[All Domains (Overall Score)]",
  UNCATEGORIZED_KEY: "[Uncategorized Data]"
};

// INITIAL DATA STATE
// Set to empty {} so no "ghost" certifications appear by default.
// Users must add them via the Create Tool (Premade tab).
export const allExamData = {};

export const LOCAL_STORAGE_KEY = 'certTrackerData';
export const SETTINGS_STORAGE_KEY = 'certTrackerSettings';

export const DEFAULT_SETTINGS = {
  useAccessibleFont: false,
  reduceMotion: false,
  maxWidth: 'max-w-7xl', 
  colorblindMode: false,
  darkMode: false,
  theme: 'system',
  quickLoad: false,
  autoExpand: false,
  
  // Defaults for new features
  useWeightedAverages: false,
  weights: { miniQuiz: 1, officialQuiz: 3, miniTest: 2, practiceTest: 5 },
  trendFilter: { miniQuiz: true, officialQuiz: true, miniTest: true, practiceTest: true },
  overviewConfig: {
    showDomain: true,
    showMastery: true,
    combineCharts: false,
    showHistory: false,
    showPriority: false,
    showStudyLog: false,
  }
};

// Centralized definition for Premade Content
// This ensures App.jsx creates the exact domains that QuizApp uses.
export const PREMADE_DATA = {
  network_plus: {
    id: 'network_plus',
    name: 'CompTIA Network+',
    short: 'Network+',
    domains: [
      "Networking Fundamentals",
      "Wireless Networking",
      "Network Management",
      "Security Principles",
      "Threats & Attacks",
      "Cryptography",
      "IAM & Admin"
    ]
  }
};