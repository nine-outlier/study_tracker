import React, { useState, useMemo, useEffect, useRef, useLayoutEffect, Suspense, lazy } from 'react';
import { saveData } from './utils/fileStorage.js'; 
import { calculatePercentage, calculateWeightedAverage, calculateRawAverage, calculateTrendSlope } from './utils/helpers.js';
import { createPortal } from 'react-dom';

import {
  getThemeRuntime
} from './utils/themeHelpers.js';

import {
  ThemeEngine,
  initThemeEngine,
  syncThemeEngine,
} from './utils/themeManager.js';

import { config, allExamData, DEFAULT_SETTINGS, PREMADE_DATA } from './config/appConfig.js';
import { DataProvider, useData } from './state/DataProvider.jsx'; 

import Navigation from './components/UI/Navigation.jsx';
import TopicsForReview from './components/UI/TopicsForReview.jsx';
import WeightedToggle from './components/UI/WeightedToggle.jsx';
import PerformanceTrends from './components/charts/PerformanceTrends.jsx';
import PredictionChart from './components/charts/PredictionChart.jsx';
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

const NetworkPlusGuide = lazy(() => import('./PremadeStudy/NetworkPlus.jsx'));

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

    const determineDomainRank = (avgScore, numScores, latestAccuracy) => {
      if (
        numScores >= config.MIN_ATTEMPTS_FOR_MASTERY &&
        latestAccuracy >= config.MASTERY_LATEST_SCORE_THRESHOLD &&
        avgScore >= config.MASTERY_AVG_THRESHOLD
      ) return 'Mastered';

      if (avgScore >= 80) return 'Strong';
      if (avgScore >= 60) return 'Developing';
      if (avgScore >= 40) return 'Weak';
      return 'Critical';
    };

    for (const [domainName, data] of domainHistory.entries()) {
      if (data.scores.length === 0) continue;
      validDomains++;

      const weightedAvgScore = data.totalWeight > 0 ? Math.round(data.weightedScoreSum / data.totalWeight) : 0;
      const rawAvgScore = data.rawScoreCount > 0 ? Math.round(data.rawScoreSum / data.rawScoreCount) : 0;
      const numScores = data.scores.length;
      const latestAccuracy = data.scores[numScores - 1];

      const weightedRank = determineDomainRank(weightedAvgScore, numScores, latestAccuracy);
      const rawRank = determineDomainRank(rawAvgScore, numScores, latestAccuracy);

      weightedDomainStats.push({ domain: data.domain, accuracy: weightedAvgScore, scores: data.scores, rank: weightedRank });
      rawDomainStats.push({ domain: data.domain, accuracy: rawAvgScore, scores: data.scores, rank: rawRank });

      weightedMasteryTiers[weightedRank]++;
      rawMasteryTiers[rawRank]++;

      if (weightedRank === 'Mastered') weightedMasteredCount++;
      if (rawRank === 'Mastered') rawMasteredCount++;

      const priorityData = { domain: domainName, accuracy: latestAccuracy, totalQuestions: data.totalQuestions };
      if (weightedAvgScore < config.PASSING_SCORE) {
        weightedPriorityDomains.push({
          ...priorityData,
          weightedAvg: weightedAvgScore,
          priority: (100 - weightedAvgScore) * data.totalQuestions,
          rank: weightedRank
        });
      }

      if (data.rawScoreCount > 0) {
        const rawAvg = Math.round(data.rawScoreSum / data.rawScoreCount);
        if (rawAvg < config.PASSING_SCORE) {
          rawPriorityDomains.push({
            ...priorityData,
            weightedAvg: rawAvg,
            priority: (100 - rawAvg) * data.totalQuestions,
            rank: rawRank
          });
        }
      }
    }

    weightedPriorityDomains.sort((a, b) => b.priority - a.priority);
    rawPriorityDomains.sort((a, b) => b.priority - a.priority);

    const buildMasteryData = (tiers) => Object.entries(tiers).map(([label, count]) => ({
      label,
      count,
      percentage: calculatePercentage(count, validDomains || 1)
    })).filter(item => item.count > 0);

    const weightedMasteryData = buildMasteryData(weightedMasteryTiers);
    const rawMasteryData = buildMasteryData(rawMasteryTiers);

    const filteredTrendData = trendDataForStats.filter(d => trendFilter[d.type]);
    const trendData = filteredTrendData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const rawScores = trendData.map(d => d.score);

    const rawMean = rawScores.length > 0 ? Math.round(rawScores.reduce((s, v) => s + v, 0) / rawScores.length) : 0;

    let rawMedian = 0;
    if (rawScores.length > 0) {
      const sortedScores = [...rawScores].sort((a, b) => a - b);
      const mid = Math.floor(sortedScores.length / 2);
      rawMedian = sortedScores.length % 2 !== 0
        ? sortedScores[mid]
        : (sortedScores[mid - 1] + sortedScores[mid]) / 2;
    }

    const trendSlope = rawScores.length > 1 ? calculateTrendSlope(rawScores) : 0;
    const trend = trendSlope > 0.1 ? 'Positive' : trendSlope < -0.1 ? 'Negative' : 'Stable';

    const determineSimpleRank = (score) => {
      if (score >= config.MASTERY_AVG_THRESHOLD) return 'Mastered';
      if (score >= 80) return 'Strong';
      if (score >= 60) return 'Developing';
      if (score >= 40) return 'Weak';
      return 'Critical';
    };

    const rawTrendStats = {
      mean: rawMean,
      median: rawMedian,
      trendSlope,
      trend,
      meanRank: determineSimpleRank(rawMean),
      medianRank: determineSimpleRank(rawMedian)
    };

    const weightedMean = calculateWeightedAverage(trendData);
    const weightedTrendStats = {
      ...rawTrendStats,
      mean: weightedMean,
      meanRank: determineSimpleRank(weightedMean)
    };

    const enrichedTrendData = trendData.map(d => ({
      ...d,
      rank: determineSimpleRank(d.score)
    }));

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
      totalTopics: validDomains,
      trendData: enrichedTrendData,
      existingDomains: activeDomains,
      studySessions: allStudySessions,
      journalEntries: allJournalEntries,
      uncategorizedTestEntries,
    };
  }, [certData, trendFilter, weights, appSettings]);
};

