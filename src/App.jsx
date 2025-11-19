import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import * as Recharts from 'recharts';
import { loadData, saveData } from './utils/fileStorage.js';
import AddCertModal from './components/Modals/AddCertModal.jsx';
import OnboardingModal from './components/Modals/OnboardingModal.jsx'; // optional, can stay unused for now
import { calculatePercentage, calculateWeightedAverage, calculateRawAverage, calculateTrendSlope, generateId } from './utils/helpers.js';
import { getScoreClass, getReviewClass, getMasteredClass, getTopicColorClasses, NORMAL_COLORS, COLORBLIND_SAFE_COLORS } from './utils/themeHelpers.js';
import { config, allExamData, DEFAULT_SETTINGS } from './config/appConfig.js';

// Import UI components (Some are stubs, but imports must resolve)
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
import { SettingsIcon } from './components/UI/Icons.jsx';


// --- CUSTOM HOOK FOR METRICS ---

const useCertificationMetrics = (certData, trendFilter, weights, appSettings) => {
  return useMemo(() => {
    if (!certData) return null;
    
    const CURRENT_COLORS = appSettings.colorblindMode ? COLORBLIND_SAFE_COLORS : NORMAL_COLORS;
    
    const allTests = (certData.tests || []).filter(t => !t.isDeleted);
    const allDomainsData = (certData.domains || []).filter(d => !d.isDeleted);
    const activeDomains = allDomainsData.map(d => d.name);
    const allStudySessions = (certData.studySessions || []).filter(s => !s.isDeleted);

    let uncategorizedTestEntries = [];
    const domainHistory = new Map();
    
    activeDomains.forEach(domainName => {
        domainHistory.set(domainName, { 
          scores: [], 
          totalQuestions: 0, 
          domain: domainName, 
          weightedScoreSum: 0, 
          totalWeight: 0,
          rawScoreSum: 0,
          rawScoreCount: 0,
        });
    });

    let practiceTestScoresList = [];
    let miniTestScoresList = [];
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
            uncategorizedTestEntries.push({
              testId: test.id,
              label: test.label,
              date: test.date,
              scoreData: data
            });
          }
          continue; 
        }
        if (domainName === config.ALL_DOMAINS_KEY) continue;
        
        if (!domainHistory.has(domainName)) {
          continue;
        }
        
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
        if (test.type === 'practiceTest') {
          practiceTestScoresList.push({ score: testScore, weight: weight });
        } else if (test.type === 'miniTest') {
          miniTestScoresList.push({ score: testScore, weight: weight });
        } else if (test.type === 'officialQuiz') { 
          officialQuizScoresList.push({ score: testScore, weight: weight });
        } else if (test.type === 'miniQuiz') {
          miniTestScoresList.push({ score: testScore, weight: weight });
        }

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
    const miniTestWeightedAverage = calculateWeightedAverage(miniTestScoresList);
    const officialQuizWeightedAverage = calculateWeightedAverage(officialQuizScoresList);
    const practiceTestRawAverage = calculateRawAverage(practiceTestScoresList);
    const miniTestRawAverage = calculateRawAverage(miniTestScoresList);
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

      // Mastery Tier Logic
      const isWeightedMastered = numScores >= config.MIN_ATTEMPTS_FOR_MASTERY && latestAccuracy >= config.MASTERY_LATEST_SCORE_THRESHOLD && weightedAvgScore >= config.MASTERY_AVG_THRESHOLD;
      if (isWeightedMastered) {
        weightedMasteryTiers['Mastered']++;
        weightedMasteredCount++;
      }
      else if (weightedAvgScore >= 80) weightedMasteryTiers['Strong']++;
      else if (weightedAvgScore >= 60) weightedMasteryTiers['Developing']++;
      else if (weightedAvgScore >= 40) weightedMasteryTiers['Weak']++;
      else weightedMasteryTiers['Critical']++;

      const priorityData = {
          domain: domainName,
          accuracy: latestAccuracy,
          totalQuestions: data.totalQuestions,
      };
      
      if (weightedAvgScore < config.PASSING_SCORE) {
        weightedPriorityDomains.push({
          ...priorityData,
          weightedAvg: weightedAvgScore,
          priority: (100 - weightedAvgScore) * data.totalQuestions,
        });
      }
    }
    
    weightedPriorityDomains.sort((a, b) => b.priority - a.priority);
    rawPriorityDomains.sort((a, b) => b.priority - a.priority);

    const buildMasteryData = (tiers) => Object.entries(tiers).map(([label, count], index) => ({
      label: label,
      count,
      percentage: calculatePercentage(count, validDomains || 1),
      color: CURRENT_COLORS[index] 
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
    
    const rawTrendStats = {
      mean: rawMean, median: rawMedian || 0,
      trendSlope, trend,
    };
    
    const weightedMean = calculateWeightedAverage(trendData);
    
    const weightedTrendStats = {
      ...rawTrendStats,
      mean: weightedMean,
    };


    return {
      practiceTestWeightedAverage,
      officialQuizWeightedAverage,
      miniTestWeightedAverage,
      practiceTestRawAverage,
      officialQuizRawAverage,
      miniTestRawAverage,
      
      rawTrendStats,
      weightedTrendStats,

      weightedDomainStats,
      weightedMasteryData,

      weightedPriorityTopics: weightedPriorityDomains,

      miniTestCount: allTests.filter(t => t.type === 'miniTest' || t.type === 'miniQuiz').length,
      officialQuizCount: allTests.filter(t => t.type === 'officialQuiz').length,
      practiceTestsCount: allTests.filter(t => t.type === 'practiceTest').length,
      weightedMasteredCount,
      totalTopics: validDomains,
      trendData,
      existingDomains: activeDomains,
      
      studySessions: allStudySessions,
      uncategorizedTestEntries,
    };
  }, [certData, trendFilter, weights, appSettings]);
};


