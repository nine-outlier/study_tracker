import React, { useState, useMemo, useEffect, useRef, useLayoutEffect, Suspense, lazy } from 'react';
import { loadData, saveData } from './utils/fileStorage.js';
import { calculatePercentage, calculateWeightedAverage, calculateRawAverage, calculateTrendSlope, generateId } from './utils/helpers.js';
import { getScoreClass, getReviewClass, getMasteredClass, getTopicColorClasses, getChartColors, getTrendLineColor, getTrendColorClass, getAxisColors } from './utils/themeHelpers.js';
import { config, allExamData, DEFAULT_SETTINGS } from './config/appConfig.js';
import { applyTheme, injectThemeStyles, getActiveGradient } from './utils/themeManager.js';

import StatsCard from './components/UI/StatsCard.jsx';
import Navigation from './components/UI/Navigation.jsx';
import DomainChart from './components/charts/DomainChart.jsx';
import MasteryChart from './components/charts/MasteryChart.jsx';
import TopicsForReview from './components/UI/TopicsForReview.jsx';
import WeightedToggle from './components/UI/WeightedToggle.jsx';
import PerformanceTrends from './components/charts/PerformanceTrends.jsx';
import StudyLog from './components/UI/StudyLog.jsx';
import ToastNotification from './components/UI/ToastNotification.jsx';
import ConfirmModal from './components/Modals/ConfirmModal.jsx';
import DataEntryModal from './components/Modals/DataEntryModal.jsx';
import SettingsModal from './components/Modals/SettingsModal.jsx';
import MetadataModal from './components/Modals/MetadataModal.jsx';
import AddCertModal from './components/Modals/AddCertModal.jsx';
import OnboardingModal from './components/Modals/OnboardingModal.jsx';
import LoadingScreen from './components/UI/LoadingScreen.jsx';
import SettingsFab from './components/UI/SettingsFab.jsx';
import ArcadeGameRoot from './components/Arcade/ArcadeGameRoot.jsx';
import TrophyIcon from './components/UI/TrophyIcon.jsx';
import ThemeEffects from './components/UI/ThemeEffects.jsx';
import OverviewSection from './components/Sections/OverviewSection.jsx';
import { PlusIcon } from './components/UI/Icons.jsx';

// --- LAZY LOAD OPTIMIZATION ---
// Replaced static import with lazy import to prevent main thread blocking on initial load
const NetworkPlusGuide = lazy(() => import('./PremadeStudy/NetworkPlus.jsx'));
const QuizApp = lazy(() => import('./PremadeStudy/QuizApp.jsx'));

const DARK_THEMES = ['midnight'];

