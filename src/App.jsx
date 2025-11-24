import React, { useState, useMemo, useEffect, useRef } from 'react';
import { loadData, saveData } from './utils/fileStorage.js';
import { calculatePercentage, calculateWeightedAverage, calculateRawAverage, calculateTrendSlope, generateId } from './utils/helpers.js';
import { getScoreClass, getReviewClass, getMasteredClass, NORMAL_COLORS, COLORBLIND_SAFE_COLORS } from './utils/themeHelpers.js';
import { config, allExamData, DEFAULT_SETTINGS } from './config/appConfig.js';

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
import { PlusIcon } from './components/UI/Icons.jsx';

const useCertificationMetrics = (certData, trendFilter, weights, appSettings) => {
  return useMemo(() => {
    if (!certData) return null;
    
    const CURRENT_COLORS = appSettings.colorblindMode ? COLORBLIND_SAFE_COLORS : NORMAL_COLORS;
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

      // WEIGHTED calculations
      const weightedAvgScore = data.totalWeight > 0 ? Math.round(data.weightedScoreSum / data.totalWeight) : 0;
      const numScores = data.scores.length;
      const latestAccuracy = data.scores[numScores - 1];

      weightedDomainStats.push({ domain: data.domain, accuracy: weightedAvgScore, scores: data.scores });

      const isWeightedMastered = numScores >= config.MIN_ATTEMPTS_FOR_MASTERY && latestAccuracy >= config.MASTERY_LATEST_SCORE_THRESHOLD && weightedAvgScore >= config.MASTERY_AVG_THRESHOLD;
      if (isWeightedMastered) { weightedMasteryTiers['Mastered']++; weightedMasteredCount++; }
      else if (weightedAvgScore >= 80) weightedMasteryTiers['Strong']++;
      else if (weightedAvgScore >= 60) weightedMasteryTiers['Developing']++;
      else if (weightedAvgScore >= 40) weightedMasteryTiers['Weak']++;
      else weightedMasteryTiers['Critical']++;

      const priorityData = { domain: domainName, accuracy: latestAccuracy, totalQuestions: data.totalQuestions };
      if (weightedAvgScore < config.PASSING_SCORE) {
        weightedPriorityDomains.push({ ...priorityData, weightedAvg: weightedAvgScore, priority: (100 - weightedAvgScore) * data.totalQuestions });
      }
      
      // RAW (unweighted) calculations
      if (data.rawScoreCount > 0) {
          const rawAvg = Math.round(data.rawScoreSum / data.rawScoreCount);
          rawDomainStats.push({ domain: data.domain, accuracy: rawAvg, scores: data.scores });
          
          const isRawMastered = numScores >= config.MIN_ATTEMPTS_FOR_MASTERY && latestAccuracy >= config.MASTERY_LATEST_SCORE_THRESHOLD && rawAvg >= config.MASTERY_AVG_THRESHOLD;
          if (isRawMastered) { rawMasteryTiers['Mastered']++; rawMasteredCount++; }
          else if (rawAvg >= 80) rawMasteryTiers['Strong']++;
          else if (rawAvg >= 60) rawMasteryTiers['Developing']++;
          else if (rawAvg >= 40) rawMasteryTiers['Weak']++;
          else rawMasteryTiers['Critical']++;
          
          if (rawAvg < config.PASSING_SCORE) {
              rawPriorityDomains.push({ ...priorityData, weightedAvg: rawAvg, priority: (100 - rawAvg) * data.totalQuestions });
          }
      }
    }
    
    weightedPriorityDomains.sort((a, b) => b.priority - a.priority);
    rawPriorityDomains.sort((a, b) => b.priority - a.priority);

    const buildMasteryData = (tiers) => Object.entries(tiers).map(([label, count], index) => ({
      label: label, count, percentage: calculatePercentage(count, validDomains || 1), color: CURRENT_COLORS[index] 
    })).filter(item => item.count > 0);

    const weightedMasteryData = buildMasteryData(weightedMasteryTiers);
    
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
      weightedDomainStats,
      rawDomainStats,
      weightedMasteryData,
      rawMasteryData: buildMasteryData(rawMasteryTiers),
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
  
  const [activeTab, setActiveTab] = useState('overview');
  const [examData, setExamData] = useState(allExamData);
  const [appSettings, setAppSettings] = useState(DEFAULT_SETTINGS);
  const [activeCert, setActiveCert] = useState(() => Object.keys(allExamData)[0] || null);
  
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showDataEntryModal, setShowDataEntryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [tbdQueue, setTbdQueue] = useState([]);
  const [currentTbdTopic, setCurrentTbdTopic] = useState(null);
  
  const [trendFilter, setTrendFilter] = useState({ miniQuiz: true, officialQuiz: true, miniTest: true, practiceTest: true });
  const [weights, setWeights] = useState({ miniQuiz: 1, officialQuiz: 3, miniTest: 2, practiceTest: 5 });
  const [useWeightedAverages, setUseWeightedAverages] = useState(true);
  
  const [toast, setToast] = useState({ show: false, message: '', isError: false });
  const [confirmModal, setConfirmModal] = useState({ isVisible: false, title: '', message: '', onConfirm: () => {} });

  const showToast = (message, isError = false) => setToast({ show: true, message, isError });

  // Load Data
  useEffect(() => {
    const loadInitialData = async () => {
      
      const startTime = Date.now();
      setLoadingMessage('Loading Core Modules...');
      const dataLoadPromise = loadData();
      
      // Simulate Steps (7s logic)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingMessage('Verifying Data Integrity...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingMessage('Configuring Visualization Engine...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingMessage('Preparing Workspace...');

      const result = await dataLoadPromise;

      if (result && result.error) {
        showToast("Error loading data. Starting fresh.", true);
      } else {
        let loadedData = (result && result.data) || allExamData;
        let loadedSettings = (result && result.settings) || DEFAULT_SETTINGS;
        
        // Remove quickLoad option if it exists to clean up UI/Logic
        if (loadedSettings) {
            const { quickLoad, ...rest } = loadedSettings;
            loadedSettings = rest;
        }

        Object.keys(loadedData).forEach(certKey => {
          const cert = loadedData[certKey];
          if (cert.domains?.length > 0 && typeof cert.domains[0] === 'string') {
            cert.domains = cert.domains.map(name => ({ name, isDeleted: false }));
          }
          if (!cert.journalEntries) {
              cert.journalEntries = [];
          }
        });

        setExamData(loadedData);
        setAppSettings(loadedSettings);
        setActiveCert(Object.keys(loadedData)[0] || null);
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 7000 - elapsedTime;
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      setIsExitingLoad(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // Save Data
  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (initialLoadRef.current) { initialLoadRef.current = false; return; }
    if (isLoading) return; 
    
    // Ensure quickLoad is not saved
    const settingsToSave = { ...appSettings };
    if ('quickLoad' in settingsToSave) delete settingsToSave.quickLoad;
    
    saveData(examData, settingsToSave);
  }, [examData, appSettings, isLoading]);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    appSettings.darkMode ? root.classList.add('dark') : root.classList.remove('dark');
  }, [appSettings.darkMode]);

  // Data Integrity Effect
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
  
  // CSS Injection
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      @keyframes gradient-pan {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-gradient-text {
        background-size: 200% auto;
        animation: gradient-pan 3s linear infinite;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // --- HANDLERS ---
  
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
    setExamData(prev => {
      const newData = structuredClone(prev);
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

  const metrics = useCertificationMetrics(examData[activeCert], trendFilter, weights, appSettings);
  const hasData = activeCert && metrics && (metrics.practiceTestsCount > 0 || metrics.officialQuizCount > 0 || (metrics.studySessions && metrics.studySessions.length > 0) || (metrics.journalEntries && metrics.journalEntries.length > 0));
  const appClasses = `min-h-screen ${appSettings.useAccessibleFont ? 'font-accessible' : ''} ${appSettings.reduceMotion ? 'reduce-motion' : ''}`;
  
  const hasAnyCerts = Object.keys(examData || {}).length > 0;
  
  const normalGradient = 'linear-gradient(to right, #38bdf8, #a855f7, #ec4899)'; 
  const cbGradient = `linear-gradient(to right, ${COLORBLIND_SAFE_COLORS.join(', ')})`;
  const activeGradient = appSettings.colorblindMode ? cbGradient : normalGradient;

  // 1. SHOW LOADING SCREEN
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} isExiting={isExitingLoad} />;
  }
  
  const mainContentClass = isExitingLoad ? 'animate-fadeIn' : 'opacity-0';

  // 3. ONBOARDING
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

  // 4. DASHBOARD
  return (
    <div className={`${appClasses} p-4 sm:p-8 ${mainContentClass}`}>
      
      {toast.show && <ToastNotification message={toast.message} isError={toast.isError} onHide={() => setToast({ show: false, message: '', isError: false })} />}
      {currentTbdTopic && <MetadataModal topic={currentTbdTopic} onClose={handleCloseModal} onSubmit={handleUpdateTopicDomain} showToast={showToast} />}
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

      <div className={`${appSettings.maxWidth} mx-auto`}>
        
        {/* UNIFIED HEADER */}
        <div className="flex justify-between items-center mb-4">
           <div>
              <style>{`
                @keyframes gradient-pan {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                .animate-gradient-text {
                  background-size: 200% auto;
                  animation: gradient-pan 3s linear infinite;
                  -webkit-background-clip: text;
                  background-clip: text;
                  color: transparent;
                }
              `}</style>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                Study Tracker
                <span 
                  className="ml-2 animate-gradient-text"
                  style={{ backgroundImage: activeGradient }}
                >
                  2
                </span>
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">
                  Version 1.0.0
              </p>
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
             <div className="bg-white p-10 rounded-xl ring-1 ring-slate-200 text-center mt-6 dark:bg-gray-900 dark:ring-gray-800">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-100">No Data Yet</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Click the "+" button to add your first domain and test.</p>
             </div>
        ) : (
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="flex justify-end -mt-4">
                            <WeightedToggle useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatsCard title="Practice Test Avg" value={`${useWeightedAverages ? metrics.practiceTestWeightedAverage : metrics.practiceTestRawAverage}%`} subtitle={`${metrics.practiceTestsCount} tests`} color={getScoreClass(useWeightedAverages ? metrics.practiceTestWeightedAverage : metrics.practiceTestRawAverage, appSettings.colorblindMode)} />
                            <StatsCard title="Official Quiz Avg" value={`${useWeightedAverages ? metrics.officialQuizWeightedAverage : metrics.officialQuizRawAverage}%`} subtitle={`${metrics.officialQuizCount} quizzes`} color={getScoreClass(useWeightedAverages ? metrics.officialQuizWeightedAverage : metrics.officialQuizRawAverage, appSettings.colorblindMode)} />
                            <StatsCard title="For Review" value={useWeightedAverages ? metrics.weightedPriorityTopics.length : metrics.rawPriorityTopics.length} subtitle={`< ${config.PASSING_SCORE}% avg`} color={getReviewClass(useWeightedAverages ? metrics.weightedPriorityTopics.length : metrics.rawPriorityTopics.length, metrics.totalTopics, appSettings.colorblindMode)} />
                            <StatsCard title="Mastered" value={metrics.weightedMasteredCount} subtitle={`of ${metrics.totalTopics} domains`} color={getMasteredClass(metrics.weightedMasteredCount, metrics.totalTopics, appSettings.colorblindMode)} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DomainChart data={useWeightedAverages ? metrics.weightedDomainStats : metrics.rawDomainStats} isWeighted={useWeightedAverages} appSettings={appSettings} />
                            <MasteryChart data={useWeightedAverages ? metrics.weightedMasteryData : metrics.rawMasteryData} isWeighted={useWeightedAverages} appSettings={appSettings} />
                        </div>
                    </div>
                )}
                
                {activeTab === 'priority' && (
                    <div>
                        <div className="flex justify-end mb-4"><WeightedToggle useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} /></div>
                        <TopicsForReview topics={useWeightedAverages ? metrics.weightedPriorityTopics : metrics.rawPriorityTopics} isWeighted={useWeightedAverages} appSettings={appSettings} />
                    </div>
                )}
                
                {activeTab === 'trends' && (
                    <PerformanceTrends trendData={metrics.trendData} rawTrendStats={metrics.rawTrendStats} weightedTrendStats={metrics.weightedTrendStats} useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} trendFilter={trendFilter} setTrendFilter={setTrendFilter} weights={weights} setWeights={setWeights} appSettings={appSettings} />
                )}
                
                {activeTab === 'study log' && <StudyLog sessions={metrics.studySessions} journalEntries={metrics.journalEntries} />}
            </div>
        )}
      </div>
      
      <SettingsFab onOpenSettings={() => setShowSettingsModal(true)} />
      
      <button onClick={() => setShowDataEntryModal(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-sky-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-sky-700 dark:bg-blue-500 dark:hover:bg-blue-400" title="Add New Data">
        <PlusIcon />
      </button>
    </div>
  );
};

export default App;