// --- MAIN APP COMPONENT ---

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Initialize states, assuming data will be loaded via Effect
  const [examData, setExamData] = useState(allExamData);
  const [appSettings, setAppSettings] = useState(DEFAULT_SETTINGS);
  const [showAddCertModal, setShowAddCertModal] = useState(false);

  const [activeCert, setActiveCert] = useState(() => Object.keys(allExamData)[0] || null);
  
  const [tbdQueue, setTbdQueue] = useState([]);
  const [currentTbdTopic, setCurrentTbdTopic] = useState(null);
  
  const [showDataEntryModal, setShowDataEntryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [trendFilter, setTrendFilter] = useState({ miniQuiz: true, officialQuiz: true, miniTest: true, practiceTest: true });
  const [weights, setWeights] = useState({ miniQuiz: 1, officialQuiz: 3, miniTest: 2, practiceTest: 5 });
  const [useWeightedAverages, setUseWeightedAverages] = useState(true);
  
  const [toast, setToast] = useState({ show: false, message: '', isError: false });
  const [confirmModal, setConfirmModal] = useState({ 
    isVisible: false, 
    title: '', 
    message: '', 
    onConfirm: () => {} 
  });

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
  };

  // --- DATA LOADING EFFECT (Runs ONCE on app start) ---
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Attempting to load data from user directory...");
      const result = await loadData();

      if (result && result.error) {
        showToast("Error loading data from disk. Starting with blank state.", true);
        console.error("Load Data Error:", result.error);
        return;
      }
      
      let loadedData = result.data || allExamData;
      let loadedSettings = result.settings || DEFAULT_SETTINGS;
      
      // Perform data migration/cleanup to ensure consistency
      Object.keys(loadedData).forEach(certKey => {
        const cert = loadedData[certKey];
        if (!cert.domains) cert.domains = [];
        if (!cert.tests) cert.tests = [];
        if (!cert.studySessions) cert.studySessions = [];

        // Fix: Convert old string domain format to object format
        if (cert.domains.length > 0 && typeof cert.domains[0] === 'string') {
          cert.domains = cert.domains.map(name => ({ name, isDeleted: false }));
        }

        // Fix: Add missing IDs and deleted flags to tests/sessions
        cert.tests.forEach(t => {
          if (!t.id) t.id = generateId('test');
          if (t.isDeleted === undefined) t.isDeleted = false;
        });
        cert.studySessions.forEach(s => {
          if (!s.id) s.id = generateId('session');
          if (s.isDeleted === undefined) s.isDeleted = false;
        });
      });

      setExamData(loadedData);
      setAppSettings(loadedSettings);
      setActiveCert(Object.keys(loadedData)[0] || null);

      console.log("Data and settings successfully loaded/initialized.");
    };

    loadInitialData();
  }, []);

  // --- DATA SAVING EFFECT (Runs on ANY change to data or settings) ---
  const initialLoadRef = useRef(true);
  useEffect(() => {
    // Prevent saving immediately upon initial load
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const saveDataToDisk = async () => {
      console.log("Saving data and settings...");
      const result = await saveData(examData, appSettings);
      if (result && result.error) {
        showToast("Error saving data to disk. Progress may be lost.", true);
        console.error("Save Data Error:", result.error);
      }
    };

    saveDataToDisk();
  }, [examData, appSettings]);

  // --- THEME EFFECT (FIXED: Toggles dark class on HTML element) ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (appSettings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [appSettings.darkMode]);

  // --- Data Integrity Effects ---
  useEffect(() => {
    if (!activeCert) return;
    const cert = examData[activeCert];
    if (!cert || !cert.tests) return;
    
    const activeDomains = (cert.domains || []).filter(d => !d.isDeleted).map(d => d.name);
    const tbdDomains = new Set();

    cert.tests.forEach((test, testIndex) => {
      if (test.domains && !test.isDeleted) {
        for (const domainName in test.domains) {
          // Ignore special keys
          if (!activeDomains.includes(domainName) && 
              domainName !== config.ALL_DOMAINS_KEY &&
              domainName !== config.UNCATEGORIZED_KEY) {
            tbdDomains.add(domainName);
          }
        }
      }
    });
    
    const topicsToFix = Array.from(tbdDomains).map(domainName => ({
        domainName: domainName
    }));
    
    setTbdQueue(topicsToFix);
  }, [activeCert, examData]);

  useEffect(() => {
    if (!currentTbdTopic && tbdQueue.length > 0) {
      const nextTopic = tbdQueue[0];
      setCurrentTbdTopic(nextTopic);
    }
  }, [tbdQueue, currentTbdTopic]);
  
  // --- Data Handling Functions (Pass-throughs that trigger save) ---
  
  const handleAddTest = (newTest) => {
    setExamData(prevData => {
      const newData = structuredClone(prevData);
      newData[activeCert].tests.push(newTest);
      return newData;
    });
  };
  
  const handleAddStudySession = (newSession) => {
    setExamData(prevData => {
      const newData = structuredClone(prevData);
      newData[activeCert].studySessions.push(newSession);
      return newData;
    });
  };
  
  const handleAddDomain = (newDomainName) => {
    setExamData(prevData => {
      const newData = structuredClone(prevData);
      const cert = newData[activeCert];
      
      const existingDomain = cert.domains.find(d => d.name === newDomainName);
      
      if (existingDomain) {
        if (existingDomain.isDeleted) {
          existingDomain.isDeleted = false;
          showToast("Domain re-activated!");
        } else {
          showToast("Domain already exists.", true);
        }
      } else {
        cert.domains.push({ name: newDomainName, isDeleted: false });
        showToast("Domain added!");
      }
      return newData;
    });
  };

    // --- Certification Management (Add New Certs) ---

  const createCertKeyFromName = (name, existingData) => {
    const baseKey = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '') || 'cert';

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
    // Short name used in tabs; keep it compact so it doesn’t overflow.
    shortName: name.length > 18 ? name.slice(0, 15) + '…' : name,
    tests: [],
    domains: [],
    studySessions: [],
  });

  const handleAddCert = (certName) => {
    const trimmed = certName.trim();
    if (!trimmed) {
      showToast("Please enter a certification name.", true);
      return;
    }

    setExamData(prevData => {
      const newData = structuredClone(prevData || {});
      const key = createCertKeyFromName(trimmed, newData);

      newData[key] = createCertObject(trimmed);
      setActiveCert(key);

      return newData;
    });

    setShowAddCertModal(false);
    showToast("New certification added!");
  };

  // Optional: reuse for onboarding
  const handleAddFirstCert = (certName) => {
    handleAddCert(certName);
  };

  
  // --- Delete/Modify Functions ---
  
  const promptDeleteTest = (testId) => {
    setConfirmModal({
      isVisible: true,
      title: "Delete Test Entry?",
      message: "This will soft-delete the test. You can purge it from Settings.",
      onConfirm: () => handleDeleteTest(testId)
    });
  };

  const promptDeleteStudySession = (sessionId) => {
    setConfirmModal({
      isVisible: true,
      title: "Delete Study Session?",
      message: "This will soft-delete the session. You can purge it from Settings.",
      onConfirm: () => handleDeleteStudySession(sessionId)
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
  
  const handleDeleteTest = (testId) => {
    setExamData(prevData => {
      const newData = structuredClone(prevData);
      const test = newData[activeCert].tests.find(t => t.id === testId);
      if (test) {
        test.isDeleted = true;
      }
      return newData;
    });
    showToast("Test entry deleted.");
    closeConfirmModal();
  };

  const handleDeleteStudySession = (sessionId) => {
    setExamData(prevData => {
      const newData = structuredClone(prevData);
      const session = newData[activeCert].studySessions.find(s => s.id === sessionId);
      if (session) {
        session.isDeleted = true;
      }
      return newData;
    });
    showToast("Study session deleted.");
    closeConfirmModal();
  };
  
  const handleDeleteDomain = (domainName) => {
    setExamData(prevData => {
      const newData = structuredClone(prevData);
      const cert = newData[activeCert];
      const domain = cert.domains.find(d => d.name === domainName);
      
      if (domain) {
        domain.isDeleted = true;
        
        // Move data to Uncategorized
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

  const closeConfirmModal = () => {
    setConfirmModal({ isVisible: false, title: '', message: '', onConfirm: () => {} });
  };

  const handlePurgeData = () => {
    setExamData(prevData => {
      const newData = structuredClone(prevData);
      const cert = newData[activeCert];
      
      cert.tests = cert.tests.filter(t => !t.isDeleted);
      cert.domains = cert.domains.filter(d => !d.isDeleted);
      cert.studySessions = cert.studySessions.filter(s => !s.isDeleted);
      
      return newData;
    });
    showToast("All deleted data has been purged.");
    closeConfirmModal();
  };

  const promptPurgeData = () => {
    setShowSettingsModal(false);
    setConfirmModal({
      isVisible: true,
      title: "Permanently Purge Data?",
      message: "This will permanently delete all items you've previously 'deleted'. This action CANNOT be undone.",
      onConfirm: handlePurgeData
    });
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
    setTbdQueue(prevQueue => prevQueue.slice(1));
    setCurrentTbdTopic(null);
    showToast("Domain renamed and added!");
  };
  
  const handleCloseModal = () => {
    setTbdQueue(prevQueue => prevQueue.slice(1));
    setCurrentTbdTopic(null);
  };

  // --- Metrics & Data Prep ---
  const metrics = useCertificationMetrics(
    examData[activeCert], 
    trendFilter, 
    weights, 
    appSettings
  );
  
  const currentCertData = examData[activeCert] || { tests: [], domains: [], studySessions: [] };
  const hasData = activeCert && metrics &&
    (metrics.practiceTestsCount > 0 || metrics.officialQuizCount > 0 || metrics.miniTestCount > 0 || (metrics.studySessions && metrics.studySessions.length > 0));
    
  // --- Memoized Modals ---
  // Note: These now use the functional stubs provided.
  const DataEntryModalComponent = (
    <DataEntryModal
      activeCert={activeCert}
      certData={currentCertData}
      uncategorizedEntries={metrics?.uncategorizedTestEntries || []}
      existingDomains={metrics?.existingDomains || []}
      onAddTest={handleAddTest}
      onAddStudySession={handleAddStudySession}
      onAddDomain={handleAddDomain}
      onDeleteDomain={promptDeleteDomain}
      onDeleteTest={promptDeleteTest}
      onDeleteStudySession={promptDeleteStudySession}
      onReassignData={handleReassignData}
      onClose={() => setShowDataEntryModal(false)}
      showToast={showToast}
    />
  );
  
  const SettingsModalComponent = (
    <SettingsModal 
      isVisible={showSettingsModal} 
      onClose={() => setShowSettingsModal(false)} 
      onPromptPurge={promptPurgeData}
      appSettings={appSettings}
      setAppSettings={setAppSettings}
    />
  );

    const AddCertModalComponent = (
    <AddCertModal
      isVisible={showAddCertModal}
      onClose={() => setShowAddCertModal(false)}
      onAddCert={handleAddCert}
    />
  );
  
  // Apply root-level accessibility classes
  const appClasses = `
    min-h-screen
    ${appSettings.useAccessibleFont ? 'font-accessible' : ''}
    ${appSettings.reduceMotion ? 'reduce-motion' : ''}
  `;
    const hasAnyCerts = Object.keys(examData || {}).length > 0;

  // OPTIONAL: Full-screen onboarding before ANY certs exist
  if (!hasAnyCerts) {
    return (
      <div className={`${appClasses} p-8`}>
        {toast.show && (
          <ToastNotification
            message={toast.message}
            isError={toast.isError}
            onHide={() =>
              setToast({ show: false, message: '', isError: false })
            }
          />
        )}

        <OnboardingModal onAddFirstCert={handleAddFirstCert} />
      </div>
    );
  }

  // --- RENDER: No Data State ---
  if (!hasData) {
    return (
      <div className={`${appClasses} p-8`}>
        {/* FIXED: Added maxWidth wrapper */}
        <div className={`${appSettings.maxWidth} mx-auto`}>
          {toast.show && <ToastNotification message={toast.message} isError={toast.isError} onHide={() => setToast({ show: false, message: '', isError: false })} />}
          <ConfirmModal {...confirmModal} onCancel={closeConfirmModal} />
          {SettingsModalComponent}
          {AddCertModalComponent}
          
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Certification Tracker</h1>
          </div>
          
{activeCert && (
  <Navigation
    examData={examData}
    activeCert={activeCert}
    onCertChange={setActiveCert}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    onShowAddCertModal={() => setShowAddCertModal(true)}
  />
)}
          <div className="bg-white p-10 rounded-xl ring-1 ring-slate-200 text-center mt-6 dark:bg-gray-900 dark:ring-gray-800">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-100">No Data Yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Click the "+" button to add your domains, then add your first test.
            </p>
          </div>
          
          {/* FAB: Settings */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="fixed bottom-8 left-8 w-14 h-14 bg-slate-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700"
            title="Settings"
          >
            <SettingsIcon />
          </button>
          
          {/* FAB: Add */}
          <button
            onClick={() => setShowDataEntryModal(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            title="Add New Data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        
          {showDataEntryModal && activeCert && DataEntryModalComponent}
        </div>
      </div>
    );
  }

  // --- RENDER: Main Application ---
  return (
    <div className={`${appClasses} p-4 sm:p-8`}>
      {/* Render all modals at the top level */}
      {toast.show && <ToastNotification message={toast.message} isError={toast.isError} onHide={() => setToast({ show: false, message: '', isError: false })} />}
      {currentTbdTopic && <MetadataModal topic={currentTbdTopic} onClose={handleCloseModal} onSubmit={handleUpdateTopicDomain} showToast={showToast} />}
      <ConfirmModal {...confirmModal} onCancel={closeConfirmModal} />
      {SettingsModalComponent}

      <div className={`${appSettings.maxWidth} mx-auto`}>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Certification Tracker</h1>
        </div>
<Navigation
  examData={examData}
  activeCert={activeCert}
  onCertChange={setActiveCert}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  onShowAddCertModal={() => setShowAddCertModal(true)}
/>
        <div className="mt-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            (() => { 
              
              const currentPTAvg = useWeightedAverages ? metrics.practiceTestWeightedAverage : metrics.practiceTestRawAverage;
              const currentOQAvg = useWeightedAverages ? metrics.officialQuizWeightedAverage : metrics.officialQuizRawAverage;
              const reviewCount = useWeightedAverages ? metrics.weightedPriorityTopics.length : metrics.rawPriorityTopics.length;
              const currentMasteredCount = useWeightedAverages ? metrics.weightedMasteredCount : metrics.rawMasteredCount;

              // Get dynamic color classes (which now include dark mode)
              const ptColor = getScoreClass(currentPTAvg, appSettings.colorblindMode);
              const oqColor = getScoreClass(currentOQAvg, appSettings.colorblindMode);
              const reviewColor = getReviewClass(reviewCount, metrics.totalTopics, appSettings.colorblindMode);
              const masteredColor = getMasteredClass(currentMasteredCount, metrics.totalTopics, appSettings.colorblindMode);

              return (
                <div className="space-y-6">
                  <div className="flex justify-end mb- -mt-4">
                    <WeightedToggle useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard title="Practice Test Avg" value={`${currentPTAvg}%`} subtitle={`${metrics.practiceTestsCount} tests taken`} color={ptColor} />
                    <StatsCard title="Official Quiz Avg" value={`${currentOQAvg}%`} subtitle={`${metrics.officialQuizCount} quizzes taken`} color={oqColor} />
                    <StatsCard title="Domains for Review" value={reviewCount} subtitle={`< ${config.PASSING_SCORE}% avg`} color={reviewColor} />
                    <StatsCard title="Mastered Domains" value={currentMasteredCount} subtitle={`of ${metrics.totalTopics} domains`} color={masteredColor} />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DomainChart 
                      data={metrics.weightedDomainStats} 
                      isWeighted={useWeightedAverages} 
                      appSettings={appSettings}
                    />
                    <MasteryChart 
                      data={metrics.weightedMasteryData} 
                      isWeighted={useWeightedAverages}
                      appSettings={appSettings}
                    />
                  </div>
                </div>
              );
            })() 
          )}
          
          {/* Priority Tab */}
          {activeTab === 'priority' && 
            <div>
              <div className="flex justify-end mb-4">
                <WeightedToggle useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} />
              </div>
              <TopicsForReview 
                topics={metrics.weightedPriorityTopics} 
                isWeighted={useWeightedAverages} 
                appSettings={appSettings}
              />
            </div>
          }
          
          {/* Trends Tab */}
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
              appSettings={appSettings}
            />
          )}
          
          {/* Study Log Tab */}
          {activeTab === 'study log' && <StudyLog sessions={metrics.studySessions} />}
        </div>
      </div>
      
      {/* FAB: Settings */}
      <button
        onClick={() => setShowSettingsModal(true)}
        className="fixed bottom-8 left-8 w-14 h-14 bg-slate-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700"
        title="Settings"
      >
        <SettingsIcon />
      </button>
      
      {/* FAB: Add */}
      <button
        onClick={() => setShowDataEntryModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
        title="Add New Data"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      
      {showDataEntryModal && activeCert && DataEntryModalComponent}
    </div>
  );
};

export default App;