const useCertificationMetrics = (certData, trendFilter, weights, appSettings) => {
  return useMemo(() => {
    if (!certData) return null;
    
    const allTests = (certData.tests || []).filter(t => !t.isDeleted);
    const allDomainsData = (certData.domains || []).filter(d => !d.isDeleted);
    const activeDomains = allDomainsData.map(d => d.name);
    const allStudySessions = (certData.studySessions || []).filter(s => !s.isDeleted);
    const allJournalEntries = (certData.journalEntries || []).filter(j => !j.isDeleted);

    let uncategorizedTestEntries = [];
    const domainHistory = new Map();
    
    activeDomains.forEach(domainName => {
        domainHistory.set(domainName, { 
          scores: [], totalQuestions: 0, domain: domainName, 
          weightedScoreSum: 0, totalWeight: 0, rawScoreSum: 0, rawScoreCount: 0,
        });
    });

    let practiceTestScoresList = [];
    let officialQuizScoresList = [];
    let trendDataForStats = [];
    
    const sortedTests = [...allTests].sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const test of sortedTests) {
      if (!test.domains) continue;
      
      let testCorrect = 0;
      let testTotal = 0;

      for (const [domainName, data] of Object.entries(test.domains)) {
        if (domainName === config.UNCATEGORIZED_KEY) {
          if (data.total > 0) {
            uncategorizedTestEntries.push({ testId: test.id, label: test.label, date: test.date, scoreData: data });
          }
          continue; 
        }
        if (domainName === config.ALL_DOMAINS_KEY) continue;
        
        if (!domainHistory.has(domainName)) continue;
        
        const history = domainHistory.get(domainName);
        const score = calculatePercentage(data.correct, data.total);
        const weight = weights[test.type] || 1;
        
        history.scores.push(score);
        history.totalQuestions += data.total;
        history.weightedScoreSum += score * weight;
        history.totalWeight += weight;
        history.rawScoreSum += score;
        history.rawScoreCount += 1;
        
        testCorrect += data.correct;
        testTotal += data.total;
      }
      
      const noDomainScore = test.domains[config.ALL_DOMAINS_KEY];
      if (noDomainScore) {
        testCorrect = noDomainScore.correct;
        testTotal = noDomainScore.total;
      }

      const testScore = calculatePercentage(testCorrect, testTotal);
      const weight = weights[test.type] || 1;
      
      if (testTotal > 0) {
        if (test.type === 'practiceTest') practiceTestScoresList.push({ score: testScore, weight: weight });
        else if (test.type === 'officialQuiz') officialQuizScoresList.push({ score: testScore, weight: weight });

        trendDataForStats.push({
          session: test.label || `Test`,
          date: test.date,
          score: testScore,
          total: testTotal,
          type: test.type,
          weight: weight,
        });
      }
    }
    
    const practiceTestWeightedAverage = calculateWeightedAverage(practiceTestScoresList);
    const officialQuizWeightedAverage = calculateWeightedAverage(officialQuizScoresList);
    const practiceTestRawAverage = calculateRawAverage(practiceTestScoresList);
    const officialQuizRawAverage = calculateRawAverage(officialQuizScoresList);

    let weightedDomainStats = [];
    let rawDomainStats = []; 
    let weightedMasteryTiers = { 'Critical': 0, 'Weak': 0, 'Developing': 0, 'Strong': 0, 'Mastered': 0 };
    let rawMasteryTiers = { 'Critical': 0, 'Weak': 0, 'Developing': 0, 'Strong': 0, 'Mastered': 0 };
    let weightedPriorityDomains = [];
    let rawPriorityDomains = [];
    let validDomains = 0;
    let weightedMasteredCount = 0;
    let rawMasteredCount = 0;

    for (const [domainName, data] of domainHistory.entries()) {
      if (data.scores.length === 0) continue;
      validDomains++;

      const weightedAvgScore = data.totalWeight > 0 ? Math.round(data.weightedScoreSum / data.totalWeight) : 0;
      const rawAvgScore = data.rawScoreCount > 0 ? Math.round(data.rawScoreSum / data.rawScoreCount) : 0;
      const numScores = data.scores.length;
      const latestAccuracy = data.scores[numScores - 1];

      weightedDomainStats.push({ domain: data.domain, accuracy: weightedAvgScore, scores: data.scores });
      rawDomainStats.push({ domain: data.domain, accuracy: rawAvgScore, scores: data.scores });

      const isWeightedMastered = numScores >= config.MIN_ATTEMPTS_FOR_MASTERY && latestAccuracy >= config.MASTERY_LATEST_SCORE_THRESHOLD && weightedAvgScore >= config.MASTERY_AVG_THRESHOLD;
      if (isWeightedMastered) { weightedMasteryTiers['Mastered']++; weightedMasteredCount++; }
      else if (weightedAvgScore >= 80) weightedMasteryTiers['Strong']++;
      else if (weightedAvgScore >= 60) weightedMasteryTiers['Developing']++;
      else if (weightedAvgScore >= 40) weightedMasteryTiers['Weak']++;
      else weightedMasteryTiers['Critical']++;

      const isRawMastered = numScores >= config.MIN_ATTEMPTS_FOR_MASTERY && latestAccuracy >= config.MASTERY_LATEST_SCORE_THRESHOLD && rawAvgScore >= config.MASTERY_AVG_THRESHOLD;
      if (isRawMastered) { rawMasteryTiers['Mastered']++; rawMasteredCount++; }
      else if (rawAvgScore >= 80) rawMasteryTiers['Strong']++;
      else if (rawAvgScore >= 60) rawMasteryTiers['Developing']++;
      else if (rawAvgScore >= 40) rawMasteryTiers['Weak']++;
      else rawMasteryTiers['Critical']++;


      const priorityData = { domain: domainName, accuracy: latestAccuracy, totalQuestions: data.totalQuestions };
      if (weightedAvgScore < config.PASSING_SCORE) {
        weightedPriorityDomains.push({ ...priorityData, weightedAvg: weightedAvgScore, priority: (100 - weightedAvgScore) * data.totalQuestions });
      }
      
      if (data.rawScoreCount > 0) {
          const rawAvg = Math.round(data.rawScoreSum / data.rawScoreCount);
          rawPriorityDomains.push({ ...priorityData, weightedAvg: rawAvg, priority: (100 - rawAvg) * data.totalQuestions });
      }
    }
    
    weightedPriorityDomains.sort((a, b) => b.priority - a.priority);
    rawPriorityDomains.sort((a, b) => b.priority - a.priority);

    const buildMasteryData = (tiers) => Object.entries(tiers).map(([label, count], index) => ({
      label: label, count, percentage: calculatePercentage(count, validDomains || 1)
    })).filter(item => item.count > 0);

    const weightedMasteryData = buildMasteryData(weightedMasteryTiers);
    const rawMasteryData = buildMasteryData(rawMasteryTiers);
    
    const filteredTrendData = trendDataForStats.filter(d => trendFilter[d.type]);
    const trendData = filteredTrendData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const rawScores = trendData.map(d => d.score);

    const rawMean = rawScores.length > 0 ? Math.round(rawScores.reduce((s, v) => s + v, 0) / rawScores.length) : 0;
    const sortedScores = [...rawScores].sort((a, b) => a - b);
    const mid = Math.floor(sortedScores.length / 2);
    const rawMedian = rawScores.length % 2 !== 0 ? sortedScores[mid] : (sortedScores[mid - 1] + sortedScores[mid]) / 2;
    const trendSlope = calculateTrendSlope(rawScores);
    const trend = trendSlope > 0.1 ? 'Positive' : trendSlope < -0.1 ? 'Negative' : 'Stable';
    
    const rawTrendStats = { mean: rawMean, median: rawMedian || 0, trendSlope, trend };
    const weightedMean = calculateWeightedAverage(trendData);
    const weightedTrendStats = { ...rawTrendStats, mean: weightedMean };

    return {
      practiceTestWeightedAverage, officialQuizWeightedAverage,
      practiceTestRawAverage, officialQuizRawAverage,
      rawTrendStats, weightedTrendStats,
      weightedDomainStats, rawDomainStats,
      weightedMasteryData, rawMasteryData,
      weightedPriorityTopics: weightedPriorityDomains,
      rawPriorityTopics: rawPriorityDomains,
      officialQuizCount: allTests.filter(t => t.type === 'officialQuiz').length,
      practiceTestsCount: allTests.filter(t => t.type === 'practiceTest').length,
      weightedMasteredCount, rawMasteredCount,
      totalTopics: validDomains, trendData,
      existingDomains: activeDomains,
      studySessions: allStudySessions,
      journalEntries: allJournalEntries,
      uncategorizedTestEntries,
    };
  }, [certData, trendFilter, weights, appSettings]);
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExitingLoad, setIsExitingLoad] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Application...');
  
  const [isArcadeMode, setIsArcadeMode] = useState(false);
  const [transitionOpacity, setTransitionOpacity] = useState(0);

  const [activeTab, setActiveTab] = useState('overview');
  const [examData, setExamData] = useState(allExamData);
  const [activeCert, setActiveCert] = useState(() => Object.keys(allExamData)[0] || null);
  
  // 1. Initialize Settings (from LocalStorage or Default)
  const [appSettings, setAppSettings] = useState(() => {
    try {
        const saved = localStorage.getItem('certTrackerSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          // UPDATED: Only allow light and midnight themes. Fallback to light otherwise.
          if (!['light', 'midnight'].includes(parsed.theme)) parsed.theme = 'light';
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
    } catch(e) {}
    return DEFAULT_SETTINGS;
  });

  // 2. Helper Setters to update persistent settings
  const setTrendFilter = (updater) => {
    setAppSettings(prev => ({ ...prev, trendFilter: typeof updater === 'function' ? updater(prev.trendFilter) : updater }));
  };
  const setWeights = (updater) => {
    setAppSettings(prev => ({ ...prev, weights: typeof updater === 'function' ? updater(prev.weights) : updater }));
  };
  const setOverviewConfig = (updater) => {
    setAppSettings(prev => ({ ...prev, overviewConfig: typeof updater === 'function' ? updater(prev.overviewConfig) : updater }));
  };
  const setUseWeightedAverages = (value) => {
    setAppSettings(prev => ({ ...prev, useWeightedAverages: value }));
  };

  // 3. Derived Values
  const trendFilter = appSettings.trendFilter || DEFAULT_SETTINGS.trendFilter;
  const weights = appSettings.weights || DEFAULT_SETTINGS.weights;
  const useWeightedAverages = appSettings.useWeightedAverages ?? false;

  const [trophyStatus, setTrophyStatus] = useState({ red: true, gold: false, legend: false });
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showDataEntryModal, setShowDataEntryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isStudyModeActive, setIsStudyModeActive] = useState(false);
  const [isQuizModeActive, setIsQuizModeActive] = useState(false); 
  const [tbdQueue, setTbdQueue] = useState([]);
  const [currentTbdTopic, setCurrentTbdTopic] = useState(null);
  
  const [toast, setToast] = useState({ show: false, message: '', isError: false });
  const [confirmModal, setConfirmModal] = useState({ isVisible: false, title: '', message: '', onConfirm: () => {} });

  const showToast = (message, isError = false) => setToast({ show: true, message, isError });

  // Effective Settings
  const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveDarkMode = DARK_THEMES.includes(appSettings.theme) || (appSettings.theme === 'system' && isSystemDark);
  const activeSettings = { ...appSettings, darkMode: effectiveDarkMode };
  
  // App Classes for main container
  const appClasses = `min-h-screen app-text-main ${appSettings.useAccessibleFont ? 'font-accessible' : ''} ${appSettings.reduceMotion ? 'reduce-motion' : ''}`;

  // -- GUARANTEE SETTINGS PERSISTENCE --
  useEffect(() => {
    localStorage.setItem('certTrackerSettings', JSON.stringify(appSettings));
  }, [appSettings]);

  // LOCK BODY SCROLL WHEN MODALS ARE OPEN
  useEffect(() => {
    const isModalOpen = showSettingsModal || showAddCertModal || showDataEntryModal || confirmModal.isVisible || currentTbdTopic;
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSettingsModal, showAddCertModal, showDataEntryModal, confirmModal.isVisible, currentTbdTopic]);

  // Load Data
  useEffect(() => {
    const loadInitialData = async () => {
      const startTime = Date.now();
      
      // Inject theme styles immediately on load using saved settings
      injectThemeStyles();
      applyTheme(appSettings.theme, appSettings.colorblindMode);

      if (!appSettings.quickLoad) {
          setLoadingMessage('Initializing Theme Engine...');
          await new Promise(r => setTimeout(r, 800)); 
          setLoadingMessage('Loading Core Modules...');
          await new Promise(r => setTimeout(r, 1500));
          setLoadingMessage('Verifying Data Integrity...');
          await new Promise(r => setTimeout(r, 1500));
          setLoadingMessage('Configuring Visualization Engine...');
          await new Promise(r => setTimeout(r, 1500));
          setLoadingMessage('Preparing Workspace...');
      } else {
          setLoadingMessage('Quick Loading...');
      }

      const dataLoadPromise = loadData();
      const result = await dataLoadPromise;

      if (result && result.error) {
        showToast("Error loading data. Starting fresh.", true);
      } else {
        let loadedData = (result && result.data) || allExamData;
        let loadedSettings = (result && result.settings) || DEFAULT_SETTINGS;
        
        if (loadedSettings.darkMode !== undefined && !loadedSettings.theme) {
            loadedSettings.theme = loadedSettings.darkMode ? 'midnight' : 'light';
            delete loadedSettings.darkMode;
        }
        if (loadedSettings.theme === 'dark') loadedSettings.theme = 'midnight';

        setExamData(loadedData);
        setAppSettings(prev => ({
            ...loadedSettings,
            quickLoad: prev.quickLoad // Preserve the current session's quickLoad state
        }));
        setActiveCert(Object.keys(loadedData)[0] || null);
      }

      // Enforce 7 Second Minimum UNLESS quickLoad is true
      if (!appSettings.quickLoad) {
          const elapsedTime = Date.now() - startTime;
          const remainingTime = 7000 - elapsedTime; 
          if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
          }
      }
      
      // Start Fade Out Animation
      setIsExitingLoad(true);
      
      // Wait for Fade Out to complete before unmounting loading screen (500ms transition)
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      setIsLoading(false);
    };
    loadInitialData();
  }, []); // Run once on mount

  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (initialLoadRef.current) { initialLoadRef.current = false; return; }
    if (isLoading) return; 
    saveData(examData, appSettings);
  }, [examData, appSettings, isLoading]);

  useLayoutEffect(() => {
    applyTheme(appSettings.theme, appSettings.colorblindMode);
  }, [appSettings.theme, appSettings.colorblindMode]);

  useEffect(() => {
    if (!activeCert || isLoading) return;
    const cert = examData[activeCert];
    if (!cert || !cert.tests) return;
    
    const activeDomains = (cert.domains || []).filter(d => !d.isDeleted).map(d => d.name);
    const tbdDomains = new Set();

    cert.tests.forEach((test) => {
      if (test.domains && !test.isDeleted) {
        for (const domainName in test.domains) {
          if (!activeDomains.includes(domainName) && 
              domainName !== config.ALL_DOMAINS_KEY &&
              domainName !== config.UNCATEGORIZED_KEY) {
            tbdDomains.add(domainName);
          }
        }
      }
    });
    
    const topicsToFix = Array.from(tbdDomains).map(domainName => ({ domainName }));
    setTbdQueue(topicsToFix);
  }, [activeCert, examData, isLoading]);

  useEffect(() => {
    if (!currentTbdTopic && tbdQueue.length > 0) {
      setCurrentTbdTopic(tbdQueue[0]);
    }
  }, [tbdQueue, currentTbdTopic]);

  const handleHoldProgress = (progress) => {
    setTransitionOpacity(progress);
  };

  const handleEnterArcade = () => {
    setTransitionOpacity(1);
    setTimeout(() => {
       setIsArcadeMode(true);
       setTimeout(() => {
         setTransitionOpacity(0);
       }, 100); 
    }, 800);
  };

  const handleExitArcade = () => {
    setTransitionOpacity(1);
    setTimeout(() => {
       setIsArcadeMode(false);
       setTimeout(() => {
         setTransitionOpacity(0);
       }, 100);
    }, 800);
  };

  const handleAddTest = (newTest) => {
    setExamData(prev => {
      const newData = structuredClone(prev);
      newData[activeCert].tests.push(newTest);
      return newData;
    });
  };
  
  const handleAddStudySession = (newSession) => {
    setExamData(prev => {
      const newData = structuredClone(prev);
      newData[activeCert].studySessions.push(newSession);
      return newData;
    });
  };

  const handleAddJournalEntry = (newEntry) => {
    setExamData(prev => {
        const newData = structuredClone(prev);
        if (!newData[activeCert].journalEntries) {
            newData[activeCert].journalEntries = [];
        }
        newData[activeCert].journalEntries.push(newEntry);
        return newData;
    });
  };
  
  const handleAddDomain = (newDomainName) => {
    setExamData(prevData => {
        const newData = structuredClone(prevData);
        const cert = newData[activeCert];
        const existingDomain = cert.domains.find(d => d.name === newDomainName);
        
        if (existingDomain) {
          if (existingDomain.isDeleted) { existingDomain.isDeleted = false; showToast("Domain re-activated!"); }
          else { showToast("Domain already exists.", true); }
        } else {
          cert.domains.push({ name: newDomainName, isDeleted: false });
          showToast("Domain added!");
        }
        return newData;
    });
  };

  const createCertKeyFromName = (name, existingData) => {
    const baseKey = name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'cert';
    let key = baseKey;
    let i = 2;
    while (existingData[key]) {
      key = `${baseKey}_${i}`;
      i += 1;
    }
    return key;
  };

  const createCertObject = (name) => ({
    fullName: name,
    shortName: name.length > 18 ? name.slice(0, 15) + '…' : name,
    tests: [],
    domains: [],
    studySessions: [],
    journalEntries: [],
  });

  const handleAddCert = (certName) => {
    const trimmed = certName.trim();
    if (!trimmed) { showToast("Please enter a name.", true); return; }

    const newKey = createCertKeyFromName(trimmed, examData);

    setExamData(prevData => {
      const newData = structuredClone(prevData || {});
      newData[newKey] = createCertObject(trimmed);
      return newData;
    });

    setActiveCert(newKey);
    setShowAddCertModal(false);
    showToast("Certification added!");
  };

  const handleAddFirstCert = (certName) => {
    handleAddCert(certName);
  };
  
  const promptDeleteTest = (testId) => {
    setConfirmModal({
      isVisible: true, title: "Delete Test Entry?", message: "This will soft-delete the test. You can purge it from Settings.",
      onConfirm: () => {
        setExamData(prev => {
            const newData = structuredClone(prev);
            const test = newData[activeCert].tests.find(t => t.id === testId);
            if (test) test.isDeleted = true;
            return newData;
        });
        showToast("Test entry deleted.");
        closeConfirmModal();
      }
    });
  };

  const promptDeleteStudySession = (sessionId) => {
    setConfirmModal({
      isVisible: true, title: "Delete Session?", message: "This will soft-delete the session.",
      onConfirm: () => {
        setExamData(prev => {
            const newData = structuredClone(prev);
            const s = newData[activeCert].studySessions.find(i => i.id === sessionId);
            if (s) s.isDeleted = true;
            return newData;
        });
        showToast("Session deleted.");
        closeConfirmModal();
      }
    });
  };

  const promptDeleteDomain = (domainName) => {
    setConfirmModal({
        isVisible: true,
        title: `Delete Domain "${domainName}"?`,
        message: "This will soft-delete the domain. Any data associated with it will be moved to '[Uncategorized Data]'.",
        onConfirm: () => handleDeleteDomain(domainName)
    });
  };

  const handleDeleteDomain = (domainName) => {
    setExamData(prevData => {
        const newData = structuredClone(prevData);
        const cert = newData[activeCert];
        const domain = cert.domains.find(d => d.name === domainName);
        
        if (domain) {
            domain.isDeleted = true;
            cert.tests.forEach(test => {
                if (test.domains && test.domains[domainName]) {
                    const data = test.domains[domainName];
                    delete test.domains[domainName];
                    if (!test.domains[config.UNCATEGORIZED_KEY]) {
                        test.domains[config.UNCATEGORIZED_KEY] = { correct: 0, total: 0 };
                    }
                    test.domains[config.UNCATEGORIZED_KEY].correct += data.correct;
                    test.domains[config.UNCATEGORIZED_KEY].total += data.total;
                }
            });
        }
        return newData;
    });
    showToast("Domain deleted. Data moved to Uncategorized.");
    closeConfirmModal();
  };
  
  const handleReassignData = (testId, targetDomain) => {
    setExamData(prevData => {
        const newData = structuredClone(prevData);
        const cert = newData[activeCert];
        const test = cert.tests.find(t => t.id === testId);

        if (test && test.domains && test.domains[config.UNCATEGORIZED_KEY]) {
            const dataToMove = test.domains[config.UNCATEGORIZED_KEY];
            delete test.domains[config.UNCATEGORIZED_KEY];
            if (!test.domains[targetDomain]) {
                test.domains[targetDomain] = { correct: 0, total: 0 };
            }
            test.domains[targetDomain].correct += dataToMove.correct;
            test.domains[targetDomain].total += dataToMove.total;
        }
        return newData;
    });
    showToast(`Data reassigned to ${targetDomain}!`);
  };

  const handleUpdateTopicDomain = (topicInfo, newDomain) => {
    setExamData(prevData => {
      const newData = structuredClone(prevData);
      const cert = newData[activeCert];
      if (!cert.domains.find(d => d.name === newDomain)) {
        cert.domains.push({ name: newDomain, isDeleted: false });
      }
      cert.tests.forEach(test => {
        if (test.domains && test.domains[topicInfo.domainName]) {
          const data = test.domains[topicInfo.domainName];
          delete test.domains[topicInfo.domainName];
          test.domains[newDomain] = data;
        }
      });
      return newData;
    });
    setTbdQueue(prev => prev.slice(1));
    setCurrentTbdTopic(null);
    showToast("Domain renamed and added!");
  };

  const handlePurgeData = () => {
    setExamData(prev => {
        const newData = structuredClone(prev);
        Object.keys(newData).forEach(certKey => {
            const cert = newData[certKey];
            if (cert.tests) cert.tests = cert.tests.filter(t => !t.isDeleted);
            if (cert.domains) cert.domains = cert.domains.filter(d => !d.isDeleted);
            if (cert.studySessions) cert.studySessions = cert.studySessions.filter(s => !s.isDeleted);
            if (cert.journalEntries) cert.journalEntries = cert.journalEntries.filter(j => !j.isDeleted);
        });
        return newData;
    });
    showToast("Data purged from all certifications.");
    closeConfirmModal();
  };

  const closeConfirmModal = () => setConfirmModal({ isVisible: false, title: '', message: '', onConfirm: () => {} });

  const metrics = useCertificationMetrics(examData[activeCert], trendFilter, weights, activeSettings);
  const hasData = activeCert && metrics && (metrics.practiceTestsCount > 0 || metrics.officialQuizCount > 0 || (metrics.studySessions && metrics.studySessions.length > 0) || (metrics.journalEntries && metrics.journalEntries.length > 0));
  
  const hasAnyCerts = Object.keys(examData || {}).length > 0;
  
  const getTrophyLevel = () => {
      // Stubbed Trophy Logic
      return 'RED';
  };
  const currentTrophy = getTrophyLevel();
  const activeGradient = getActiveGradient();

  // FIX: Pass the isDarkMode prop directly to LoadingScreen to prevent flash
  if (isLoading) {
    return (
        <LoadingScreen 
            message={loadingMessage} 
            isExiting={isExitingLoad} 
            isDarkMode={effectiveDarkMode} 
        />
    );
  }
  
  // CONDITIONAL RENDER: Study Mode replaces the entire window
  if (isStudyModeActive) {
    return (
      <div className="w-full h-full overflow-hidden">
         <ThemeEffects theme={appSettings.theme} />
         {/* SUSPENSE WRAPPER FOR LAZY LOADING */}
         <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <h2 className="text-xl font-semibold">Loading Study Resources</h2>
                <p className="text-sm opacity-70 mt-2">Preparing high-resolution documents...</p>
            </div>
         }>
            <NetworkPlusGuide onClose={() => setIsStudyModeActive(false)} />
         </Suspense>
      </div>
    );
  }

  // CONDITIONAL RENDER: Quiz Mode
  if (isQuizModeActive) {
    return (
      <div className="w-full h-full overflow-hidden">
         <ThemeEffects theme={appSettings.theme} />
         <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <h2 className="text-xl font-semibold">Initializing Quiz Mode</h2>
            </div>
         }>
            <QuizApp onClose={() => setIsQuizModeActive(false)} />
         </Suspense>
      </div>
    );
  }

  // CONDITIONAL RENDER: Arcade Mode replaces the entire window
  if (isArcadeMode) {
    return (
        <>
            <div 
                className="fixed inset-0 z-[9999] pointer-events-none transition-all duration-75 ease-out"
                style={{ 
                    opacity: transitionOpacity,
                    backdropFilter: `blur(${transitionOpacity * 12}px)`,
                    backgroundColor: `rgba(0,0,0, ${transitionOpacity * 0.2})`
                }} 
            />
            <ArcadeGameRoot onExit={handleExitArcade} />
        </>
    );
  }
  
  // Logic for the main content animation (Fade In once loading exits)
  const mainContentClass = isExitingLoad ? 'animate-fadeIn' : 'opacity-0';

  if (!hasAnyCerts) {
    return (
      <div className={`${appClasses} p-8 ${mainContentClass}`}>
        {toast.show && (
          <ToastNotification
            message={toast.message}
            isError={toast.isError}
            onHide={() => setToast({ show: false, message: '', isError: false })}
          />
        )}
        <OnboardingModal onAddFirstCert={handleAddFirstCert} />
      </div>
    );
  }

  return (
    <>
      {/* Theme Effects - Global Backgrounds */}
      <ThemeEffects theme={appSettings.theme} />
      
      {/* Transition Overlay */}
      <div 
          className="fixed inset-0 z-[9999] pointer-events-none transition-all duration-75 ease-out"
          style={{ 
              opacity: transitionOpacity,
              backdropFilter: `blur(${transitionOpacity * 12}px)`,
              backgroundColor: `rgba(0,0,0, ${transitionOpacity * 0.2})`
          }} 
      />

      {/* MODALS AND OVERLAYS - MOVED OUTSIDE MAIN CONTENT */}
      {toast.show && <ToastNotification message={toast.message} isError={toast.isError} onHide={() => setToast({ show: false, message: '', isError: false })} />}
      {currentTbdTopic && <MetadataModal topic={currentTbdTopic} onClose={() => setCurrentTbdTopic(null)} onSubmit={handleUpdateTopicDomain} showToast={showToast} />}
      <ConfirmModal {...confirmModal} onCancel={closeConfirmModal} />
      
      <SettingsModal 
        isVisible={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        onPromptPurge={() => { setShowSettingsModal(false); setConfirmModal({ isVisible: true, title: "Purge Data?", message: "Permanently delete ALL items you've deleted? This affects all certifications.", onConfirm: handlePurgeData });}}
        appSettings={appSettings}
        setAppSettings={setAppSettings}
      />

      <AddCertModal 
        isVisible={showAddCertModal}
        onClose={() => setShowAddCertModal(false)}
        onAddCert={handleAddCert}
      />
      
      {activeCert && (
          <DataEntryModal 
             isVisible={showDataEntryModal}
             certData={examData[activeCert]}
             existingDomains={metrics?.existingDomains || []}
             uncategorizedEntries={metrics?.uncategorizedTestEntries || []}
             onAddTest={handleAddTest}
             onAddStudySession={handleAddStudySession}
             onAddDomain={handleAddDomain}
             onAddJournalEntry={handleAddJournalEntry}
             onDeleteTest={promptDeleteTest}
             onDeleteStudySession={promptDeleteStudySession}
             onDeleteDomain={promptDeleteDomain}
             onReassignData={handleReassignData}
             onClose={() => setShowDataEntryModal(false)}
             showToast={showToast}
          />
      )}

      {/* MAIN APP CONTENT */}
      <div className={`${appClasses} p-4 sm:p-8 ${mainContentClass} ${effectiveDarkMode ? 'dark' : ''}`}>
        <div className={`${appSettings.maxWidth} mx-auto relative z-10`}>
          
          <div className="flex justify-between items-center mb-4">
             <div>
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold app-text-main flex items-center">
                      Study Tracker
                      <span 
                        className="ml-2 app-gradient-text"
                      >
                        2
                      </span>
                    </h1>
                    <TrophyIcon level={currentTrophy} className="w-6 h-6 ml-2 app-gradient-text" />
                </div>
                
                <p className="text-xs app-text-muted font-mono mt-1">
                    Beta Version 1.0.9
                </p>
             </div>
             
             <div className="flex flex-col items-end gap-1">
                 <button 
                    className="text-sm font-medium transition-colors app-gradient-text hover:opacity-80"
                    onClick={() => setIsStudyModeActive(true)}
                 >
                    <span className="app-gradient-text">Study</span>
                 </button>
                 
                 <button 
                    className="text-sm font-medium transition-colors app-text-muted hover:app-text-main"
                    onClick={() => setIsQuizModeActive(true)}
                 >
                    Quiz
                 </button>
             </div>
          </div>
          
          <Navigation 
              examData={examData} 
              activeCert={activeCert} 
              onCertChange={setActiveCert} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onShowAddCertModal={() => setShowAddCertModal(true)}
          />
          
          {!hasData ? (
               <div className="app-bg-surface p-10 rounded-xl app-ring-primary ring-1 text-center mt-6">
                  <h2 className="text-xl font-semibold app-text-main">No Data Yet</h2>
                  <p className="app-text-muted mt-2">Click the "+" button to add your first domain and test.</p>
               </div>
          ) : (
              <div className="mt-6">
                  {activeTab === 'overview' && (
                      <OverviewSection 
                          metrics={metrics} 
                          useWeightedAverages={useWeightedAverages}
                          setUseWeightedAverages={setUseWeightedAverages} 
                          appSettings={activeSettings}
                          priorityTopics={metrics.weightedPriorityTopics}
                          rawPriorityTopics={metrics.rawPriorityTopics}
                          studySessions={metrics.studySessions}
                          trendData={metrics.trendData} 
                          trendFilter={trendFilter}
                          setTrendFilter={setTrendFilter}
                          overviewConfig={appSettings.overviewConfig || DEFAULT_SETTINGS.overviewConfig} 
                          setOverviewConfig={setOverviewConfig} 
                      />
                  )}
                  
                  {activeTab === 'priority' && (
                      <div>
                          <div className="flex justify-end mb-4 app-text-main">
                              <WeightedToggle useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} />
                          </div>
                          <TopicsForReview topics={useWeightedAverages ? metrics.weightedPriorityTopics : metrics.rawPriorityTopics} isWeighted={useWeightedAverages} appSettings={activeSettings} />
                      </div>
                  )}
                  
                  {activeTab === 'trends' && (
                      <PerformanceTrends 
                         trendData={metrics.trendData} 
                         rawTrendStats={metrics.rawTrendStats} 
                         weightedTrendStats={metrics.weightedTrendStats} 
                         useWeightedAverages={useWeightedAverages} 
                         setUseWeightedAverages={setUseWeightedAverages} 
                         trendFilter={trendFilter} 
                         setTrendFilter={setTrendFilter} 
                         weights={weights} 
                         setWeights={setWeights} 
                         appSettings={activeSettings} 
                      />
                  )}
                  
                  {activeTab === 'study log' && <StudyLog sessions={metrics.studySessions} journalEntries={metrics.journalEntries} />}
              </div>
          )}
        </div>
      </div>

      <SettingsFab 
           onOpenSettings={() => setShowSettingsModal(true)} 
           onEnterArcade={handleEnterArcade} 
           onHoldProgress={handleHoldProgress} 
      />
       
      <button 
        onClick={() => setShowDataEntryModal(true)} 
        className="fixed bottom-8 right-8 w-14 h-14 app-bg-primary text-white rounded-full flex items-center justify-center shadow-lg z-50 transition-transform hover:scale-110 active:scale-95 hover:shadow-xl app-hover-primary" 
        title="Add New Data"
      >
         <PlusIcon />
      </button>
    </>
  );
};

export default App;