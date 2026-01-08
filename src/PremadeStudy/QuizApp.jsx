import React, { useState, useEffect, useRef } from 'react';
import { NETWORK_PLUS_QUESTIONS } from './NetworkPlus';

// --- HELPERS ---
const getDomainId = (domainName) => {
  const map = {
    'Networking Fundamentals': '1.0',
    'Wireless Networking': '2.0',
    'Network Management': '3.0',
    'Security Principles': '4.0',
    'Threats & Attacks': '5.0',
    Cryptography: '6.0',
    'IAM & Admin': '7.0',
  };
  return map[domainName] || '0.0';
};

/**
 * Supports:
 *  - "1.1 Defense" / "1.1 - Defense" / "1.1: Defense" / "1.1 — Defense"
 *  - "Networking Fundamentals" -> { code: "1.0", name: "Networking Fundamentals" }
 */
const getDomainMeta = (domainLabel) => {
  const raw = (domainLabel ?? '').toString().trim();
  const match = raw.match(/^\s*(\d+(?:\.\d+)*)\s*(?:[-:–—]\s*)?(.*)$/);
  if (match && match[1]) {
    const code = match[1];
    const name = (match[2] || '').trim();
    return { code, name: name || raw };
  }
  return { code: getDomainId(raw), name: raw };
};

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

