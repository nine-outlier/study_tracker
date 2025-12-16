import React, { useState, useEffect, useRef } from 'react';
import { NETWORK_PLUS_QUESTIONS } from './NetworkPlus';

// --- HELPERS ---
const getDomainId = (domainName) => {
  const map = {
    "Networking Fundamentals": "1.0",
    "Wireless Networking": "2.0",
    "Network Management": "3.0",
    "Security Principles": "4.0",
    "Threats & Attacks": "5.0",
    "Cryptography": "6.0",
    "IAM & Admin": "7.0"
  };
  return map[domainName] || "0.0";
};

// --- STORAGE MANAGER ---
const Storage = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.warn("Storage Error", e); }
  },
  remove: (key) => localStorage.removeItem(key)
};

const QuizApp = ({ onClose, questions, title = "Quiz Mode" }) => {
  // --- STATE ---
  const [gameState, setGameState] = useState('intro'); // intro, playing, results, stats
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // Question Pool
  const [allQuestions, setAllQuestions] = useState([]); 
  const [availableDomains, setAvailableDomains] = useState([]); 
  const [selectedDomains, setSelectedDomains] = useState([]); 
  const [activeQuestions, setActiveQuestions] = useState([]); 
  
  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customCountInput, setCustomCountInput] = useState("10");
  
  // Analytics
  const quizStartTime = useRef(null);
  const questionStartTime = useRef(null);
  const quizSessionLog = useRef(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStats, setQuizStats] = useState(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const sourceQuestions = (questions && questions.length > 0) ? questions : (NETWORK_PLUS_QUESTIONS || []);
    if (sourceQuestions.length > 0) {
      setAllQuestions(sourceQuestions);
      const domains = [...new Set(sourceQuestions.map(q => q.domain))];
      setAvailableDomains(domains);
      setSelectedDomains(domains); 
    }

    // CHECK FOR ABANDONED SESSIONS
    const lastSession = Storage.get('active_quiz_session');
    if (lastSession) {
        const abandonedLog = {
            date: new Date().toISOString(),
            reason: "Premature Exit",
            lastQuestionIndex: lastSession.lastIndex,
            domain: lastSession.currentDomain || "Unknown"
        };
        const profile = Storage.get('user_mastery_v2') || { abandoned: [] };
        profile.abandoned = [...(profile.abandoned || []), abandonedLog];
        Storage.set('user_mastery_v2', profile);
        Storage.remove('active_quiz_session');
    }
  }, [questions]);

  // --- ENGINE LOGIC ---

  const handleStartQuiz = () => {
    // 1. Filter
    let domainsToUse = showAdvanced ? selectedDomains : availableDomains;
    let countToUse = showAdvanced ? (parseInt(customCountInput) || 10) : 10;

    const domainFiltered = allQuestions.filter(q => domainsToUse.includes(q.domain));
    const shuffledQuestions = [...domainFiltered].sort(() => 0.5 - Math.random());
    const actualCount = Math.min(Math.max(1, countToUse), shuffledQuestions.length);
    const gameSet = shuffledQuestions.slice(0, actualCount);
    
    if (gameSet.length === 0) return;

    // 2. RANDOMIZE OPTIONS
    const questionsWithShuffledOptions = gameSet.map(q => ({
        ...q,
        options: [...q.options].sort(() => 0.5 - Math.random())
    }));

    setActiveQuestions(questionsWithShuffledOptions);

    // 3. Timers & Logs
    const now = Date.now();
    quizStartTime.current = now;
    questionStartTime.current = now;
    
    quizSessionLog.current = {
      sessionId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      startTime: new Date(now).toISOString(),
      totalQuestions: questionsWithShuffledOptions.length,
      history: []
    };

    Storage.set('active_quiz_session', { 
        start: now, 
        lastIndex: 0,
        currentDomain: questionsWithShuffledOptions[0].domain 
    });

    setScore(0);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setGameState('playing');
  };

  const updateDeepMastery = (question, isCorrect) => {
    let profile = Storage.get('user_mastery_v2') || {};
    
    if (!profile.domains) profile.domains = {};
    if (!profile.tags) profile.tags = {};
    if (!profile.questions) profile.questions = {};
    if (!profile.global) profile.global = { totalCorrect: 0, totalQuestions: 0, totalTime: 0, sessions: 0 };

    if (!profile.domains[question.domain]) profile.domains[question.domain] = { c: 0, t: 0 };
    profile.domains[question.domain].t++;
    if (isCorrect) profile.domains[question.domain].c++;

    if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => {
            if (!profile.tags[tag]) profile.tags[tag] = { c: 0, t: 0 };
            profile.tags[tag].t++;
            if (isCorrect) profile.tags[tag].c++;
        });
    }

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
    
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: selectedOption }));
    if (isCorrect) setScore(prev => prev + 1);

    const answerLog = {
      questionId: currentQ.id,
      domain: currentQ.domain,
      section: currentQ.section,
      tags: currentQ.tags,
      isCorrect: isCorrect,
      timeTakenMs: timeTakenMs,
      timestamp: now
    };
    
    if (quizSessionLog.current) {
        quizSessionLog.current.history.push(answerLog);
    }

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
          currentDomain: activeQuestions[nextIdx].domain 
      });

    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    Storage.remove('active_quiz_session');

    const now = Date.now();
    const duration = now - quizStartTime.current;
    
    const history = (quizSessionLog.current && quizSessionLog.current.history) ? quizSessionLog.current.history : [];
    
    // Update Global Stats
    let profile = Storage.get('user_mastery_v2') || {};
    if (!profile.global) profile.global = { totalCorrect: 0, totalQuestions: 0, totalTime: 0, sessions: 0 };

    profile.global.sessions++;
    profile.global.totalQuestions += history.length;
    profile.global.totalCorrect += history.filter(h => h.isCorrect).length;
    profile.global.totalTime += duration;
    Storage.set('user_mastery_v2', profile);

    // Process Stats for UI
    const correctCount = history.filter(h => h.isCorrect).length; 
    const totalCount = history.length;
    const totalTimeMs = history.reduce((acc, curr) => acc + curr.timeTakenMs, 0);
    const avgTimeMs = totalCount > 0 ? totalTimeMs / totalCount : 0;

    const domainMap = {};
    history.forEach(h => {
      if (!domainMap[h.domain]) domainMap[h.domain] = { total: 0, correct: 0 };
      domainMap[h.domain].total += 1;
      if (h.isCorrect) domainMap[h.domain].correct += 1;
    });

    const processedStats = {
        correctCount,
        totalCount,
        percentage: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
        avgTimeSeconds: (avgTimeMs / 1000).toFixed(1),
        domains: Object.keys(domainMap).map(d => ({
            name: d,
            correct: domainMap[d].correct,
            total: domainMap[d].total,
            score: Math.round((domainMap[d].correct / domainMap[d].total) * 100)
        }))
    };

    setScore(correctCount);
    setQuizStats(processedStats);
    setGameState('results');
  };

  // --- UI RENDERERS ---

  const renderStats = () => {
      const profile = Storage.get('user_mastery_v2');
      if (!profile || !profile.global) return (
          <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <p className="font-bold text-lg mb-2">No data yet</p>
              <p className="text-sm opacity-70 mb-6">Complete a quiz to see your analytics.</p>
              <button onClick={() => setGameState('intro')} className="text-indigo-600 font-bold hover:underline">Back to Menu</button>
          </div>
      );

      const totalQ = profile.global.totalQuestions || 0;
      const totalC = profile.global.totalCorrect || 0;
      const accuracy = totalQ > 0 ? Math.min(100, Math.round((totalC / totalQ) * 100)) : 0;
      const avgPace = totalQ > 0 ? (profile.global.totalTime / totalQ / 1000).toFixed(1) : 0;
      
      const domains = Object.entries(profile.domains || {}).map(([k, v]) => ({
          name: k,
          score: v.t > 0 ? Math.round((v.c / v.t) * 100) : 0,
          count: v.t
      })).sort((a, b) => b.score - a.score);

      const tags = Object.entries(profile.tags || {}).map(([k, v]) => ({
          name: k,
          score: v.t > 0 ? Math.round((v.c / v.t) * 100) : 0,
          count: v.t
      })).sort((a, b) => {
          if (a.score !== b.score) return a.score - b.score; 
          return b.count - a.count; 
      });

      const weakestTag = tags.length > 0 ? tags[0] : null;
      const strongestTag = tags.length > 0 ? tags[tags.length - 1] : null;
      const showStrongest = strongestTag && strongestTag.name !== weakestTag?.name && strongestTag.score > 0;

      return (
          <div className="flex flex-col h-full max-w-4xl mx-auto p-6 animate-fadeIn overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Stats</h2>
                  <button onClick={() => setGameState('intro')} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Back</button>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Global Accuracy</div>
                      <div className={`text-3xl font-black ${accuracy >= 80 ? 'text-emerald-500' : accuracy >= 60 ? 'text-indigo-500' : 'text-orange-500'}`}>{accuracy}%</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Questions Taken</div>
                      <div className="text-3xl font-black text-slate-700 dark:text-slate-200">{totalQ}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Sec / Question</div>
                      <div className="text-3xl font-black text-sky-500">{avgPace}s</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Sessions</div>
                      <div className="text-3xl font-black text-purple-500">{profile.global.sessions}</div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-6 tracking-widest">Domain Mastery</h3>
                      <div className="space-y-5">
                          {domains.length === 0 ? <p className="text-sm opacity-50">No domain data yet.</p> : domains.map((d, i) => (
                              <div key={d.name} className="flex items-center group">
                                  <div className="w-6 text-xs font-bold text-slate-300">#{i + 1}</div>
                                  <div className="flex-1">
                                      <div className="flex justify-between text-xs mb-1.5">
                                          <span className="font-bold text-slate-700 dark:text-slate-200">{d.name}</span>
                                          <span className={`font-mono font-bold ${d.score >= 80 ? 'text-emerald-500' : d.score >= 60 ? 'text-indigo-500' : 'text-orange-500'}`}>{d.score}%</span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                          <div className={`h-full rounded-full transition-all duration-1000 ${d.score >= 80 ? 'bg-emerald-500' : d.score >= 60 ? 'bg-indigo-500' : 'bg-orange-500'}`} style={{ width: `${d.score}%` }}></div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="flex flex-col gap-4">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1">
                          <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">Topic Insights</h3>
                          {tags.length > 0 ? (
                              <div className="space-y-3">
                                  {weakestTag && (
                                      <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30">
                                          <div className="text-[10px] font-bold uppercase text-red-500 mb-1">Needs Improvement</div>
                                          <div className="font-bold text-slate-700 dark:text-slate-200">{weakestTag.name} ({weakestTag.score}%)</div>
                                      </div>
                                  )}
                                  
                                  {showStrongest && (
                                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 mt-4">
                                          <div className="text-[10px] font-bold uppercase text-emerald-500 mb-1">Strongest Topic</div>
                                          <div className="font-bold text-slate-700 dark:text-slate-200">{strongestTag.name} ({strongestTag.score}%)</div>
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
    const filteredTotal = allQuestions.filter(q => selectedDomains.includes(q.domain)).length;

    return (
      <div className="flex flex-col h-full relative bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
            <button 
                onClick={onClose} 
                className="text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
            >
                Exit App
            </button>
            <button 
                onClick={() => setGameState('stats')} 
                className="text-xs font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest transition-colors"
            >
                My Stats
            </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto p-6 text-center animate-fadeIn overflow-y-auto">
            <div className="mb-12">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">
                {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                Adaptive Assessment Engine
            </p>
            </div>

            <div className="w-full max-w-sm space-y-4 relative z-10">
                <button 
                    onClick={handleStartQuiz}
                    disabled={!hasQuestions || (showAdvanced && selectedDomains.length === 0)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 text-lg"
                >
                    {showAdvanced ? "Start Custom Session" : "Start Quick Quiz (10)"}
                </button>

                <button 
                    onClick={() => {
                        if (showAdvanced) {
                            setSelectedDomains(availableDomains);
                            setCustomCountInput("10");
                        }
                        setShowAdvanced(!showAdvanced);
                    }}
                    className={`text-xs font-bold uppercase tracking-widest transition-colors ${showAdvanced ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {showAdvanced ? "Hide Options" : "Advanced Options"}
                </button>
            </div>

            {showAdvanced && (
                <div className="w-full max-w-md mt-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg animate-fadeInUp text-left">
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Domains</label>
                            <div className="space-x-3">
                                <button onClick={() => setSelectedDomains(availableDomains)} className="text-[10px] text-indigo-600 font-bold hover:underline">All</button>
                                <button onClick={() => setSelectedDomains([])} className="text-[10px] text-slate-400 hover:underline">None</button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableDomains.map(d => {
                                const domId = getDomainId(d).split('.')[0]; 
                                const isSelected = selectedDomains.includes(d);
                                return (
                                    <button
                                        key={d}
                                        onClick={() => setSelectedDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                                        title={d}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            isSelected 
                                            ? 'bg-indigo-600 text-white shadow-md scale-110' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        {domId}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Question Count
                        </label>
                        <div className="flex items-center">
                            <input 
                                type="number" 
                                min="1" 
                                max={filteredTotal}
                                value={customCountInput}
                                onChange={(e) => setCustomCountInput(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center font-mono font-bold text-lg focus:border-indigo-500 outline-none transition-colors"
                            />
                            <span className="ml-3 text-xs font-bold text-slate-400 whitespace-nowrap">
                                / {filteredTotal} MAX
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    if (!activeQuestions[currentQuestionIndex]) return <div>Loading...</div>;
    const currentQ = activeQuestions[currentQuestionIndex];
    const isAnswered = !!userAnswers[currentQ.id];
    const isCorrect = userAnswers[currentQ.id] === currentQ.correctAnswer;
    
    // CHANGED: Use "Domain" instead of "Section"
    const sectionDisplay = currentQ.section ? `Domain ${currentQ.section}` : `Domain ${getDomainId(currentQ.domain)}`;

    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 lg:p-8 animate-slideInRight">
         <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }} />
         </div>

         <div className="flex-1 flex flex-col">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Question {currentQuestionIndex + 1} of {activeQuestions.length}</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">
                {sectionDisplay}
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-8 leading-relaxed">
              {currentQ.question}
            </h2>

            <div className="space-y-3 mb-8">
               {currentQ.options.map((option, idx) => {
                 const isSelected = userAnswers[currentQ.id] === option;
                 const showResult = isAnswered;
                 const isThisCorrect = option === currentQ.correctAnswer;
                 
                 let baseClass = "w-full p-4 rounded-xl text-left border-2 transition-all duration-200 font-medium text-lg flex justify-between items-center";
                 let statusClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700";
                 
                 if (showResult) {
                    if (isThisCorrect) statusClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
                    else if (isSelected) statusClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                    else statusClass = "border-slate-100 dark:border-slate-800 opacity-50";
                 } else if (isSelected) {
                    statusClass = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500";
                 }

                 return (
                   <button 
                     key={idx}
                     onClick={() => !isAnswered && handleAnswerSelect(option)}
                     disabled={isAnswered}
                     className={`${baseClass} ${statusClass}`}
                   >
                     <span>{option}</span>
                     {showResult && isThisCorrect && <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                     {showResult && isSelected && !isThisCorrect && <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                   </button>
                 );
               })}
            </div>

            {isAnswered && (
               <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-fadeIn mt-auto">
                  <div className="flex items-start gap-4 mb-4">
                      <div className={`p-2 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                         {isCorrect ? ( <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> ) : ( <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> )}
                      </div>
                      <div>
                         <h4 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                         </h4>
                         <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                      </div>
                  </div>
                  <div className="flex justify-end">
                      <button onClick={handleNextQuestion} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow transition-colors">
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

     let message = "Keep studying!";
     if (quizStats.percentage >= 90) message = "Outstanding!";
     else if (quizStats.percentage >= 80) message = "Great job!";
     else if (quizStats.percentage >= 70) message = "Good effort!";

     return (
        <div className="flex flex-col items-center justify-start h-full max-w-3xl mx-auto p-6 text-center animate-fadeIn overflow-y-auto">
           <div className="text-center mb-8 mt-4">
              <div className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Final Score</div>
              <h2 className="text-6xl font-black text-slate-900 dark:text-white mb-2">{quizStats.percentage}%</h2>
              <p className="text-xl text-indigo-600 font-medium">{message}</p>
           </div>
           
           <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 text-sm uppercase font-bold">Total Questions</span>
                    <span className="font-bold text-slate-900 dark:text-white">{quizStats.totalCount}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 text-sm uppercase font-bold">Correct</span>
                    <span className="font-bold text-emerald-600">{quizStats.correctCount} <span className="text-xs text-slate-400 font-normal">({quizStats.percentage}%)</span></span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm uppercase font-bold">Average Pace</span>
                    <span className="font-bold text-indigo-600">{quizStats.avgTimeSeconds}s</span>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-left overflow-y-auto max-h-64">
                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider">Performance by Domain</h3>
                  <div className="space-y-4">
                      {quizStats.domains.map(d => (
                          <div key={d.name}>
                              <div className="flex justify-between text-xs mb-1">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate pr-2 w-3/4">{d.name}</span>
                                  <span className={`font-mono font-bold ${d.score >= 70 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                      {d.correct}/{d.total}
                                  </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full ${d.score >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${d.score}%` }}></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
           </div>

           <div className="flex gap-4 w-full justify-center pb-8">
              <button onClick={handleStartQuiz} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors">New Assessment</button>
              <button onClick={onClose} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Exit to Menu</button>
           </div>
        </div>
     );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {gameState === 'playing' && (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 shadow-sm z-10 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h1>
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 uppercase tracking-widest transition-colors">Exit</button>
        </header>
      )}

      <main className="flex-grow overflow-y-auto relative">
         {gameState === 'intro' && renderIntro()}
         {gameState === 'playing' && renderQuestion()}
         {gameState === 'results' && renderResults()}
         {gameState === 'stats' && renderStats()}
      </main>
    </div>
  );
};

export default QuizApp;