// --- Internal App Content (Used inside Provider) ---

const StudyTrackerContent = () => {
  // 1. Storage Access
  const { state, dispatch } = useData();
  const { examData, settings: appSettings, isLoaded } = state;

  // 2. Local UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isExitingLoad, setIsExitingLoad] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Application...');

  const [isArcadeMode, setIsArcadeMode] = useState(false);
  const [transitionOpacity, setTransitionOpacity] = useState(0);

  const [activeTab, setActiveTab] = useState('overview');
  // Initialize activeCert based on loaded data
  const [activeCert, setActiveCert] = useState(() => Object.keys(allExamData)[0] || null);

  // --- Inline Confirm Overlay ---
  const [confirmUI, setConfirmUI] = useState(null);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showDataEntryModal, setShowDataEntryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isStudyModeActive, setIsStudyModeActive] = useState(false);
  const [tbdQueue, setTbdQueue] = useState([]);
  const [currentTbdTopic, setCurrentTbdTopic] = useState(null);

  const openConfirm = ({ title, message, confirmText = 'Confirm', danger = false, onConfirm }) => {
    setConfirmUI({ title, message, confirmText, danger, onConfirm });
  };
  const closeConfirm = () => setConfirmUI(null);

  const ConfirmOverlay = () => {
    if (!confirmUI) return null;

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeConfirm}
        />
        <div className="relative z-[10000] w-full max-w-md rounded-2xl border app-bg-surface app-border p-5 shadow-2xl">
          <div className="text-base font-bold app-text-main">{confirmUI.title}</div>
          <div className="mt-2 text-sm app-text-muted whitespace-pre-line">
            {confirmUI.message}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeConfirm}
              className="rounded-xl px-4 py-2 text-sm font-semibold app-bg-highlight app-text-main hover:opacity-90 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  await confirmUI.onConfirm?.();
                } finally {
                  closeConfirm();
                }
              }}
              className="rounded-xl px-4 py-2 text-sm font-bold transition app-bg-highlight app-border border hover:opacity-90"
              style={{
                backgroundColor: 'var(--app-bg-highlight)',
                borderColor: 'var(--app-border)',
                color: confirmUI.danger ? 'var(--app-danger-text)' : 'var(--app-text-main)',
              }}
            >
              {confirmUI.confirmText}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // --- Soft-delete helpers ---

  const [confirmModal, setConfirmModal] = useState({ isVisible: false, title: '', message: '', onConfirm: () => {} });

  const confirmDanger = ({ title, message, confirmText = 'Delete', onConfirm }) => {
    if (typeof openConfirm === 'function') {
      openConfirm({ title, message, confirmText, danger: true, onConfirm });
      return;
    }
    setConfirmModal({
      isVisible: true,
      title,
      message,
      onConfirm: async () => {
        await onConfirm?.();
        setConfirmModal({ isVisible: false, title: '', message: '', onConfirm: () => {} });
      },
    });
  };

  const showToast = (message, isError = false) => setToast({ show: true, message, isError });

  // --- Actions mapped to Dispatch ---

  const promptDeleteTest = (testId) => {
    confirmDanger({
      title: 'Delete Test Entry?',
      message: 'This data will still be available in [Uncategorized Data]. You can purge it from Settings.',
      confirmText: 'Delete',
      onConfirm: async () => {
        dispatch({
            type: 'SOFT_DELETE_TEST',
            payload: { certId: activeCert, testId }
        });
        showToast('Test entry deleted.');
      },
    });
  };

  const handleReassignData = (testId, targetDomain) => {
    // Complex logic: Clone, Modify, Dispatch Full Update
    const next = structuredClone(examData);
    const cert = next?.[activeCert];
    if (!cert?.tests) return;

    const test = cert.tests.find((t) => t.id === testId);
    if (!test?.domains?.[config.UNCATEGORIZED_KEY]) return;

    const dataToMove = test.domains[config.UNCATEGORIZED_KEY];
    delete test.domains[config.UNCATEGORIZED_KEY];

    if (!test.domains[targetDomain]) test.domains[targetDomain] = { correct: 0, total: 0 };
    test.domains[targetDomain].correct += dataToMove.correct;
    test.domains[targetDomain].total += dataToMove.total;

    dispatch({ type: 'SET_EXAM_DATA', payload: next });
    showToast(`Data reassigned to ${targetDomain}!`);
  };

  const handleDeleteDomain = (domainName) => {
    // Complex logic: Clone, Modify, Dispatch Full Update
    const next = structuredClone(examData);
    const cert = next?.[activeCert];
    if (!cert) return;

    const domain = cert.domains?.find((d) => d.name === domainName);
    if (domain) domain.isDeleted = true;

    // Move any existing domain data into Uncategorized
    (cert.tests || []).forEach((test) => {
      if (!test?.domains?.[domainName]) return;
      const data = test.domains[domainName];
      delete test.domains[domainName];

      if (!test.domains[config.UNCATEGORIZED_KEY]) {
        test.domains[config.UNCATEGORIZED_KEY] = { correct: 0, total: 0 };
      }
      test.domains[config.UNCATEGORIZED_KEY].correct += data.correct;
      test.domains[config.UNCATEGORIZED_KEY].total += data.total;
    });

    dispatch({ type: 'SET_EXAM_DATA', payload: next });
    showToast('Domain deleted. Data moved to Uncategorized.');
  };

  const promptDeleteDomain = (domainName) => {
    confirmDanger({
      title: `Delete Domain "${domainName}"?`,
      message: "This will soft-delete the domain. Any data associated with it will be moved to '[Uncategorized Data]'.",
      confirmText: 'Delete',
      onConfirm: async () => handleDeleteDomain(domainName),
    });
  };

  const promptDeleteCert = (certKey) => {
    const certName = examData?.[certKey]?.fullName || examData?.[certKey]?.shortName || certKey;
    confirmDanger({
      title: `Delete Certification "${certName}"?`,
      message: 'This will permanently delete this certification and all its tests/domains/journal entries on this device.\n\nThis cannot be undone.',
      confirmText: 'Delete Certification',
      onConfirm: async () => {
        // If the modal is open, close it (handled by logic if needed, but safe here)
        dispatch({ type: 'DELETE_CERT', payload: certKey });
        showToast('Certification deleted.');
      },
    });
  };

  const isWipingRef = useRef(false);

  const performSystemWipe = async () => {
    try {
      isWipingRef.current = true;
      setShowSettingsModal(false);
      try { localStorage.clear(); } catch (e) {}
      try { sessionStorage.clear(); } catch (e) {}
      
      // Force disk wipe before reload
      try { await saveData({}, DEFAULT_SETTINGS); } catch (e) {}

      dispatch({ type: 'SET_EXAM_DATA', payload: {} });
      dispatch({ type: 'SET_SETTINGS', payload: DEFAULT_SETTINGS });
    } finally {
      window.location.reload();
    }
  };

  const promptSystemWipe = () => {
    setShowSettingsModal(false);
    openConfirm({
      title: 'System Wipe?',
      message: 'Factory reset: this will delete ALL local data and settings for this app on this device.\n\nThis cannot be undone.',
      confirmText: 'Delete Everything',
      danger: true,
      onConfirm: async () => {
        await performSystemWipe();
      },
    });
  };

  // --- Handlers for Data Entry ---

  const handleAddTest = (newTest) => {
    dispatch({ 
        type: 'ADD_TEST_RESULT', 
        payload: { certId: activeCert, testData: newTest } 
    });
  };

  const handleAddStudySession = (newSession) => {
    dispatch({ 
        type: 'ADD_SESSION', 
        payload: { certId: activeCert, sessionData: newSession } 
    });
  };

  const handleAddJournalEntry = (newEntry) => {
    const next = structuredClone(examData);
    if (!next[activeCert].journalEntries) next[activeCert].journalEntries = [];
    next[activeCert].journalEntries.push(newEntry);
    dispatch({ type: 'SET_EXAM_DATA', payload: next });
  };

  const handleAddDomain = (newDomainName) => {
     dispatch({
         type: 'ADD_DOMAIN',
         payload: { certId: activeCert, domainName: newDomainName }
     });
     showToast("Domain added/updated!");
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

  const handleAddCert = (certName) => {
    const trimmed = certName.trim();
    if (!trimmed) { showToast("Please enter a name.", true); return; }

    const newKey = createCertKeyFromName(trimmed, examData);
    
    dispatch({
        type: 'ADD_CERT',
        payload: { key: newKey, name: trimmed }
    });

    setActiveCert(newKey);
    setShowAddCertModal(false);
    showToast("Certification added!");
  };

  const handleAddFirstCert = (certName) => {
    handleAddCert(certName);
  };

  // --- INTEGRATION: Handle Premade Selection (Network+) ---
  const handleTogglePremade = (certKey, predefinedDomains = []) => {
    let domainsToAdd = predefinedDomains;
    let certName = 'Certification';

    // 1. Resolve Data from Config (Failsafe)
    if (PREMADE_DATA && PREMADE_DATA[certKey]) {
        certName = PREMADE_DATA[certKey].name;
        if (!domainsToAdd || domainsToAdd.length === 0) {
            domainsToAdd = PREMADE_DATA[certKey].domains || [];
        }
    }

    const cert = examData[certKey];

    // Case A: Cert doesn't exist -> Create it (Atomic)
    if (!cert) {
       dispatch({
         type: 'ADD_PREMADE_CERT',
         payload: { key: certKey, name: certName, domains: domainsToAdd }
       });
       setActiveCert(certKey);
       showToast(`Enabled ${PREMADE_DATA?.[certKey]?.short || certName}`);
       return;
    }

    // Case B: Cert exists but is hidden -> Show it
    if (cert.isHidden) {
       dispatch({
         type: 'TOGGLE_CERT_VISIBILITY',
         payload: { key: certKey, isHidden: false }
       });
       setActiveCert(certKey);
       showToast(`Enabled ${PREMADE_DATA?.[certKey]?.short || certName || cert.fullName}`);
       return;
    }

    // Case C: Cert exists and is visible -> Hide it
    if (!cert.isHidden) {
       dispatch({
         type: 'TOGGLE_CERT_VISIBILITY',
         payload: { key: certKey, isHidden: true }
       });
       
       // If we just hid the active cert, switch to another one
       if (activeCert === certKey) {
          const otherKeys = Object.keys(examData).filter(k => k !== certKey && !examData[k].isHidden);
          setActiveCert(otherKeys.length > 0 ? otherKeys[0] : null);
       }
       showToast(`Disabled ${PREMADE_DATA?.[certKey]?.short || certName || cert.fullName}`);
    }
  };

  const closeConfirmModal = () => setConfirmModal({ isVisible: false, title: '', message: '', onConfirm: () => {} });

  // --- Settings Setters (Dispatch Wrappers) ---
  
  const updateSettings = (updater) => {
      const nextSettings = typeof updater === 'function' 
        ? updater(appSettings) 
        : updater;
      
      dispatch({ type: 'SET_SETTINGS', payload: nextSettings });
  };

  const setTrendFilter = (updater) => {
    const current = appSettings.trendFilter || DEFAULT_SETTINGS.trendFilter;
    const next = typeof updater === 'function' ? updater(current) : updater;
    updateSettings({ ...appSettings, trendFilter: next });
  };

  const setWeights = (updater) => {
    const current = appSettings.weights || DEFAULT_SETTINGS.weights;
    const next = typeof updater === 'function' ? updater(current) : updater;
    updateSettings({ ...appSettings, weights: next });
  };

  const setOverviewConfig = (updater) => {
    const current = appSettings.overviewConfig || DEFAULT_SETTINGS.overviewConfig;
    const next = typeof updater === 'function' ? updater(current) : updater;
    updateSettings({ ...appSettings, overviewConfig: next });
  };

  const setUseWeightedAverages = (updater) => {
    const current = appSettings.useWeightedAverages ?? false;
    const next = typeof updater === 'function' ? updater(current) : updater;
    updateSettings({ ...appSettings, useWeightedAverages: next });
  };

  // --- Filter Visible Data for UI ---
  // This ensures deleted/hidden certs don't appear in Navigation or lists
  const visibleExamData = useMemo(() => {
    if (!examData) return {};
    const filtered = {};
    Object.keys(examData).forEach(key => {
      if (!examData[key].isHidden) {
        filtered[key] = examData[key];
      }
    });
    return filtered;
  }, [examData]);

  // --- Keep Active Cert Valid ---
  useEffect(() => {
    const keys = Object.keys(visibleExamData);
    if (!keys.length) {
      if (activeCert !== null) setActiveCert(null);
      return;
    }
    // If active cert is no longer in visible list (e.g. was hidden), switch
    if (!activeCert || !keys.includes(activeCert)) {
      setActiveCert(keys[0]);
    }
  }, [visibleExamData, activeCert]);


  // --- Loading Logic (Updated for Provider) ---
  useEffect(() => {
    const loadInitialData = async () => {
      const startTime = Date.now();

      initThemeEngine(appSettings.theme, appSettings.colorblindMode);

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
      
      // Wait for Provider to be ready
      if (!isLoaded) return; 

      if (!appSettings.quickLoad) {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 7000 - elapsedTime;
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
      }

      setIsExitingLoad(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };

    if (isLoaded) {
        loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]); // Trigger when provider says data is ready

  useLayoutEffect(() => {
    syncThemeEngine(appSettings.theme, appSettings.colorblindMode);
  }, [appSettings.theme, appSettings.colorblindMode]);


  // --- TBD Domains Detection ---
  useEffect(() => {
    if (!activeCert || isLoading) return;
    const cert = examData[activeCert];
    if (!cert || !cert.tests) return;

    const activeDomains = (cert.domains || []).filter(d => !d.isDeleted).map(d => d.name);
    const tbdDomains = new Set();

    cert.tests.forEach((test) => {
      if (test.domains && !test.isDeleted) {
        for (const domainName in test.domains) {
          if (
            !activeDomains.includes(domainName) &&
            domainName !== config.ALL_DOMAINS_KEY &&
            domainName !== config.UNCATEGORIZED_KEY
          ) {
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


  // --- Derived Values & UI Helpers ---
  const trendFilter = appSettings.trendFilter || DEFAULT_SETTINGS.trendFilter;
  const weights = appSettings.weights || DEFAULT_SETTINGS.weights;
  const useWeightedAverages = appSettings.useWeightedAverages ?? false;

  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const { effectiveDarkMode, activeSettings, rootDarkClass } = useMemo(
    () => getThemeRuntime(appSettings),
    [appSettings]
  );

  const appClasses = `min-h-screen app-bg-page app-text-main ${appSettings.useAccessibleFont ? 'font-accessible' : ''} ${appSettings.reduceMotion ? 'reduce-motion' : ''}`;

  useEffect(() => {
    if (activeTab === 'study log') setActiveTab('overview');
  }, [activeTab]);
  
  useEffect(() => {
    const isModalOpen =
      showSettingsModal || showAddCertModal || showDataEntryModal || confirmModal.isVisible || currentTbdTopic || !!confirmUI;
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSettingsModal, showAddCertModal, showDataEntryModal, confirmModal.isVisible, currentTbdTopic, confirmUI]);


  // --- Ranking Engine ---
  const rankingEngine = useMemo(() => ({
    determineRank: (score) => {
      if (score >= config.MASTERY_AVG_THRESHOLD) return 'Mastered';
      if (score >= 80) return 'Strong';
      if (score >= 60) return 'Developing';
      if (score >= 40) return 'Weak';
      return 'Critical';
    },
    getRankColor: (rank) => {
      switch (rank) {
        case 'Mastered': return 'var(--chart-4)';
        case 'Strong': return 'var(--chart-5)';
        case 'Developing': return 'var(--chart-3)';
        case 'Weak': return 'var(--chart-2)';
        case 'Critical': return 'var(--chart-1)';
        default: return 'var(--chart-1)';
      }
    },
    getRankClass: (rank, type = 'text') => {
      let suffix = '1';
      switch (rank) {
        case 'Mastered': suffix = '4'; break;
        case 'Strong': suffix = '5'; break;
        case 'Developing': suffix = '3'; break;
        case 'Weak': suffix = '2'; break;
        case 'Critical': suffix = '1'; break;
        default: suffix = '1';
      }
      return `app-${type}-chart-${suffix}`;
    },
    getReviewRankClass: (count, total) => {
      if (total === 0 || count === 0) return 'app-text-chart-4';
      const ratio = count / total;
      if (ratio <= 0.15) return 'app-text-chart-5';
      if (ratio <= 0.35) return 'app-text-chart-3';
      if (ratio <= 0.60) return 'app-text-chart-2';
      return 'app-text-chart-1';
    },
    getMasteredRankClass: (count, total) => {
      if (total === 0) return 'app-text-chart-1';
      const ratio = count / total;
      if (ratio >= 0.90) return 'app-text-chart-4';
      if (ratio >= 0.70) return 'app-text-chart-5';
      if (ratio >= 0.45) return 'app-text-chart-3';
      if (ratio >= 0.20) return 'app-text-chart-2';
      return 'app-text-chart-1';
    }
  }), []);

  // --- CSS Injection ---
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --chart-1: var(--app-chart-1);
        --chart-2: var(--app-chart-2);
        --chart-3: var(--app-chart-3);
        --chart-4: var(--app-chart-4);
        --chart-5: var(--app-chart-5);
      }

      .app-text-chart-1 { color: var(--chart-1) !important; }
      .app-text-chart-2 { color: var(--chart-2) !important; }
      .app-text-chart-3 { color: var(--chart-3) !important; }
      .app-text-chart-4 { color: var(--chart-4) !important; }
      .app-text-chart-5 { color: var(--chart-5) !important; }

      .app-bg-chart-1 { background-color: var(--chart-1) !important; }
      .app-bg-chart-2 { background-color: var(--chart-2) !important; }
      .app-bg-chart-3 { background-color: var(--chart-3) !important; }
      .app-bg-chart-4 { background-color: var(--chart-4) !important; }
      .app-bg-chart-5 { background-color: var(--chart-5) !important; }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleHoldProgress = (progress) => {
    setTransitionOpacity(progress);
  };

  const handleEnterArcade = () => {
    setTransitionOpacity(1);
    setTimeout(() => {
      setIsArcadeMode(true);
      setTimeout(() => setTransitionOpacity(0), 100);
    }, 800);
  };

  const handleExitArcade = () => {
    setTransitionOpacity(1);
    setTimeout(() => {
      setIsArcadeMode(false);
      setTimeout(() => setTransitionOpacity(0), 100);
    }, 800);
  };

  const metrics = useCertificationMetrics(examData[activeCert], trendFilter, weights, activeSettings);
  const hasData = activeCert && metrics && (
    metrics.practiceTestsCount > 0 ||
    metrics.officialQuizCount > 0 ||
    (metrics.studySessions && metrics.studySessions.length > 0) ||
    (metrics.journalEntries && metrics.journalEntries.length > 0)
  );

  const hasAnyCerts = Object.keys(visibleExamData).length > 0;

  const weightedToggleNode = (
    <div className="relative top-0.5">
      <WeightedToggle
        useWeightedAverages={useWeightedAverages}
        setUseWeightedAverages={setUseWeightedAverages}
      />
    </div>
  );

  const overlayStyle = {
    opacity: transitionOpacity,
    backgroundColor: `rgba(0,0,0, ${transitionOpacity * 0.2})`,
  };

  // --- Determine if Study button should be active ---
  const isPremadeCert = examData[activeCert]?.isPremade || !!PREMADE_DATA[activeCert];
  // Currently, only 'network_plus' has a supported guide/quiz app
  const isSupportedStudy = activeCert === 'network_plus';

  // --- Render ---

  if (isLoading) {
    return (
      <LoadingScreen
        message={loadingMessage}
        isExiting={isExitingLoad}
        isDarkMode={effectiveDarkMode}
      />
    );
  }

  if (isStudyModeActive) {
    return (
      <div className={`w-full h-full overflow-hidden ${appClasses} ${rootDarkClass}`}>
        <ThemeEffects theme={appSettings.theme} />
        <Suspense
          fallback={
            <div className={`flex flex-col items-center justify-center h-screen w-full ${appClasses} ${rootDarkClass}`}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 app-border-strong mb-4"></div>
              <h2 className="text-xl font-semibold app-text-main">Loading Study Resources</h2>
              <p className="text-sm app-text-muted mt-2">Preparing high-resolution documents...</p>
            </div>
          }
        >
          <NetworkPlusGuide 
            onClose={() => setIsStudyModeActive(false)}
            appSettings={appSettings}
          />
        </Suspense>
      </div>
    );
  }

  if (isArcadeMode) {
    return (
      <>
        <div
          className="fixed inset-0 z-[9999] pointer-events-none transition-all duration-75 ease-out"
          style={overlayStyle}
        />
        <ArcadeGameRoot onExit={handleExitArcade} />
      </>
    );
  }

  const mainContentClass = isExitingLoad ? 'animate-fadeIn' : 'opacity-0';

  if (!hasAnyCerts) {
    return (
      <div className={`${appClasses} p-8 ${mainContentClass} ${rootDarkClass}`}>
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
      <ThemeEffects theme={appSettings.theme} />
      <ThemeEngine theme={appSettings.theme} colorblindMode={appSettings.colorblindMode} />

      <div
        className="fixed inset-0 z-[9999] pointer-events-none transition-all duration-75 ease-out"
        style={overlayStyle}
      />

      {toast.show && (
        <ToastNotification
          message={toast.message}
          isError={toast.isError}
          onHide={() => setToast({ show: false, message: '', isError: false })}
        />
      )}
      {currentTbdTopic && (
        <MetadataModal
          topic={currentTbdTopic}
          onClose={() => setCurrentTbdTopic(null)}
          onSubmit={() => {}}
          showToast={showToast}
        />
      )}
      <ConfirmModal {...confirmModal} onCancel={closeConfirmModal} />
      <ConfirmOverlay />

      <SettingsModal
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onPromptPurge={() => {
          setShowSettingsModal(false);
          setConfirmModal({
            isVisible: true,
            title: "Purge Data?",
            message: "Permanently delete ALL items you've deleted? This affects all certifications.",
            onConfirm: () => {}
          });
        }}
        onSystemWipe={promptSystemWipe}
        appSettings={appSettings}
        setAppSettings={updateSettings}
      />

      {/* ✅ AddCertModal is now the manager with toggle props AND delete props */}
      <AddCertModal
        isVisible={showAddCertModal}
        onClose={() => setShowAddCertModal(false)}
        onAddCert={handleAddCert}
        onToggleCert={handleTogglePremade} // Using the consolidated handler
        onDeleteCert={promptDeleteCert} // ✅ Passing the delete handler!
        examData={examData} // Pass FULL data to see hidden items
      />

      {activeCert && (
        <DataEntryModal
          isVisible={showDataEntryModal}
          activeCert={activeCert}
          certData={examData[activeCert]}
          existingDomains={metrics?.existingDomains || []}
          uncategorizedEntries={metrics?.uncategorizedTestEntries || []}
          onAddTest={handleAddTest}
          onAddDomain={handleAddDomain}
          onAddJournalEntry={handleAddJournalEntry}
          onDeleteTest={promptDeleteTest}
          onDeleteDomain={promptDeleteDomain}
          onReassignData={handleReassignData}
          // Passed proper premade flag
          isPremade={isPremadeCert}
          onClose={() => setShowDataEntryModal(false)}
          showToast={showToast}
        />
      )}

      <div className={`${appClasses} p-4 sm:p-8 ${mainContentClass} ${rootDarkClass} relative`}>
        <div className={`${appSettings.maxWidth} mx-auto relative z-10`}>

          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold app-text-main flex items-center">
                  Study Tracker
                  <span className="ml-2 app-gradient-text">2</span>
                </h1>
                <TrophyIcon level={'RED'} className="w-6 h-6 ml-2 app-gradient-text" />
              </div>
              <p className="text-xs app-text-muted font-mono mt-1">Version 1.2.0</p>
            </div>

            <div className="flex flex-col items-end gap-1 self-start">
              <button
                className={`text-sm font-medium transition-colors ${
                  isSupportedStudy 
                    ? 'app-gradient-text hover:opacity-80' 
                    : 'text-gray-400 cursor-not-allowed opacity-50'
                }`}
                disabled={!isSupportedStudy}
                title={isSupportedStudy ? "Launch Study Mode" : "Study Mode not available for this certification"}
                onClick={() => setIsStudyModeActive(true)}
              >
                <span className={isSupportedStudy ? "app-gradient-text" : ""}>Study</span>
              </button>
            </div>
          </div>

          <Navigation
            examData={visibleExamData} // ✅ Pass ONLY visible certs to Navigation
            activeCert={activeCert}
            onCertChange={setActiveCert}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onShowAddCertModal={() => setShowAddCertModal(true)}
            onDeleteCert={promptDeleteCert}
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
                  rankingEngine={rankingEngine}
                />
              )}

              {activeTab === 'priority' && (
                <TopicsForReview
                  topics={useWeightedAverages ? metrics.weightedPriorityTopics : metrics.rawPriorityTopics}
                  isWeighted={useWeightedAverages}
                  appSettings={activeSettings}
                  headerRight={weightedToggleNode}
                />
              )}

              {activeTab === 'trends' && (
                <>
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
                    rankingEngine={rankingEngine}
                  />
                  <div className="mt-6">
                    <PredictionChart
                      trendData={metrics.trendData}
                      rankingEngine={rankingEngine}
                      appSettings={activeSettings}
                    />
                  </div>
                </>
              )}
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
        className="fixed bottom-8 right-8 w-14 h-14 app-bg-primary app-text-on-primary rounded-full flex items-center justify-center shadow-lg z-50 transition-transform hover:scale-110 active:scale-95 hover:shadow-xl app-hover-primary"
        title="Add New Data"
      >
        <PlusIcon />
      </button>
    </>
  );
};

const App = () => (
  <DataProvider>
    <StudyTrackerContent />
  </DataProvider>
);

export default App;