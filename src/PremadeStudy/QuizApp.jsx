import React, { useState, useEffect, useRef } from 'react';
import { useData } from "../state/DataProvider";

// Helper to resolve domain metadata (code/name)
const getDomainMeta = (identifier, domainMap = {}) => {
  // 1. Try direct lookup in the provided map
  if (domainMap && domainMap[identifier]) {
    return domainMap[identifier];
  }

  // 2. Try to find by iterating values if identifier is a name
  if (domainMap) {
    const found = Object.values(domainMap).find(d => d.name === identifier || d.code === identifier);
    if (found) return found;
  }

  // 3. Heuristic fallback: if identifier looks like "1.2", treat as code
  if (/^\d+(\.\d+)?$/.test(identifier)) {
    return { code: identifier, name: `Domain ${identifier}` };
  }

  // 4. Default fallback
  return { code: '0.0', name: identifier };
};

// Helper to group domains for the advanced filter
const groupDomains = (availableDomains, allQuestions, domainMap) => {
  const groups = {};

  availableDomains.forEach(domain => {
    const meta = getDomainMeta(domain, domainMap);
    const major = meta.code.split('.')[0]; // "1.2" -> "1"
    
    if (!major || major === '0') {
       // Group unclassified or unknown items
       const key = 'Misc';
       if (!groups[key]) groups[key] = { id: '99', title: 'Miscellaneous', children: [] };
       groups[key].children.push({ original: domain, ...meta });
       return;
    }

    if (!groups[major]) {
      groups[major] = {
        id: major,
        // If we have a domain map, try to find the parent name, else generic
        title: `Domain ${major}`, 
        children: []
      };
    }
    
    groups[major].children.push({
        original: domain,
        code: meta.code,
        name: meta.name
    });
  });

  // Sort by ID
  return Object.values(groups).sort((a, b) => parseInt(a.id) - parseInt(b.id));
};

const animationStyles = `
  @keyframes fadeIn { 
    from { opacity: 0; } 
    to { opacity: 1; } 
  }
  @keyframes slideUp { 
    from { transform: translateY(30px); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
  }
  @keyframes popIn { 
    0% { transform: scale(0.5); opacity: 0; } 
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; } 
  }
  @keyframes slideInRight { 
    from { transform: translateX(40px); opacity: 0; } 
    to { transform: translateX(0); opacity: 1; } 
  }
  
  .anim-fade-in { animation: fadeIn 0.8s ease-out forwards; }
  .anim-slide-up { animation: slideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  .anim-pop-in { animation: popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
  .anim-slide-right { animation: slideInRight 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  
  /* Smooth color transitions for everything */
  * {
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, height, padding, width, max-width, grid-template-columns;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 400ms;
  }
  
  /* Override for buttons - still responsive but visible */
  button {
    transition-duration: 250ms;
  }
  
  /* Progress bar gets extra smooth animation */
  [style*="width"] {
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  @keyframes borderPulse {
    0%, 100% { 
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: inset 0 0 60px rgba(99, 102, 241, 0.05), 0 0 30px rgba(99, 102, 241, 0.2);
    }
    50% { 
      border-color: rgba(99, 102, 241, 0.7);
      box-shadow: inset 0 0 60px rgba(99, 102, 241, 0.15), 0 0 50px rgba(99, 102, 241, 0.4);
    }
  }
  
  .smart-border-animate {
    animation: borderPulse 3s ease-in-out infinite;
  }
`;

// --- ICONS ---
const ReturnIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l-4-4 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h9a5 5 0 010 10h-1" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const RocketIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const SquircleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="6" />
  </svg>
);

const ListTreeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowsExpandIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

// --- STORAGE MANAGER ---
const Storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage Error', e);
    }
  },
  remove: (key) => localStorage.removeItem(key),
};