const QuizApp = ({ onClose, questions, title = 'Quiz Mode' }) => {
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

  // Analytics
  const quizStartTime = useRef(null);
  const questionStartTime = useRef(null);
  const quizSessionLog = useRef(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStats, setQuizStats] = useState(null);

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950';

  // --- INITIALIZATION ---
  useEffect(() => {
    const sourceQuestions =
      questions && questions.length > 0 ? questions : NETWORK_PLUS_QUESTIONS || [];
    if (sourceQuestions.length > 0) {
      setAllQuestions(sourceQuestions);
      const domains = [...new Set(sourceQuestions.map((q) => q.domain))];
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

  // IMPORTANT: when navigating to a new screen, close the Advanced Options panel
  useEffect(() => {
    setShowAdvanced(false);
  }, [gameState]);

  const goToStats = () => {
    setPreviousScreen(gameState);
    setGameState('stats');
  };

  const returnFromStats = () => {
    if (previousScreen === 'results') setGameState('results');
    else setGameState('intro');
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
    setScore(0);
    setIsSmartMode(false);
    // keep selectedDomains + customCountInput so options persist
  };

  // --- ENGINE LOGIC ---
  const handleStartQuiz = (mode = 'standard') => {
    setIsSmartMode(mode === 'smart');

    // ALWAYS APPLY SETTINGS
    const domainsToUse = selectedDomains.length > 0 ? selectedDomains : availableDomains;

    const countRequested = parseInt(customCountInput, 10);
    const countToUse = Number.isFinite(countRequested) ? countRequested : 10;

    const domainFiltered = allQuestions.filter((q) => domainsToUse.includes(q.domain));
    const shuffledQuestions = [...domainFiltered].sort(() => 0.5 - Math.random());
    const actualCount = Math.min(Math.max(1, countToUse), shuffledQuestions.length);
    const gameSet = shuffledQuestions.slice(0, actualCount);

    if (gameSet.length === 0) return;

    const questionsWithShuffledOptions = gameSet.map((q) => ({
      ...q,
      options: [...q.options].sort(() => 0.5 - Math.random()),
    }));

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

    setScore(correctCount);
    setQuizStats(processedStats);
    setGameState('results');
  };

  // --- ADVANCED OPTIONS PANEL (GLOBAL) ---
  const renderAdvancedPanel = () => {
    if (!showAdvanced) return null;

    const filteredMax = Math.max(
      1,
      allQuestions.filter((q) => selectedDomains.includes(q.domain)).length
    );

    return (
      <div className="fixed right-6 top-24 z-40 w-[22rem] max-w-[92vw] font-sans antialiased">
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Advanced Options
              </div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
                Settings apply even after closing.
              </div>
            </div>
            <button
              onClick={() => setShowAdvanced(false)}
              className={`p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 ${focusRing}`}
              aria-label="Close advanced options"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-5 text-left max-h-[calc(100vh-8rem)] overflow-y-auto">
            {/* Domains */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Filter Domains
                </label>
                <div className="space-x-3">
                  <button
                    onClick={() => setSelectedDomains(availableDomains)}
                    className={`text-[10px] text-indigo-600 font-semibold hover:underline ${focusRing} rounded`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedDomains([])}
                    className={`text-[10px] text-slate-400 hover:underline ${focusRing} rounded`}
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {availableDomains.map((d) => {
                  const meta = getDomainMeta(d);
                  const isSelected = selectedDomains.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() =>
                        setSelectedDomains((prev) =>
                          prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                        )
                      }
                      title={`${meta.code} — ${meta.name}`}
                      className={`h-9 px-3 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                      } ${focusRing}`}
                    >
                      <span className="font-mono">{meta.code}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 text-[11px] text-slate-400">
                Selected: <span className="font-mono">{selectedDomains.length}</span>
              </div>
            </div>

            {/* Question Count */}
            <div>
              <div className="flex items-end justify-between mb-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Question Count
                </label>
                <span className="text-[11px] text-slate-400">
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
  onWheel={(e) => e.currentTarget.blur()}                 // <-- stops scroll wheel changing it
  onKeyDown={(e) => {                                     // <-- optional: keeps it clean
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  }}
  className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-center font-mono font-semibold text-base focus:border-indigo-500 ${focusRing}
    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
  `}
/>


              <div className="mt-2 text-[11px] text-slate-400">
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
        <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-slate-500 font-sans antialiased">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="font-semibold text-lg mb-1">No data yet</p>
          <p className="text-sm opacity-70 mb-6">Complete a quiz to see your analytics.</p>
          <button
            onClick={returnFromStats}
            className={`text-indigo-600 font-semibold hover:underline ${focusRing} rounded`}
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

    const tags = Object.entries(profile.tags || {})
      .map(([k, v]) => {
        const fromProfile = getPrimaryDomainForTagFromProfile(v);
        const inferred = inferPrimaryDomainForTagFromQuestions(k, allQuestions);
        return {
          name: k,
          score: v.t > 0 ? Math.round((v.c / v.t) * 100) : 0,
          count: v.t,
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
      const meta = domLabel ? getDomainMeta(domLabel) : null;

      return (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-slate-700 dark:text-slate-200 truncate">
              {tagObj.name} ({tagObj.score}%)
            </div>

            {meta ? (
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="font-mono px-2 py-0.5 rounded bg-white/60 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800">
                  {meta.code}
                </span>
                <span className="truncate">{meta.name}</span>
              </div>
            ) : (
              <div className="mt-1 text-[11px] text-slate-400 italic">Domain not available yet</div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto p-6 animate-fadeIn overflow-y-auto font-sans antialiased">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Stats
          </h2>

          <button
            onClick={returnFromStats}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${focusRing}`}
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
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] uppercase text-slate-400 font-semibold mb-1 tracking-wider">
              Global Accuracy
            </div>
            <div
              className={`text-3xl font-extrabold ${
                accuracy >= 80
                  ? 'text-emerald-500'
                  : accuracy >= 60
                    ? 'text-indigo-500'
                    : 'text-orange-500'
              }`}
            >
              {accuracy}%
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] uppercase text-slate-400 font-semibold mb-1 tracking-wider">
              Questions Taken
            </div>
            <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">
              {totalQ}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] uppercase text-slate-400 font-semibold mb-1 tracking-wider">
              Sec / Question
            </div>
            <div className="text-3xl font-extrabold text-sky-500">{avgPace}s</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] uppercase text-slate-400 font-semibold mb-1 tracking-wider">
              Sessions
            </div>
            <div className="text-3xl font-extrabold text-purple-500">
              {profile.global.sessions}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-xs font-semibold uppercase text-slate-400 mb-6 tracking-widest">
              Domain Mastery
            </h3>

            <div className="space-y-5">
              {domains.length === 0 ? (
                <p className="text-sm opacity-50">No domain data yet.</p>
              ) : (
                domains.map((d, i) => {
                  const meta = getDomainMeta(d.name);
                  return (
                    <div key={d.name} className="flex items-center group">
                      <div className="w-6 text-xs font-semibold text-slate-300">#{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1.5 gap-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                            <span className="inline-flex items-center gap-2">
                              <span className="shrink-0 font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                {meta.code}
                              </span>
                              <span className="truncate">{meta.name}</span>
                            </span>
                          </span>

                          <span
                            className={`font-mono font-semibold ${
                              d.score >= 80
                                ? 'text-emerald-500'
                                : d.score >= 60
                                  ? 'text-indigo-500'
                                  : 'text-orange-500'
                            }`}
                          >
                            {d.score}%
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              d.score >= 80
                                ? 'bg-emerald-500'
                                : d.score >= 60
                                  ? 'bg-indigo-500'
                                  : 'bg-orange-500'
                            }`}
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1">
              <h3 className="text-xs font-semibold uppercase text-slate-400 mb-4 tracking-widest">
                Topic Insights
              </h3>

              {tags.length > 0 ? (
                <div className="space-y-3">
                  {weakestTag && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30">
                      <div className="text-[10px] font-semibold uppercase text-red-500 mb-1">
                        Needs Improvement
                      </div>
                      {renderTagWithDomain(weakestTag)}
                    </div>
                  )}

                  {showStrongest && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 mt-4">
                      <div className="text-[10px] font-semibold uppercase text-emerald-500 mb-1">
                        Strongest Topic
                      </div>
                      {renderTagWithDomain(strongestTag)}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Play more quizzes to generate topic insights.</p>
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

    const filteredMax = Math.max(
      1,
      allQuestions.filter((q) => selectedDomains.includes(q.domain)).length
    );
    const parsedCount = parseInt(customCountInput, 10);
    const effectiveCount = Number.isFinite(parsedCount) ? parsedCount : 10;

    return (
      <div className="flex flex-col h-full relative bg-slate-50 dark:bg-slate-950 font-sans antialiased">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button
            onClick={onClose}
            className={`text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-wide transition-colors ${focusRing} rounded`}
          >
            Exit App
          </button>

          <button
            onClick={goToStats}
            className={`text-xs font-semibold text-indigo-600 hover:text-indigo-500 uppercase tracking-wide transition-colors ${focusRing} rounded`}
          >
            My Stats
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto p-6 text-center animate-fadeIn overflow-y-auto">
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              Powered by Smart Learning
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4 relative z-10">
            <button
              onClick={() => handleStartQuiz('standard')}
              disabled={startDisabled}
              className={`w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-slate-800 dark:text-white font-semibold rounded-2xl shadow-sm transition-all hover:shadow-md active:scale-[0.99] text-lg ${focusRing}`}
            >
              Start Quick Quiz{' '}
              <span className="text-slate-400 font-normal text-sm">
                ({Math.min(Math.max(1, effectiveCount), filteredMax)})
              </span>
            </button>

            <button
              onClick={() => handleStartQuiz('smart')}
              disabled={startDisabled}
              className={`group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl active:scale-[0.99] shadow-2xl hover:shadow-blue-500/15 disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-100" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute inset-0 border-[3px] border-blue-400/30 rounded-2xl" />
              <div className="absolute inset-[3px] border border-blue-300/20 rounded-[12px]" />

              <div className="relative flex items-center p-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 mr-4 shadow-inner">
                  <svg
                    className="w-6 h-6 text-white fill-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.0 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>
                </div>
                <div className="text-left text-white">
                  <div className="font-semibold text-lg flex items-center gap-2">Smart Learning</div>
                  <div className="text-xs text-blue-100/90 font-medium">Personalized mode</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className={`text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors pt-6 ${
                showAdvanced
                  ? 'text-indigo-600'
                  : 'text-slate-300 hover:text-slate-500 dark:text-slate-700 dark:hover:text-slate-500'
              } ${focusRing} rounded`}
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
    const domainMeta = getDomainMeta(currentQ.domain);

    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 lg:p-8 animate-slideInRight font-sans antialiased">
        <div
          className={`w-full h-2 rounded-full mb-8 overflow-hidden ${
            isSmartMode ? 'bg-blue-900/50' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isSmartMode ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.7)]' : 'bg-indigo-500'
            }`}
            style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-2 flex justify-between items-center">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                isSmartMode ? 'text-blue-300' : 'text-slate-400'
              }`}
            >
              Question {currentQuestionIndex + 1} of {activeQuestions.length}
            </span>

            <span
              className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-md ${
                isSmartMode
                  ? 'bg-blue-900/50 text-blue-200 border border-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700'
              }`}
              title={domainMeta.name}
            >
              <span className="font-mono">{domainMeta.code}</span>
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-white mb-8 leading-relaxed">
            {currentQ.question}
          </h2>

          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, idx) => {
              const isSelected = userAnswers[currentQ.id] === option;
              const showResult = isAnswered;
              const isThisCorrect = option === currentQ.correctAnswer;

              let baseClass = `w-full p-4 rounded-xl text-left border-2 transition-all duration-200 font-medium text-lg flex justify-between items-center backdrop-blur-sm ${focusRing}`;
              let statusClass =
                'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700';

              if (isSmartMode && !showResult && !isSelected) {
                statusClass =
                  'border-blue-500/20 bg-slate-900/50 text-blue-100 hover:bg-blue-900/80 hover:border-blue-400/50';
              }

              if (showResult) {
                if (isThisCorrect)
                  statusClass =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
                else if (isSelected)
                  statusClass =
                    'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
                else
                  statusClass = isSmartMode
                    ? 'border-blue-900/30 text-blue-400/50'
                    : 'border-slate-100 dark:border-slate-800 opacity-50';
              } else if (isSelected) {
                statusClass = isSmartMode
                  ? 'border-blue-400 bg-blue-900/60 text-white ring-1 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswered && handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`${baseClass} ${statusClass}`}
                >
                  <span>{option}</span>
                  {showResult && isThisCorrect && (
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {showResult && isSelected && !isThisCorrect && (
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div
              className={`rounded-xl p-6 border animate-fadeIn mt-auto ${
                isSmartMode
                  ? 'bg-slate-900/80 border-blue-500/30 backdrop-blur-md'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isCorrect ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </h4>
                  <p
                    className={`leading-relaxed ${
                      isSmartMode ? 'text-blue-100' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className={`px-6 py-2 font-semibold rounded-lg shadow transition-colors ${focusRing} ${
                    isSmartMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {currentQuestionIndex === activeQuestions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                </button>
              </div>
            </div>
          )}
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
    const neutralButtonClass = `px-7 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${focusRing}`;

    return (
      <div className="relative flex flex-col h-full w-full px-6 py-8 md:px-10 md:py-10 animate-fadeIn overflow-y-auto font-sans antialiased">
        {/* Corner controls */}
        <button
          onClick={onClose}
          className={`absolute top-5 left-5 md:top-6 md:left-6 p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors ${focusRing}`}
          aria-label="Exit App"
          title="Exit App"
        >
          <XIcon />
        </button>

        <div className="absolute top-5 right-5 md:top-6 md:right-6 flex items-center gap-2">
          <button
            onClick={goToStats}
            className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur hover:bg-white dark:hover:bg-slate-900 transition-colors ${focusRing}`}
            title="My Stats"
          >
            My Stats
          </button>

          <button
            onClick={handleReturnToIntro}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur hover:bg-white dark:hover:bg-slate-900 transition-colors ${focusRing}`}
            title="Return to Title"
          >
            <ReturnIcon className="w-4 h-4" />
            Return
          </button>
        </div>

        {/* Main content */}
        <div className="max-w-6xl w-full mx-auto pt-16 md:pt-18">
          <div className="text-center mb-10 md:mb-12">
            <div className="text-sm md:text-base font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Final Score
            </div>

            <h2 className="text-7xl md:text-8xl font-extrabold text-slate-900 dark:text-white mb-3">
              {quizStats.percentage}%
            </h2>

            <p className="text-2xl md:text-3xl text-indigo-600 font-medium">{message}</p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-7 md:p-8 border border-slate-200 dark:border-slate-700 space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 text-sm uppercase font-semibold">Total Questions</span>
                <span className="font-semibold text-slate-900 dark:text-white text-lg">
                  {quizStats.totalCount}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 text-sm uppercase font-semibold">Correct</span>
                <span className="font-semibold text-emerald-600 text-lg">
                  {quizStats.correctCount}{' '}
                  <span className="text-sm text-slate-400 font-normal">({quizStats.percentage}%)</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm uppercase font-semibold">Average Pace</span>
                <span className="font-semibold text-indigo-600 text-lg">{quizStats.avgTimeSeconds}s</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 md:p-8 border border-slate-200 dark:border-slate-800 text-left">
              <h3 className="text-xs font-semibold uppercase text-slate-500 mb-5 tracking-wider">
                Performance by Domain
              </h3>

              <div className="space-y-5 max-h-[22rem] md:max-h-[26rem] overflow-y-auto pr-1">
                {quizStats.domains.map((d) => {
                  const meta = getDomainMeta(d.name);
                  return (
                    <div key={d.name}>
                      <div className="flex justify-between items-start text-sm mb-2 gap-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                          <span className="inline-flex items-center gap-2">
                            <span className="font-mono text-[12px] px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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

                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
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

            {/* New Smart Quiz same blue as old New Quiz */}
            <button
              onClick={() => handleStartQuiz('smart')}
              className={`px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-colors ${focusRing}`}
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
    <div
      className={`flex flex-col h-screen w-full transition-all duration-500 relative overflow-hidden font-sans antialiased ${
        isSmartActive
          ? 'dark bg-slate-950 text-blue-50 border-[6px] border-blue-500/50 shadow-[inset_0_0_60px_rgba(59,130,246,0.1)]'
          : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Smart Mode Filter Overlay */}
      {isSmartActive && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
        </div>
      )}

      {/* GLOBAL: Advanced Options floating panel */}
      {renderAdvancedPanel()}

      {/* Header (PLAYING ONLY) */}
      {gameState === 'playing' && (
        <header
          className={`flex items-center justify-between px-6 py-4 shadow-sm z-10 border-b relative transition-colors duration-300 ${
            isSmartActive
              ? 'bg-slate-900/50 backdrop-blur-md border-blue-500/30 text-blue-100'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {title}
              {isSmartActive && (
                <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/30">
                  Smart Mode
                </span>
              )}
            </h1>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${focusRing} ${
                isSmartActive
                  ? 'text-blue-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                ? 'text-blue-200 hover:text-white hover:bg-white/10'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
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
  );
};

export default QuizApp;