const QuizApp = ({ 
  onClose, 
  questions, 
  globalBank = {}, 
  glossary = [], 
  title = 'Quiz Mode', 
  appSettings = {},
  // ADD PROP: Dynamic domain map (passed from parent data file)
  domainMap = {},
  certId = 'network_plus' 
}) => {  
  const { dispatch } = useData();

  // --- STATE ---
  const [gameState, setGameState] = useState('intro'); // intro, playing, results, stats
  const [previousScreen, setPreviousScreen] = useState('intro'); // remembers where Stats was opened from
  const [isSmartMode, setIsSmartMode] = useState(false); // UI-only flag
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  // Question Pool
  const [allQuestions, setAllQuestions] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState([]);

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false); // floating panel
  const [customCountInput, setCustomCountInput] = useState('10');
  
  // New: View Mode for filtering
  const [filterViewMode, setFilterViewMode] = useState('grid'); // 'grid' (default) | 'tree' (hierarchical)
  const [expandedGroups, setExpandedGroups] = useState({}); // For tree view

  // Explanation State
  const [viewedExplanationOption, setViewedExplanationOption] = useState(null); // Keeps track of which explanation is shown
  const [explanationExpanded, setExplanationExpanded] = useState(false); // Controls the bubble expansion
  const EXPLANATION_POS = 'bottom'; // 'bottom' (default) | 'right'

  // Analytics
  const quizStartTime = useRef(null);
  const questionStartTime = useRef(null);
  const quizSessionLog = useRef(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStats, setQuizStats] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  
  // Refs for focus management
  const optionsContainerRef = useRef(null);

  // --- HELPER LOGIC (MOVED TO utils, but kept component-specific logic here) ---
  const getPrimaryDomainForTagFromProfile = (tagStat) => {
    const doms = tagStat?.domains || null;
    if (!doms) return null;

    let best = null;
    let bestT = -1;
    for (const [dom, v] of Object.entries(doms)) {
      const t = v?.t ?? 0;
      if (t > bestT) {
        bestT = t;
        best = dom;
      }
    }
    return best;
  };

  const inferPrimaryDomainForTagFromQuestions = (tagName, questions) => {
    if (!tagName || !Array.isArray(questions) || questions.length === 0) return null;

    const counts = {};
    for (const q of questions) {
      const tags = Array.isArray(q.tags) ? q.tags : [];
      if (tags.includes(tagName)) {
        const d = q.domain || 'Unknown';
        counts[d] = (counts[d] || 0) + 1;
      }
    }

    let best = null;
    let bestCount = -1;
    for (const [dom, c] of Object.entries(counts)) {
      if (c > bestCount) {
        bestCount = c;
        best = dom;
      }
    }
    return best;
  };

  const renderQuestionWithGlossary = (text) => {
    if (!glossary || glossary.length === 0) return text;
    
    // Sort by length (longest first)
    const sortedTerms = [...glossary].sort((a, b) => b.term.length - a.term.length);
    
    let parts = [{ text, isMatch: false }];
    
    sortedTerms.forEach(item => {
      const newParts = [];
      parts.forEach(part => {
        if (part.isMatch) {
          newParts.push(part);
          return;
        }
        
        const regex = new RegExp(`(\\b${item.term}\\b)`, 'gi');
        const segments = part.text.split(regex);
        
        segments.forEach((segment, i) => {
          if (i % 2 === 0) {
            if (segment) newParts.push({ text: segment, isMatch: false });
          } else {
            newParts.push({ 
              text: segment, 
              isMatch: true, 
              term: item.term || item.name,
              definition: item.def || item.desc || item.definition 
            });
          }
        });
      });
      parts = newParts;
    });
    
    // Render JSX
    return (
      <span>
        {parts.map((part, idx) => 
          part.isMatch ? (
            <span
              key={idx}
              className="relative cursor-help border-b-2 border-dotted border-[var(--app-primary)] text-[var(--app-primary)] font-semibold"
              onMouseEnter={() => setActiveTooltip({ term: part.term, definition: part.definition, id: idx })}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip(prev => prev?.id === idx ? null : { term: part.term, definition: part.definition, id: idx })}
            >
              {part.text}
              {activeTooltip?.id === idx && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[var(--app-bg-surface)] border-2 border-[var(--app-primary)] rounded-lg shadow-xl text-sm text-[var(--app-text-main)] font-normal anim-pop-in">
                  <div className="font-bold text-[var(--app-primary)] mb-1">{part.term}</div>
                  <div className="text-[var(--app-text-muted)]">{part.definition}</div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[var(--app-primary)]"></div>
                </div>
              )}
            </span>
          ) : (
            <span key={idx}>{part.text}</span>
          )
        )}
      </span>
    );
  };

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg-page)]';

  // --- INITIALIZATION ---
  useEffect(() => {
    const sourceQuestions = questions && questions.length > 0 ? questions : [];      
    if (sourceQuestions.length > 0) {
      setAllQuestions(sourceQuestions);
      const domains = [...new Set(sourceQuestions.map((q) => q.section || q.domain))];
      setAvailableDomains(domains);
      setSelectedDomains(domains);
    }

    // CHECK FOR ABANDONED SESSIONS (only on mount/questions change)
    const lastSession = Storage.get('active_quiz_session');
    if (lastSession) {
      const abandonedLog = {
        date: new Date().toISOString(),
        reason: 'Premature Exit',
        lastQuestionIndex: lastSession.lastIndex,
        domain: lastSession.currentDomain || 'Unknown',
      };
      const profile = Storage.get('user_mastery_v2') || { abandoned: [] };
      profile.abandoned = [...(profile.abandoned || []), abandonedLog];
      Storage.set('user_mastery_v2', profile);
      Storage.remove('active_quiz_session');
    }
  }, [questions]);

  // Close advanced panel on Escape
  useEffect(() => {
    if (!showAdvanced) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowAdvanced(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAdvanced]);

  // Global Keyboard Shortcuts for Explanation Expansion
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const activeQ = activeQuestions[currentQuestionIndex];
    const isAnswered = activeQ && !!userAnswers[activeQ.id];

    if (!isAnswered) return;

    const handleGlobalKeyDown = (e) => {
      // Toggle on Shift
      if (e.key === 'Shift') {
        // e.preventDefault(); // Optional
        setExplanationExpanded(prev => !prev);
      }
      
      // Toggle on Space (if not focused on interactive element)
      if (e.key === ' ') {
        const activeTag = document.activeElement?.tagName;
        // Don't toggle if focusing button (Next Question), input, or link
        if (activeTag !== 'BUTTON' && activeTag !== 'INPUT' && activeTag !== 'TEXTAREA' && activeTag !== 'A') {
           e.preventDefault(); // Prevent page scroll
           setExplanationExpanded(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, currentQuestionIndex, activeQuestions, userAnswers]);

  // IMPORTANT: when navigating to a new screen, close the Advanced Options panel
  useEffect(() => {
    setShowAdvanced(false);
  }, [gameState]);

  // Auto-expand effect
  useEffect(() => {
    const currentQ = activeQuestions[currentQuestionIndex];
    const isAnswered = currentQ && !!userAnswers[currentQ.id];
    
    if (isAnswered) {
        const savedSettings = Storage.get('app_settings') || {};
        const effectiveAutoExpand = appSettings.autoExpand ?? savedSettings.autoExpand ?? false;
        
        setExplanationExpanded(effectiveAutoExpand);
    }
  }, [currentQuestionIndex, userAnswers, appSettings.autoExpand, activeQuestions]);

  const goToStats = () => {
    setPreviousScreen(gameState);
    setGameState('stats');
  };

  const returnFromStats = () => {
    if (previousScreen === 'results') setGameState('results');
    else setGameState('intro');
    setExplanationExpanded(false);
  };

  const markAbandonedIfNeeded = () => {
    const lastSession = Storage.get('active_quiz_session');
    if (!lastSession) return;

    const abandonedLog = {
      date: new Date().toISOString(),
      reason: 'Returned to Menu',
      lastQuestionIndex: lastSession.lastIndex,
      domain: lastSession.currentDomain || 'Unknown',
    };

    const profile = Storage.get('user_mastery_v2') || { abandoned: [] };
    profile.abandoned = [...(profile.abandoned || []), abandonedLog];
    Storage.set('user_mastery_v2', profile);
    Storage.remove('active_quiz_session');
  };

  const handleReturnToIntro = () => {
    if (gameState === 'playing') {
      markAbandonedIfNeeded();
    }

    setGameState('intro');
    setQuizStats(null);
    setActiveQuestions([]);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setViewedExplanationOption(null); // Reset explanation view
    setExplanationExpanded(false);
    setScore(0);
    setIsSmartMode(false);
    // keep selectedDomains + customCountInput so options persist
  };

  // Replace [placeholders] with random values from global/local banks
  const replacePlaceholders = (text, localBank = {}, useVariants = true) => {
    if (!text) return text;
    
    // Merge global and local banks (local overrides global)
    const mergedBank = { ...globalBank, ...localBank };
    
    // Find all [placeholder] patterns and replace them
    return text.replace(/\[(\w+)\]/g, (match, key) => {
      const options = mergedBank[key];
      if (Array.isArray(options) && options.length > 0) {
        // If useVariants is false, always use the master term (index 0)
        if (!useVariants) {
          return options[0];
        }
        // Otherwise, pick randomly from all options
        return options[Math.floor(Math.random() * options.length)];
      }
      return match; // Return original if no replacement found
    });
  };

  // --- ENGINE LOGIC ---
  const handleStartQuiz = (mode = 'standard') => {
    setIsSmartMode(mode === 'smart');

    // ALWAYS APPLY SETTINGS
    const domainsToUse = selectedDomains.length > 0 ? selectedDomains : availableDomains;

    const countRequested = parseInt(customCountInput, 10);
    const countToUse = Number.isFinite(countRequested) ? countRequested : 10;

    const domainFiltered = allQuestions.filter((q) => {
      const questionIdentifier = q.section || q.domain;
      return domainsToUse.includes(questionIdentifier);
    });      
    
    const shuffledQuestions = [...domainFiltered].sort(() => 0.5 - Math.random());
    const actualCount = Math.min(Math.max(1, countToUse), shuffledQuestions.length);
    const gameSet = shuffledQuestions.slice(0, actualCount);

    if (gameSet.length === 0) return;

    // Transform variant-based questions into runtime questions
    const questionsWithShuffledOptions = gameSet.map((q) => {
      // Pick random variant for question text and replace placeholders
      const rawQuestionText = Array.isArray(q.variants) 
        ? q.variants[Math.floor(Math.random() * q.variants.length)]
        : q.variants || 'Question text missing';
      
      const questionText = replacePlaceholders(rawQuestionText, q.localBank);

      // Shuffle answer options and pick random variant for each
      const shuffledAnswers = [...(q.answerOptions || [])].sort(() => 0.5 - Math.random());
      
      const options = [];
      const optionExplanations = {}; // Store explanations mapped to option text

      shuffledAnswers.forEach(opt => {
        const rawText = Array.isArray(opt.variants) 
          ? opt.variants[Math.floor(Math.random() * opt.variants.length)]
          : opt.variants || 'Option missing';
        
        const text = replacePlaceholders(rawText, q.localBank);
        const explanation = replacePlaceholders(opt.explanation || 'No explanation available', q.localBank);
        
        options.push(text);
        // Map this specific option text to its specific explanation
        optionExplanations[text] = explanation;      
      });

      const correctAnswerObj = shuffledAnswers.find(opt => opt.correct);
      // We calculate this just for data integrity, but will use optionExplanations for display
      const correctAnswer = correctAnswerObj && Array.isArray(correctAnswerObj.variants)
        ? options.find(o => correctAnswerObj.variants.includes(o)) || '' // Find the actual string used
        : correctAnswerObj?.variants || '';

      // Fallback explanation (usually for the correct answer)
      const explanation = correctAnswerObj?.explanation || 'No explanation available';

      return {
        ...q,
        question: questionText,
        options,
        optionExplanations, // NEW: Pass the map of explanations
        correctAnswer,
        explanation
      };
    });

    setActiveQuestions(questionsWithShuffledOptions);

    const now = Date.now();
    quizStartTime.current = now;
    questionStartTime.current = now;

    quizSessionLog.current = {
      sessionId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      startTime: new Date(now).toISOString(),
      totalQuestions: questionsWithShuffledOptions.length,
      history: [],
    };

    Storage.set('active_quiz_session', {
      start: now,
      lastIndex: 0,
      currentDomain: questionsWithShuffledOptions[0].domain,
    });

    setScore(0);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setViewedExplanationOption(null);
    setExplanationExpanded(false);
    setQuizStats(null);
    setGameState('playing');
  };

  const updateDeepMastery = (question, isCorrect) => {
    let profile = Storage.get('user_mastery_v2') || {};

    if (!profile.domains) profile.domains = {};
    if (!profile.tags) profile.tags = {};
    if (!profile.questions) profile.questions = {};
    if (!profile.global)
      profile.global = { totalCorrect: 0, totalQuestions: 0, totalTime: 0, sessions: 0 };

    // Domains
    if (!profile.domains[question.domain]) profile.domains[question.domain] = { c: 0, t: 0 };
    profile.domains[question.domain].t++;
    if (isCorrect) profile.domains[question.domain].c++;

    // Tags (+ per-domain for topic insights)
    if (question.tags && Array.isArray(question.tags)) {
      question.tags.forEach((tag) => {
        if (!profile.tags[tag]) profile.tags[tag] = { c: 0, t: 0, domains: {} };
        profile.tags[tag].t++;
        if (isCorrect) profile.tags[tag].c++;

        if (!profile.tags[tag].domains) profile.tags[tag].domains = {};
        if (!profile.tags[tag].domains[question.domain])
          profile.tags[tag].domains[question.domain] = { c: 0, t: 0 };

        profile.tags[tag].domains[question.domain].t++;
        if (isCorrect) profile.tags[tag].domains[question.domain].c++;
      });
    }

    // Questions
    if (!profile.questions[question.id]) profile.questions[question.id] = { seen: 0, wrong: 0 };
    profile.questions[question.id].seen++;
    if (!isCorrect) profile.questions[question.id].wrong++;

    Storage.set('user_mastery_v2', profile);
  };

  const handleAnswerSelect = (selectedOption) => {
    const now = Date.now();
    const currentQ = activeQuestions[currentQuestionIndex];
    const timeTakenMs = now - questionStartTime.current;
    const isCorrect = selectedOption === currentQ.correctAnswer;

    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: selectedOption }));
    setViewedExplanationOption(selectedOption);
    // Automatically show explanation for selected option
    
    // Auto-expand based on setting (Priority: Prop -> LocalStorage -> Default False)
    const savedSettings = Storage.get('app_settings') || {};
    const effectiveAutoExpand = appSettings.autoExpand ?? savedSettings.autoExpand ?? false;

    if (effectiveAutoExpand) {
        setExplanationExpanded(true);
    }
    
    if (isCorrect) setScore((prev) => prev + 1);

    const answerLog = {
      questionId: currentQ.id,
      domain: currentQ.domain,
      section: currentQ.section,
      tags: currentQ.tags,
      isCorrect,
      timeTakenMs,
      timestamp: now,
    };

    if (quizSessionLog.current) quizSessionLog.current.history.push(answerLog);

    updateDeepMastery(currentQ, isCorrect);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setViewedExplanationOption(null); // Reset explanation view
      setExplanationExpanded(false); // Reset expansion
      questionStartTime.current = Date.now();

      Storage.set('active_quiz_session', {
        start: quizStartTime.current,
        lastIndex: nextIdx,
        currentDomain: activeQuestions[nextIdx].domain,
      });
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    Storage.remove('active_quiz_session');

    const now = Date.now();
    const duration = now - quizStartTime.current;

    const history =
      quizSessionLog.current && quizSessionLog.current.history ? quizSessionLog.current.history : [];

    let profile = Storage.get('user_mastery_v2') || {};
    if (!profile.global)
      profile.global = { totalCorrect: 0, totalQuestions: 0, totalTime: 0, sessions: 0 };

    profile.global.sessions++;
    profile.global.totalQuestions += history.length;
    profile.global.totalCorrect += history.filter((h) => h.isCorrect).length;
    profile.global.totalTime += duration;
    Storage.set('user_mastery_v2', profile);

    const correctCount = history.filter((h) => h.isCorrect).length;
    const totalCount = history.length;
    const totalTimeMs = history.reduce((acc, curr) => acc + curr.timeTakenMs, 0);
    const avgTimeMs = totalCount > 0 ? totalTimeMs / totalCount : 0;

    const domainMap = {};
    history.forEach((h) => {
      if (!domainMap[h.domain]) domainMap[h.domain] = { total: 0, correct: 0 };
      domainMap[h.domain].total += 1;
      if (h.isCorrect) domainMap[h.domain].correct += 1;
    });

    // 4. PREPARE THE DATA PACKAGE
    const processedStats = {
      correctCount,
      totalCount,
      percentage: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
      avgTimeSeconds: (avgTimeMs / 1000).toFixed(1),
      domains: Object.keys(domainMap).map((d) => ({
        name: d,
        correct: domainMap[d].correct,
        total: domainMap[d].total,
        score: Math.round((domainMap[d].correct / domainMap[d].total) * 100),
      })),
    };

    // 5. DISPATCH TO MAIN APP
    // This creates the "Network+" card on the dashboard if it doesn't exist
    // and adds this specific quiz result to the trend charts.
    const testResult = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      date: new Date().toISOString(),
      label: isSmartMode ? 'Smart Quiz' : 'Quick Quiz',
      type: 'officialQuiz', // Changed from practiceTest to officialQuiz per request
      domains: domainMap,
      source: 'quiz', // ✅ Added to distinguish from manual entry
    };

    try {
        if (dispatch) {
             dispatch({
                type: 'ADD_TEST_RESULT',
                payload: { certId: certId, testData: testResult }
            });
        }
    } catch (e) {
        console.warn("Integration Warning: Could not save to main tracker", e);
    }

    setScore(correctCount);
    setQuizStats(processedStats);
    setGameState('results');
  };

  // --- KEYBOARD NAVIGATION HELPERS ---
  const handleOptionKeyDown = (e, index) => {
    if (!optionsContainerRef.current) return;
    const buttons = Array.from(optionsContainerRef.current.querySelectorAll('button:not([disabled])'));
    if (!buttons.length) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % buttons.length;
      buttons[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + buttons.length) % buttons.length;
      buttons[prevIndex]?.focus();
    }
  };

  const handleBubbleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Shift') {
      e.preventDefault();
      setExplanationExpanded(prev => !prev);
    }
  };

  // --- ADVANCED OPTIONS PANEL (GLOBAL) ---
  const renderAdvancedPanel = () => {
    if (!showAdvanced) return null;

    const filteredMax = Math.max(
      1,
      allQuestions.filter((q) => selectedDomains.includes(q.section || q.domain)).length
    );

    // PASS DOMAIN MAP TO HELPERS
    const domainGroups = groupDomains(availableDomains, allQuestions, domainMap);

    const toggleGroup = (group) => {
        const childValues = group.children.map(c => c.original);
        const allSelected = childValues.every(val => selectedDomains.includes(val));
        
        if (allSelected) {
            setSelectedDomains(prev => prev.filter(d => !childValues.includes(d)));
        } else {
            setSelectedDomains(prev => {
                const newSet = new Set([...prev, ...childValues]);
                return Array.from(newSet);
            });
        }
    };

    const toggleSingleDomain = (d) => {
        setSelectedDomains(prev => 
            prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
        );
    };

    return (
      <div className="fixed top-24 right-6 z-50 w-[22rem] max-w-[92vw] font-sans antialiased anim-pop-in">
        <div className="bg-[var(--app-bg-surface)] rounded-2xl border border-[var(--app-border)] shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-4 border-b border-[var(--app-border)]">
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--app-text-subtle)]">
                Advanced Options
              </div>
              <div className="text-[12px] text-[var(--app-text-muted)] mt-1">
                Settings apply even after closing.
              </div>
            </div>
            <button
              onClick={() => setShowAdvanced(false)}
              className={`p-2 rounded-lg text-[var(--app-text-subtle)] hover:text-[var(--app-text-main)] hover:bg-[var(--app-bg-highlight)] ${focusRing} transition-colors duration-200`}
              aria-label="Close advanced options"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-5 text-left max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
            {/* Domains */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                  Filter Domains
                </label>
                <div className="flex items-center gap-2">
                    {/* View Toggle Button */}
                    <button
                        onClick={() => setFilterViewMode(prev => prev === 'grid' ? 'tree' : 'grid')}
                        className={`p-1 rounded hover:bg-[var(--app-bg-highlight)] text-[var(--app-text-subtle)] transition-colors`}
                        title={filterViewMode === 'grid' ? "Switch to List View" : "Switch to Grid View"}
                    >
                        {filterViewMode === 'grid' ? <ListTreeIcon /> : <SquircleIcon />}
                    </button>
                    <div className="w-px h-3 bg-[var(--app-border)] mx-1"></div>
                    <button
                        onClick={() => setSelectedDomains(availableDomains)}
                        className={`text-[10px] text-[var(--app-primary)] font-semibold hover:underline ${focusRing} rounded`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setSelectedDomains([])}
                        className={`text-[10px] text-[var(--app-text-subtle)] hover:underline ${focusRing} rounded`}
                    >
                        None
                    </button>
                </div>
              </div>

              {/* DOMAIN SELECTOR - GRID VIEW (DEFAULT) */}
              {filterViewMode === 'grid' && (
                  <div className="flex flex-wrap gap-2">
                    {domainGroups.map((group) => {
                      const childValues = group.children.map(c => c.original);
                      const isFullySelected = childValues.length > 0 && childValues.every(val => selectedDomains.includes(val));
                      const isPartiallySelected = childValues.some(val => selectedDomains.includes(val)) && !isFullySelected;

                      return (
                        <button
                          key={group.id}
                          onClick={() => toggleGroup(group)}
                          title={`${group.title} (Click to toggle all sub-domains)`}
                          className={`h-9 px-3 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200 border ${
                            isFullySelected
                              ? 'bg-[var(--app-primary)] text-[var(--app-text-on-primary)] border-[var(--app-primary)] shadow-sm'
                              : isPartiallySelected
                                ? 'bg-[var(--app-bg-surface)] text-[var(--app-primary)] border-[var(--app-primary)] border-dashed'
                                : 'bg-[var(--app-bg-highlight)] text-[var(--app-text-muted)] border-[var(--app-border)] hover:bg-[var(--app-border)]'
                          } ${focusRing}`}
                        >
                          <span className="font-mono">{group.id}.0</span>
                        </button>
                      );
                    })}
                  </div>
              )}

              {/* DOMAIN SELECTOR - HIERARCHICAL TREE VIEW (NEW CAPABILITY) */}
              {filterViewMode === 'tree' && (
                  <div className="space-y-2">
                      {domainGroups.map(group => {
                          const childValues = group.children.map(c => c.original);
                          const selectedCount = childValues.filter(v => selectedDomains.includes(v)).length;
                          const isFullySelected = selectedCount === childValues.length;
                          const isPartiallySelected = selectedCount > 0 && !isFullySelected;
                          const isExpanded = expandedGroups[group.id];

                          return (
                              <div key={group.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-highlight)] overflow-hidden">
                                  {/* Parent Row */}
                                  <div className="flex items-center p-2 gap-2 hover:bg-[var(--app-bg-surface)] transition-colors">
                                      <button 
                                          onClick={() => setExpandedGroups(prev => ({...prev, [group.id]: !prev[group.id]}))}
                                          className="p-1 text-[var(--app-text-subtle)] hover:text-[var(--app-text-main)] rounded"
                                      >
                                          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                      </button>
                                      
                                      <div 
                                        onClick={() => toggleGroup(group)}
                                        className="flex-1 flex items-center gap-2 cursor-pointer select-none"
                                      >
                                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                              isFullySelected ? 'bg-[var(--app-primary)] border-[var(--app-primary)]' : 
                                              isPartiallySelected ? 'bg-[var(--app-primary)] border-[var(--app-primary)]' : 
                                              'bg-[var(--app-bg-page)] border-[var(--app-text-subtle)]'
                                          }`}>
                                              {isFullySelected && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                                              {isPartiallySelected && <div className="w-2 h-0.5 bg-white rounded-full" />}
                                          </div>
                                          <div className="flex flex-col">
                                              <span className="text-xs font-semibold text-[var(--app-text-main)]">{group.title}</span>
                                              <span className="text-[10px] text-[var(--app-text-subtle)]">Domain {group.id} • {selectedCount}/{childValues.length} selected</span>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Children Row */}
                                  {isExpanded && (
                                      <div className="bg-[var(--app-bg-page)] border-t border-[var(--app-border)] p-2 pl-9 space-y-1">
                                          {group.children.map(child => {
                                              const isChildSelected = selectedDomains.includes(child.original);
                                              return (
                                                  <div 
                                                      key={child.original} 
                                                      onClick={() => toggleSingleDomain(child.original)}
                                                      className="flex items-center gap-2 py-1.5 cursor-pointer group hover:bg-[var(--app-bg-highlight)] rounded px-2 -ml-2 transition-colors"
                                                  >
                                                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                                                          isChildSelected ? 'bg-[var(--app-primary)] border-[var(--app-primary)]' : 'bg-[var(--app-bg-page)] border-[var(--app-border)] group-hover:border-[var(--app-text-subtle)]'
                                                      }`}>
                                                          {isChildSelected && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                                                      </div>
                                                      <div className="text-xs text-[var(--app-text-muted)] group-hover:text-[var(--app-text-main)]">
                                                          <span className="font-mono font-semibold mr-1.5">{child.code}</span>
                                                          {child.name !== child.code && child.name}
                                                      </div>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              )}

              <div className="mt-2 text-[11px] text-[var(--app-text-subtle)]">
                Selected: <span className="font-mono">
                  {filterViewMode === 'grid' 
                    ? new Set(selectedDomains.map(d => {
                        const meta = getDomainMeta(d, domainMap);
                        return meta?.code ? meta.code.split('.')[0] : d; 
                      })).size
                    : selectedDomains.length
                  }
                </span>
              </div>
            </div>

            {/* Question Count */}
            <div>
              <div className="flex items-end justify-between mb-3">
                <label className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                  Question Count
                </label>
                <span className="text-[11px] text-[var(--app-text-subtle)]">
                  Max: <span className="font-mono">{filteredMax}</span>
                </span>
              </div>

              <input
                type="number"
                inputMode="numeric"
                min="1"
                max={filteredMax}
                value={customCountInput}
                onChange={(e) => setCustomCountInput(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                }}
                className={`w-full bg-[var(--app-bg-page)] border border-[var(--app-border)] rounded-xl px-4 py-2.5 text-center font-mono font-semibold text-base text-[var(--app-text-main)] focus:border-[var(--app-primary)] transition-all duration-200 ${focusRing}
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                `}
              />

              <div className="mt-2 text-[11px] text-[var(--app-text-subtle)]">
                Used for both Quick Quiz and Smart Learning.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- UI RENDERERS ---
  const renderStats = () => {
    const profile = Storage.get('user_mastery_v2');
    if (!profile || !profile.global)
      return (
        <div className="flex flex-col items-center justify-center h-full anim-fade-in text-[var(--app-text-muted)] font-sans antialiased">
          <div className="w-16 h-16 bg-[var(--app-bg-highlight)] rounded-full flex items-center justify-center mb-4 text-[var(--app-text-subtle)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="font-semibold text-lg mb-1">No data yet</p>
          <p className="text-sm opacity-70 mb-6">Complete a quiz to see your analytics.</p>
          <button
            onClick={returnFromStats}
            className={`text-[var(--app-primary)] font-semibold hover:underline ${focusRing} rounded`}
          >
            Back
          </button>
        </div>
      );

    const totalQ = profile.global.totalQuestions || 0;
    const totalC = profile.global.totalCorrect || 0;
    const accuracy = totalQ > 0 ? Math.min(100, Math.round((totalC / totalQ) * 100)) : 0;
    const avgPace = totalQ > 0 ? (profile.global.totalTime / totalQ / 1000).toFixed(1) : 0;

    const domains = Object.entries(profile.domains || {})
      .map(([k, v]) => ({
        name: k,
        score: v.t > 0 ? Math.round((v.c / v.t) * 100) : 0,
        count: v.t,
      }))
      .sort((a, b) => b.score - a.score);

    // UNIQUE QUESTION LOGIC
    const uniqueQuestionsPerTag = {};
    if (profile.questions) {
      Object.keys(profile.questions).forEach(qId => {
        const qDef = allQuestions.find(q => q.id === qId);
        if (qDef && qDef.tags) {
          qDef.tags.forEach(tag => {
            uniqueQuestionsPerTag[tag] = (uniqueQuestionsPerTag[tag] || 0) + 1;
          });
        }
      });
    }

    const tags = Object.entries(profile.tags || {})
      .filter(([tagName]) => (uniqueQuestionsPerTag[tagName] || 0) >= 5) // CHANGED FROM 10
      .map(([k, v]) => {
        const fromProfile = getPrimaryDomainForTagFromProfile(v);
        const inferred = inferPrimaryDomainForTagFromQuestions(k, allQuestions);
        return {
          name: k,
          score: v.t > 0 ? Math.round((v.c / v.t) * 100) : 0,
          count: v.t,
          uniqueCount: uniqueQuestionsPerTag[k] || 0,
          primaryDomain: fromProfile || inferred || null,
        };
      })
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return b.count - a.count;
      });


    const weakestTag = tags.length > 0 ? tags[0] : null;
    const strongestTag = tags.length > 0 ? tags[tags.length - 1] : null;
    const showStrongest =
      strongestTag && strongestTag.name !== weakestTag?.name && strongestTag.score > 0;

    const renderTagWithDomain = (tagObj) => {
      const domLabel = tagObj?.primaryDomain;
      // PASS MAP
      const meta = domLabel ? getDomainMeta(domLabel, domainMap) : null;

      return (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-[var(--app-text-main)] truncate">
              {tagObj.name} ({tagObj.score}%)
            </div>

            {meta ? (
              <div className="mt-1 text-[11px] text-[var(--app-text-muted)] flex items-center gap-2">
                <span className="font-mono px-2 py-0.5 rounded bg-[var(--app-bg-page)] border border-[var(--app-border)]">
                  {meta.code}
                </span>
                <span className="truncate">{meta.name}</span>
              </div>
            ) : (
              <div className="mt-1 text-[11px] text-[var(--app-text-subtle)] italic">Domain not available yet</div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto p-6 anim-fade-in overflow-y-auto font-sans antialiased">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-[var(--app-text-main)] tracking-tight">
            My Stats
          </h2>

          <button
            onClick={returnFromStats}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-[var(--app-bg-highlight)] rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-[var(--app-border)] transition-colors text-[var(--app-text-main)] ${focusRing}`}
          >
            {previousScreen === 'results' ? (
              <>
                <ReturnIcon className="w-4 h-4" />
                Return
              </>
            ) : (
              'Back'
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--app-bg-surface)] p-5 rounded-2xl border border-[var(--app-border)] shadow-sm">
            <div className="text-[11px] uppercase text-[var(--app-text-subtle)] font-semibold mb-1 tracking-wider">
              Global Accuracy
            </div>
            <div
              className={`text-3xl font-extrabold ${
                accuracy >= 80
                  ? 'text-[var(--app-success)]'
                  : accuracy >= 60
                    ? 'text-[var(--app-primary)]'
                    : 'text-[var(--app-warning)]'
              }`}
            >
              {accuracy}%
            </div>
          </div>
          <div className="bg-[var(--app-bg-surface)] p-5 rounded-2xl border border-[var(--app-border)] shadow-sm">
            <div className="text-[11px] uppercase text-[var(--app-text-subtle)] font-semibold mb-1 tracking-wider">
              Questions Taken
            </div>
            <div className="text-3xl font-extrabold text-[var(--app-text-main)]">
              {totalQ}
            </div>
          </div>
          <div className="bg-[var(--app-bg-surface)] p-5 rounded-2xl border border-[var(--app-border)] shadow-sm">
            <div className="text-[11px] uppercase text-[var(--app-text-subtle)] font-semibold mb-1 tracking-wider">
              Sec / Question
            </div>
            <div className="text-3xl font-extrabold text-[var(--app-chart-4)]">{avgPace}s</div>
          </div>
          <div className="bg-[var(--app-bg-surface)] p-5 rounded-2xl border border-[var(--app-border)] shadow-sm">
            <div className="text-[11px] uppercase text-[var(--app-text-subtle)] font-semibold mb-1 tracking-wider">
              Sessions
            </div>
            <div className="text-3xl font-extrabold text-[var(--app-chart-2)]">
              {profile.global.sessions}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--app-bg-surface)] rounded-2xl border border-[var(--app-border)] p-6">
            <h3 className="text-xs font-semibold uppercase text-[var(--app-text-subtle)] mb-6 tracking-widest">
              Domain Mastery
            </h3>

            <div className="space-y-5">
              {domains.length === 0 ? (
                <p className="text-sm opacity-50">No domain data yet.</p>
              ) : (
                domains.map((d, i) => {
                  // PASS MAP
                  let meta = getDomainMeta(d.name, domainMap);

                  // FALLBACK: If code is 0.0, try to resolve via a question instance
                  if (meta.code === '0.0') {
                      const matchingQ = allQuestions.find(q => q.domain === d.name);
                      if (matchingQ) {
                          const specificSection = matchingQ.section || matchingQ.domain;
                          const specificMeta = getDomainMeta(specificSection, domainMap);
                          if (specificMeta && specificMeta.code !== '0.0') {
                             const majorId = specificMeta.code.split('.')[0];
                             meta = { ...meta, code: `${majorId}.0` };
                          }
                      }
                   }
                  
                  let colorClass = 'text-[var(--app-danger)]';
                  let bgClass = 'bg-[var(--app-danger)]';
                  if (d.score >= 80) {
                    colorClass = 'text-[var(--app-success)]';
                    bgClass = 'bg-[var(--app-success)]';
                  } else if (d.score >= 60) {
                    colorClass = 'text-[var(--app-primary)]';
                    bgClass = 'bg-[var(--app-primary)]';
                  } else if (d.score >= 40) {
                    colorClass = 'text-[var(--app-warning)]';
                    bgClass = 'bg-[var(--app-warning)]';
                  }

                  return (
                    <div key={d.name} className="flex items-center group">
                      <div className="w-6 text-xs font-semibold text-[var(--app-text-subtle)]">#{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1.5 gap-3">
                          <span className="font-semibold text-[var(--app-text-main)] truncate">
                            <span className="inline-flex items-center gap-2">
                              <span className="shrink-0 font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--app-bg-highlight)] border border-[var(--app-border)] text-[var(--app-text-muted)]">
                                {meta.code}
                              </span>
                              <span className="truncate">{meta.name}</span>
                            </span>
                          </span>

                          <span className={`font-mono font-semibold ${colorClass}`}>
                            {d.score}%
                          </span>
                        </div>

                        <div className="w-full bg-[var(--app-bg-highlight)] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${bgClass}`}
                            style={{ width: `${d.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[var(--app-bg-surface)] rounded-2xl border border-[var(--app-border)] p-6 flex-1">
              <h3 className="text-xs font-semibold uppercase text-[var(--app-text-subtle)] mb-4 tracking-widest">
                Topic Insights
              </h3>

              {tags.length > 0 ? (
                <div className="space-y-3">
                  {weakestTag && (
                    <div className="p-3 bg-[var(--app-danger-light)] rounded-xl border border-[var(--app-danger)]/20 anim-slide-right">
                      <div className="text-[10px] font-semibold uppercase text-[var(--app-danger)] mb-1">
                        Needs Improvement
                      </div>
                      {renderTagWithDomain(weakestTag)}
                    </div>
                  )}

                  {showStrongest && (
                    <div className="p-3 bg-[var(--app-success-light)] rounded-xl border border-[var(--app-success)]/20 mt-4 anim-slide-right" style={{ animationDelay: '0.1s' }}>
                      <div className="text-[10px] font-semibold uppercase text-[var(--app-success)] mb-1">
                        Strongest Topic
                      </div>
                      {renderTagWithDomain(strongestTag)}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--app-text-subtle)] italic">Take more quizzes to generate topic insights.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIntro = () => {
    const hasQuestions = allQuestions && allQuestions.length > 0;
    const startDisabled = !hasQuestions || selectedDomains.length === 0;

    // UPDATED: Filter logic uses section or domain to correctly count available questions
    const filteredMax = Math.max(
      1,
      allQuestions.filter((q) => selectedDomains.includes(q.section || q.domain)).length
    );
    const parsedCount = parseInt(customCountInput, 10);
    const effectiveCount = Number.isFinite(parsedCount) ? parsedCount : 10;

    return (
      <div className="flex flex-col h-full relative font-sans antialiased anim-fade-in">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button
            onClick={onClose}
            className={`text-xs font-semibold uppercase tracking-wide transition-colors ${focusRing} rounded ${
              isSmartMode ? 'text-[var(--theme-300)] hover:text-white' : 'text-[var(--app-text-subtle)] hover:text-[var(--app-text-main)]'
            }`}
          >
            Exit App
          </button>

          <button
            onClick={goToStats}
            className={`text-xs font-semibold uppercase tracking-wide transition-colors ${focusRing} rounded ${
              isSmartMode ? 'text-[var(--theme-400)] hover:text-white' : 'text-[var(--app-primary)] hover:text-[var(--app-primary-hover)]'
            }`}
          >
            My Stats
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto p-6 text-center overflow-y-auto">
          <div className="mb-10">
            <h1 className={`text-5xl font-extrabold mb-3 tracking-tight ${
              isSmartMode ? 'text-[var(--theme-50)]' : 'text-[var(--app-text-main)]'
            }`}>
              {title}
            </h1>
            <p className={`font-medium text-lg ${
              isSmartMode ? 'text-[var(--theme-200)]' : 'text-[var(--app-text-muted)]'
            }`}>
              Powered by Smart Learning
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4 relative z-10">
            <button
              onClick={() => handleStartQuiz('standard')}
              disabled={startDisabled}
              className={`w-full py-4 border hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed font-semibold rounded-2xl shadow-sm transition-all hover:shadow-md active:scale-[0.99] text-lg ${focusRing} ${
                isSmartMode 
                  ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' 
                  : 'bg-[var(--app-bg-surface)] border-[var(--app-border)] hover:bg-[var(--app-bg-highlight)] text-[var(--app-text-main)]'
              }`}
            >
              Start Quick Quiz{' '}
              <span className={`font-normal text-sm ${isSmartMode ? 'text-white/60' : 'text-[var(--app-text-subtle)]'}`}>
                ({Math.min(Math.max(1, effectiveCount), filteredMax)})
              </span>
            </button>

            {/* UPDATED: Uses --theme-500 (Base Color) instead of --app-smart-learning */}
            <button
              onClick={() => handleStartQuiz('smart')}
              disabled={startDisabled}
              className={`group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl active:scale-[0.99] shadow-2xl hover:shadow-[var(--theme-500)]/20 disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
            >
              <div className="absolute inset-0 bg-[var(--theme-500)] opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute inset-0 border-[3px] border-[var(--theme-500)]/30 rounded-2xl" />
              <div className="absolute inset-[3px] border border-[var(--theme-500)]/20 rounded-[12px]" />

              <div className="relative flex items-center p-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 mr-4 shadow-inner">
                  <RocketIcon className="w-6 h-6 text-white fill-current" />
                </div>
                <div className="text-left text-[var(--app-pure-black)]">
                  <div className="font-semibold text-lg flex items-center gap-2">Smart Learning</div>
                  <div className="text-xs opacity-90 font-medium">Personalized mode</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className={`text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors pt-6 ${focusRing} rounded ${
                isSmartMode 
                  ? 'text-[var(--theme-300)] hover:text-white'
                  : showAdvanced 
                    ? 'text-[var(--app-primary)]' 
                    : 'text-[var(--app-text-subtle)] hover:text-[var(--app-text-main)]'
              }`}
            >
              {showAdvanced ? 'Hide Options' : 'Advanced Options'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    if (!activeQuestions[currentQuestionIndex]) return <div>Loading...</div>;
    const currentQ = activeQuestions[currentQuestionIndex];
    const isAnswered = !!userAnswers[currentQ.id];
    const isCorrect = userAnswers[currentQ.id] === currentQ.correctAnswer;
    
    // FIX: Determine display metadata (Specific vs Broad)
    const qSection = currentQ.section || currentQ.domain;
    const specificMeta = getDomainMeta(qSection, domainMap);
    const majorId = specificMeta?.code?.split('.')[0] || '0';

    // Find siblings to determine if full domain is selected
    const siblings = availableDomains.filter(d => {
      const m = getDomainMeta(d, domainMap);
      return m?.code?.split('.')[0] === majorId;
    });

    // Check if every available sibling in this domain is currently selected
    const isFullDomainSelected = siblings.length > 0 && siblings.every(s => selectedDomains.includes(s));

    // Construct final display metadata
    const domainMeta = isFullDomainSelected && majorId !== '0'
      ? { code: `${majorId}.0`, name: currentQ.domain }
      : specificMeta;

    const currentExplanationKey = viewedExplanationOption || userAnswers[currentQ.id];
    const currentExplanationText = currentExplanationKey 
      ? (currentQ.optionExplanations?.[currentExplanationKey] || currentQ.explanation) 
      : currentQ.explanation;

    return (
      <div className="flex flex-col h-full w-full font-sans antialiased">
        {/* Progress Bar - Updated for Smart Mode */}
        <div className={`w-full h-2 shrink-0 sticky top-0 z-30 transition-colors ${
             isSmartMode ? 'bg-blue-900/50' : 'bg-[var(--app-bg-highlight)]'
        }`}>
          <div
            className={`h-full transition-all duration-500 ease-out ${
                 isSmartMode 
                 ? 'bg-[var(--theme-400)] shadow-[0_0_10px_rgba(var(--theme-glow),0.7)]' 
                 : 'bg-[var(--app-primary)]'
            }`}
            style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className={`max-w-6xl mx-auto h-full grid gap-6 transition-all duration-500 ease-in-out ${
            (explanationExpanded || EXPLANATION_POS === 'right') ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`} key={currentQ.id}>
            
            {/* Left Column: Question & Options */}
            <div className="flex flex-col anim-slide-right">
              <div className="mb-2 flex justify-between items-center">
                <span className={`text-xs font-semibold uppercase tracking-wide ${
                  isSmartMode ? 'text-blue-300' : 'text-[var(--app-text-subtle)]'
                }`}>
                  Question {currentQuestionIndex + 1} of {activeQuestions.length}
                </span>

                <span
                  className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-md border ${
                    isSmartMode 
                    ? 'bg-blue-900/50 text-blue-200 border-blue-500/30'
                    : 'bg-[var(--app-bg-highlight)] text-[var(--app-text-muted)] border-[var(--app-border)]'
                  }`}
                  title={domainMeta.name}
                >
                  <span className="font-mono">{domainMeta.code}</span>
                </span>
              </div>

            <h2 className={`text-xl md:text-2xl font-semibold mb-8 leading-relaxed ${
                isSmartMode ? 'text-white' : 'text-[var(--app-text-main)]'
            }`}>
              {renderQuestionWithGlossary(currentQ.question)}
            </h2>

              <div className="space-y-3 mb-8" ref={optionsContainerRef}>
                {currentQ.options.map((option, idx) => {
                  const isSelected = userAnswers[currentQ.id] === option;
                  const showResult = isAnswered;
                  const isThisCorrect = option === currentQ.correctAnswer;

                  let baseClass = `w-full p-4 rounded-xl text-left border-2 font-medium text-lg flex justify-between items-center backdrop-blur-sm ${focusRing} transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]`;
                  let statusClass = 'border-[var(--app-border)] bg-[var(--app-bg-surface)] text-[var(--app-text-main)] hover:border-[var(--app-primary)]';

                  // UPDATED: Using --theme-* variables for Smart Mode Options
                  if (isSmartMode && !showResult && !isSelected) {
                    // Dark glass base (slate-900/50) + Dynamic Border/Text
                    statusClass = 'border-blue-900/30 text-blue-400/50 bg-slate-900/50 hover:bg-blue-900/80 hover:border-blue-400/50';
                  }

                  if (showResult) {
                    if (isThisCorrect)
                      statusClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
                    else if (isSelected)
                      statusClass = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
                    else
                      statusClass = isSmartMode
                        ? 'border-blue-900/30 text-blue-400/50 opacity-50'
                        : 'border-[var(--app-border)] opacity-50';
                  } else if (isSelected) {
                    statusClass = isSmartMode
                      ? 'border-blue-400 bg-blue-900/60 text-white ring-1 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'border-[var(--app-primary)] bg-[var(--app-primary-light)] text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]';
                  }

                  return (
                    <button
                      key={idx} 
                      onClick={() => !isAnswered && handleAnswerSelect(option)}
                      onKeyDown={(e) => !isAnswered && handleOptionKeyDown(e, idx)}
                      disabled={isAnswered}
                      className={`${baseClass} ${statusClass}`}
                    >
                      <span>{option}</span>
                      {showResult && isThisCorrect && (
                        <div className="anim-pop-in text-[var(--app-success)]">
                          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {showResult && isSelected && !isThisCorrect && (
                        <div className="anim-pop-in text-[var(--app-danger)]">
                          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right/Bottom Column: Explanation Bubble */}
            {isAnswered && (
              <div 
                tabIndex={0}
                role="button"
                aria-expanded={explanationExpanded}
                onKeyDown={handleBubbleKeyDown}
                onClick={() => setExplanationExpanded(!explanationExpanded)}
                className={`rounded-xl p-6 border transition-all duration-500 ease-in-out cursor-pointer group relative overflow-hidden flex flex-col focus:ring-2 focus:ring-[var(--app-primary)] outline-none z-[100] ${
                  isSmartMode
                    ? 'bg-slate-900/80 border-blue-500/30 backdrop-blur-md animate-fadeIn'
                    : 'bg-[var(--app-bg-highlight)] border-[var(--app-border)] hover:bg-[var(--app-border)]/50'
                } ${explanationExpanded ? 'h-full shadow-lg' : (EXPLANATION_POS === 'right' ? 'h-full' : 'h-auto mt-auto')}`}
              >
                {/* Expand Toggle Icon */}
                <div className="absolute top-4 right-4 text-[var(--app-text-subtle)] group-hover:text-[var(--app-primary)] transition-colors">
                    {explanationExpanded ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <ArrowsExpandIcon />
                    )}
                </div>

                <div className={`flex items-start gap-4 mb-4 transition-all duration-300 ${explanationExpanded ? 'scale-90 origin-top-left -mb-1 opacity-90' : ''}`}>
                  <div
                    className={`p-2 rounded-full shrink-0 anim-pop-in ${
                      isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-[var(--app-danger-light)] text-[var(--app-danger)]'
                    }`}
                  >
                    {isCorrect ? (
                      <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4
                      className={`font-semibold text-lg mb-1 ${
                        isCorrect ? 'text-emerald-400' : 'text-[var(--app-danger)]'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </h4>
                    
                    {!explanationExpanded && (
                      <p className={`leading-relaxed line-clamp-3 ${
                          isSmartMode ? 'text-blue-100' : 'text-[var(--app-text-muted)]'
                      }`}>
                        {currentExplanationText}
                      </p>
                    )}
                  </div>
                </div>

                {explanationExpanded && (
                    <div className="space-y-4 mt-2 anim-fade-in flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {currentQ.options.map((opt, idx) => {
                          const isSelected = userAnswers[currentQ.id] === opt;
                          const isCorrectOpt = opt === currentQ.correctAnswer;
                          let label = "";
                          let labelClass = "";
                          if (isSelected) { label = "You chose"; labelClass = "text-[var(--app-primary)]"; }
                          if (isCorrectOpt) { label = "Correct Answer"; labelClass = "text-[var(--app-success)]"; }
                          
                          return (
                            <div key={idx} className={`p-4 rounded-xl border transition-colors ${
                                isCorrectOpt ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 
                                isSelected ? 'bg-[var(--app-danger-light)]/30 border-[var(--app-danger)]/30' :
                                isSmartMode ? 'bg-slate-900/30 border-blue-500/20' : 'bg-[var(--app-bg-page)] border-[var(--app-border)]'
                            }`}>
                               <div className="flex justify-between items-start mb-2 gap-4">
                                   <span className={`font-semibold text-sm ${isCorrectOpt ? 'text-[var(--app-success-text)]' : isSmartMode ? 'text-blue-100' : 'text-[var(--app-text-main)]'}`}>{opt}</span>
                                   {label && <span className={`text-[10px] uppercase font-bold tracking-wider shrink-0 ${labelClass}`}>{label}</span>}
                               </div>
                               <p className={`text-sm leading-relaxed ${isSmartMode ? 'text-blue-200' : 'text-[var(--app-text-muted)]'}`}>{currentQ.optionExplanations?.[opt] || "No explanation available"}</p>
                            </div>
                          );
                      })}
                    </div>
                )}

                <div className={`flex justify-end mt-4 pt-4 border-t ${
                    isSmartMode ? 'border-blue-500/30' : 'border-[var(--app-border)]/50'
                }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent bubble toggle when clicking next
                      handleNextQuestion();
                    }}
                    className={`px-6 py-2 font-semibold rounded-lg shadow transition-transform active:scale-95 duration-200 ${focusRing} ${
                      isSmartMode
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-[var(--app-text-on-primary)]'
                    }`}
                  >
                    {currentQuestionIndex === activeQuestions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

    const renderResults = () => {
    if (!quizStats) return <div>Processing...</div>;

    let message = 'Keep studying!';
    if (quizStats.percentage >= 90) message = 'Outstanding!';
    else if (quizStats.percentage >= 80) message = 'Great job!';
    else if (quizStats.percentage >= 70) message = 'Good effort!';

    // Reusable class (same as Change Options)
    const neutralButtonClass = `px-7 py-3.5 border font-semibold rounded-2xl transition-colors ${focusRing} ${
      isSmartMode 
        ? 'bg-[var(--app-bg-surface)] border-[var(--theme-500)]/30 text-[var(--app-text-main)] hover:bg-[var(--theme-500)]/5' 
        : 'bg-[var(--app-bg-surface)] border-[var(--app-border)] text-[var(--app-text-main)] hover:bg-[var(--app-bg-highlight)]'
    }`;

    return (
      <div className="relative flex flex-col h-full w-full px-6 py-8 md:px-10 md:py-10 animate-fadeIn overflow-y-auto font-sans antialiased">
        {/* Corner controls */}
        <button
          onClick={onClose}
          className={`absolute top-5 left-5 md:top-6 md:left-6 p-2.5 rounded-xl transition-colors ${focusRing} ${
            isSmartMode 
              ? 'text-[var(--app-text-subtle)] hover:text-[var(--theme-600)] hover:bg-[var(--theme-500)]/10'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-main)] hover:bg-[var(--app-bg-highlight)]'
          }`}
          aria-label="Exit App"
          title="Exit App"
        >
          <XIcon />
        </button>

        <div className="absolute top-5 right-5 md:top-6 md:right-6 flex items-center gap-2">
          <button
            onClick={goToStats}
            className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide rounded-xl border backdrop-blur transition-colors ${focusRing} ${
              isSmartMode
                ? 'border-[var(--theme-500)]/30 bg-[var(--app-bg-surface)] text-[var(--app-text-main)] hover:bg-[var(--theme-500)]/5'
                : 'border-[var(--app-border)] bg-[var(--app-bg-surface)] hover:bg-[var(--app-bg-highlight)] text-[var(--app-text-main)]'
            }`}
            title="My Stats"
          >
            My Stats
          </button>

          <button
            onClick={handleReturnToIntro}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide rounded-xl border backdrop-blur transition-colors ${focusRing} ${
              isSmartMode
                ? 'border-[var(--theme-500)]/30 bg-[var(--app-bg-surface)] text-[var(--app-text-main)] hover:bg-[var(--theme-500)]/5'
                : 'border-[var(--app-border)] bg-[var(--app-bg-surface)] hover:bg-[var(--app-bg-highlight)] text-[var(--app-text-main)]'
            }`}
            title="Return to Title"
          >
            <ReturnIcon className="w-4 h-4" />
            Return
          </button>
        </div>

        {/* Main content */}
        <div className="max-w-6xl w-full mx-auto pt-16 md:pt-18">
          <div className="text-center mb-10 md:mb-12">
            <div className={`text-sm md:text-base font-semibold uppercase tracking-widest mb-2 ${
              isSmartMode ? 'text-[var(--theme-500)]' : 'text-[var(--app-text-subtle)]'
            }`}>
              Final Score
            </div>

            <h2 className={`text-7xl md:text-8xl font-extrabold mb-3 text-[var(--app-text-main)]`}>
              {quizStats.percentage}%
            </h2>

            <p className={`text-2xl md:text-3xl font-medium ${
              isSmartMode ? 'text-[var(--theme-500)]' : 'text-[var(--app-primary)]'
            }`}>{message}</p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10">
            <div className={`rounded-2xl p-7 md:p-8 border space-y-5 ${
              isSmartMode 
                ? 'bg-[var(--app-bg-surface)] border-[var(--theme-500)]/30 shadow-[0_0_15px_rgba(var(--theme-glow),0.1)]' 
                : 'bg-[var(--app-bg-highlight)] border-[var(--app-border)]'
            }`}>
              <div className={`flex justify-between items-center pb-3 border-b ${
                isSmartMode ? 'border-[var(--theme-500)]/20' : 'border-[var(--app-border)]'
              }`}>
                <span className={`text-sm uppercase font-semibold ${isSmartMode ? 'text-[var(--theme-500)]' : 'text-[var(--app-text-subtle)]'}`}>Total Questions</span>
                <span className={`font-semibold text-lg text-[var(--app-text-main)]`}>
                  {quizStats.totalCount}
                </span>
              </div>

              <div className={`flex justify-between items-center pb-3 border-b ${
                isSmartMode ? 'border-[var(--theme-500)]/20' : 'border-[var(--app-border)]'
              }`}>
                <span className={`text-sm uppercase font-semibold ${isSmartMode ? 'text-[var(--theme-500)]' : 'text-[var(--app-text-subtle)]'}`}>Correct</span>
                <span className="font-semibold text-emerald-600 text-lg">
                  {quizStats.correctCount}{' '}
                  <span className={`text-sm font-normal text-[var(--app-text-muted)]`}>({quizStats.percentage}%)</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm uppercase font-semibold ${isSmartMode ? 'text-[var(--theme-500)]' : 'text-[var(--app-text-subtle)]'}`}>Average Pace</span>
                <span className={`font-semibold text-lg ${isSmartMode ? 'text-[var(--theme-600)]' : 'text-[var(--app-primary)]'}`}>{quizStats.avgTimeSeconds}s</span>
              </div>
            </div>

            <div className={`rounded-2xl p-7 md:p-8 border text-left ${
              isSmartMode 
                ? 'bg-[var(--app-bg-surface)] border-[var(--theme-500)]/30 shadow-[0_0_15px_rgba(var(--theme-glow),0.1)]' 
                : 'bg-[var(--app-bg-surface)] border-[var(--app-border)]'
            }`}>
              <h3 className={`text-xs font-semibold uppercase mb-5 tracking-wider ${
                isSmartMode ? 'text-[var(--theme-500)]' : 'text-[var(--app-text-subtle)]'
              }`}>
                Performance by Domain
              </h3>

              <div className="space-y-5 max-h-[22rem] md:max-h-[26rem] overflow-y-auto pr-1">
                {quizStats.domains.map((d) => {
                  let meta = getDomainMeta(d.name, domainMap);

                  // FALLBACK LOGIC FOR BUG FIX #2
                  if (meta.code === '0.0') {
                      const matchingQ = allQuestions.find(q => q.domain === d.name);
                      if (matchingQ) {
                          const specificSection = matchingQ.section || matchingQ.domain;
                          const specificMeta = getDomainMeta(specificSection, domainMap);
                          if (specificMeta && specificMeta.code !== '0.0') {
                              const majorId = specificMeta.code.split('.')[0];
                              meta = { ...meta, code: `${majorId}.0` };
                          }
                      }
                  }

                  return (
                    <div key={d.name}>
                      <div className="flex justify-between items-start text-sm mb-2 gap-3">
                        <span className={`font-semibold truncate text-[var(--app-text-main)]`}>
                          <span className="inline-flex items-center gap-2">
                            <span className={`font-mono text-[12px] px-2.5 py-0.5 rounded border ${
                              isSmartMode 
                                ? 'bg-[var(--theme-500)]/10 border-[var(--theme-500)]/30 text-[var(--theme-600)]' 
                                : 'bg-[var(--app-bg-highlight)] border-[var(--app-border)] text-[var(--app-text-muted)]'
                            }`}>
                              {meta.code}
                            </span>
                            <span className="truncate">{meta.name}</span>
                          </span>
                        </span>

                        <span
                          className={`font-mono font-semibold ${
                            d.score >= 70 ? 'text-emerald-600' : 'text-orange-500'
                          }`}
                        >
                          {d.correct}/{d.total}
                        </span>
                      </div>

                      <div className={`w-full rounded-full h-2 ${
                        isSmartMode ? 'bg-[var(--theme-500)]/10' : 'bg-[var(--app-bg-highlight)]'
                      }`}>
                        <div
                          className={`h-2 rounded-full ${d.score >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pb-6">
            {/* New Quiz now matches Change Options class */}
            <button onClick={() => handleStartQuiz('standard')} className={neutralButtonClass}>
              New Quiz
            </button>

            {/* UPDATED: Uses --theme-500 (Base) instead of --app-smart-learning */}
            <button
              onClick={() => handleStartQuiz('smart')}
              className={`px-7 py-3.5 hover:opacity-90 text-white font-semibold rounded-2xl shadow-lg transition-colors ${focusRing} ${
                isSmartMode ? 'bg-[var(--theme-600)] hover:bg-[var(--theme-500)]' : 'bg-[var(--theme-500)]'
              }`}
            >
              New Smart Quiz
            </button>

            <button onClick={() => setShowAdvanced(true)} className={neutralButtonClass}>
              Change Options
            </button>
          </div>
        </div>
      </div>
    );
  };


  const isSmartActive = gameState === 'playing' && isSmartMode;

  return (
    <>
      <style>{animationStyles}</style>
      <div
        className={`flex flex-col h-screen w-full transition-all duration-500 relative overflow-hidden font-sans antialiased ${
          isSmartActive
            ? 'bg-slate-950 text-blue-50 border-[6px] border-[var(--theme-500)]/50 shadow-[inset_0_0_60px_rgba(var(--theme-glow),0.1)]'
            : 'bg-[var(--app-bg-page)] text-[var(--app-text-main)]'
        }`}
      >
        {/* Smart Mode Filter Overlay */}
        {isSmartActive && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[var(--theme-900)]/10 mix-blend-overlay" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-500)]/5 to-transparent" />
          </div>
        )}

        {/* GLOBAL: Advanced Options floating panel */}
        {renderAdvancedPanel()}

        {/* Header (PLAYING ONLY) */}
        {gameState === 'playing' && (
          <header
            className={`flex items-center justify-between px-6 py-4 shadow-sm z-10 border-b relative transition-colors duration-300 ${
              isSmartActive
                ? 'bg-slate-900/50 backdrop-blur-md border-[var(--theme-500)]/30 text-[var(--theme-100)]'
                : 'bg-[var(--app-bg-surface)] border-[var(--app-border)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold flex items-center gap-2">
                {title}
                {isSmartActive && (
                  <span className="text-[10px] bg-[var(--theme-500)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg shadow-[var(--theme-500)]/30">
                    Smart Mode
                  </span>
                )}
              </h1>

              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${focusRing} ${
                  isSmartActive
                    ? 'text-[var(--theme-300)] hover:text-white hover:bg-[var(--theme-500)]/20'
                    : 'text-[var(--app-text-subtle)] hover:text-[var(--app-text-main)] hover:bg-[var(--app-bg-highlight)]'
                }`}
                aria-label="Exit App"
                title="Exit App"
              >
                <XIcon />
              </button>
            </div>

            <button
              onClick={handleReturnToIntro}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide rounded-lg transition-colors ${focusRing} ${
                isSmartActive
                  ? 'text-[var(--theme-200)] hover:text-white hover:bg-[var(--theme-500)]/20'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-main)] hover:bg-[var(--app-bg-highlight)]'
              }`}
              title="Return to Title"
            >
              <ReturnIcon className="w-4 h-4" />
              Return
            </button>
          </header>
        )}

        <main className="flex-grow overflow-y-auto relative z-10">
          {gameState === 'intro' && renderIntro()}
          {gameState === 'playing' && renderQuestion()}
          {gameState === 'results' && renderResults()}
          {gameState === 'stats' && renderStats()}
        </main>
      </div>
    </>
  );
};

export default QuizApp;