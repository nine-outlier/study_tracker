import React, { useState } from 'react';
import StatsCard from '../UI/StatsCard.jsx';
import WeightedToggle from '../UI/WeightedToggle.jsx';
import DomainChart from '../charts/DomainChart.jsx';
import MasteryChart from '../charts/MasteryChart.jsx';
import DomainOverview from '../charts/DomainOverview.jsx'; 
import TopicsForReview from '../UI/TopicsForReview.jsx'; 
import StudyLog from '../UI/StudyLog.jsx';
import PerformanceHistory from '../charts/PerformanceHistory.jsx';

import { config } from '../../config/appConfig.js';

// Local helper to map values to semantic theme classes
const getScoreSemanticClass = (score) => {
  if (score >= config.MASTERY_AVG_THRESHOLD) return 'app-text-success';
  if (score >= config.PASSING_SCORE) return 'app-text-primary';
  if (score >= 60) return 'app-text-warning';
  return 'app-text-danger';
};

const getReviewSemanticClass = (count, total) => {
  if (count === 0) return 'app-text-success';
  if (count / total <= 0.25) return 'app-text-warning';
  return 'app-text-danger';
};

const OverviewSection = ({ 
  metrics, 
  useWeightedAverages, 
  setUseWeightedAverages, 
  appSettings,
  priorityTopics,
  rawPriorityTopics,
  studySessions,
  trendData,
  trendFilter,
  setTrendFilter,
  overviewConfig, 
  setOverviewConfig 
}) => {
  const [showCustomize, setShowCustomize] = useState(false);
  
  const viewConfig = overviewConfig; 

  const currentPTAvg = useWeightedAverages ? metrics.practiceTestWeightedAverage : metrics.practiceTestRawAverage;
  const currentOQAvg = useWeightedAverages ? metrics.officialQuizWeightedAverage : metrics.officialQuizRawAverage;
  const reviewCount = useWeightedAverages ? metrics.weightedPriorityTopics.length : metrics.rawPriorityTopics.length;
  const currentMasteredCount = useWeightedAverages ? metrics.weightedMasteredCount : metrics.rawMasteredCount;

  const ptColor = getScoreSemanticClass(currentPTAvg);
  const oqColor = getScoreSemanticClass(currentOQAvg);
  const reviewColor = getReviewSemanticClass(reviewCount, metrics.totalTopics);
  const masteredColor = 'app-text-primary'; 

  const toggleConfig = (key) => {
    setOverviewConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isCombined = viewConfig.combineCharts && viewConfig.showDomain && viewConfig.showMastery;
  
  const historyList = trendData ? [...trendData].reverse() : [];
  const renderHistoryAtTop = viewConfig.showHistory && viewConfig.showDomain;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 -mt-4">
        <div className="order-2 sm:order-1">
            <WeightedToggle useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} />
        </div>
        <div className="order-1 sm:order-2 self-end sm:self-auto">
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="text-sm font-medium transition-colors app-text-primary hover:opacity-80"
            >
              {showCustomize ? 'Done' : 'Customize View'}
            </button>
        </div>
      </div>

      {/* Customize Panel */}
      {showCustomize && (
        <div className="p-4 rounded-lg animate-fadeIn border app-bg-surface app-border-muted shadow-sm">
          <h3 className="text-sm font-bold mb-3 uppercase tracking-wide app-text-main">Dashboard Configuration</h3>
          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
                <p className="text-xs font-bold uppercase app-text-muted">Charts</p>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={viewConfig.showDomain} onChange={() => toggleConfig('showDomain')} className="form-checkbox h-4 w-4 rounded border-gray-300 app-text-primary" />
                  <span className="text-sm app-text-main">Show Domain Performance</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={viewConfig.showMastery} onChange={() => toggleConfig('showMastery')} className="form-checkbox h-4 w-4 rounded border-gray-300 app-text-primary" />
                  <span className="text-sm app-text-main">Show Mastery Distribution</span>
                </label>
                 <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={viewConfig.combineCharts} onChange={() => toggleConfig('combineCharts')} disabled={!viewConfig.showDomain || !viewConfig.showMastery} className="form-checkbox h-4 w-4 rounded border-gray-300 disabled:opacity-50 app-text-primary" />
                  <span className={`text-sm ${(!viewConfig.showDomain || !viewConfig.showMastery) ? 'app-text-muted' : 'app-text-main'}`}>
                    Combine Charts (Compact)
                  </span>
                </label>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
            <div className="space-y-2">
                <p className="text-xs font-bold uppercase app-text-muted">Sections</p>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={viewConfig.showHistory} onChange={() => toggleConfig('showHistory')} className="form-checkbox h-4 w-4 rounded border-gray-300 app-text-primary" />
                  <span className="text-sm app-text-main">Show Performance History</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={viewConfig.showPriority} onChange={() => toggleConfig('showPriority')} className="form-checkbox h-4 w-4 rounded border-gray-300 app-text-primary" />
                  <span className="text-sm app-text-main">Show Priority List</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={viewConfig.showStudyLog} onChange={() => toggleConfig('showStudyLog')} className="form-checkbox h-4 w-4 rounded border-gray-300 app-text-primary" />
                  <span className="text-sm app-text-main">Show Study Log</span>
                </label>
            </div>
          </div>
        </div>
      )}

      {/* 1. Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Practice Test Avg" value={`${currentPTAvg}%`} subtitle={`${metrics.practiceTestsCount} tests taken`} color={ptColor} />
        <StatsCard title="Official Quiz Avg" value={`${currentOQAvg}%`} subtitle={`${metrics.officialQuizCount} quizzes taken`} color={oqColor} />
        <StatsCard title="For Review" value={reviewCount} subtitle={`< ${config.PASSING_SCORE}% avg`} color={reviewColor} />
        <StatsCard title="Mastered" value={currentMasteredCount} subtitle={`of ${metrics.totalTopics} domains`} color={masteredColor} />
      </div>

      {/* 2. Performance History (Top) */}
      {renderHistoryAtTop && (
        <PerformanceHistory 
            historyData={historyList} 
            trendFilter={trendFilter} 
            setTrendFilter={setTrendFilter} 
            appSettings={appSettings} 
        />
      )}

      {/* 3. Charts Area */}
      {isCombined ? (
        <DomainOverview 
            domainData={useWeightedAverages ? metrics.weightedDomainStats : metrics.rawDomainStats}
            masteryData={useWeightedAverages ? metrics.weightedMasteryData : metrics.rawMasteryData}
            isWeighted={useWeightedAverages}
            appSettings={appSettings}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {viewConfig.showDomain && (
            <DomainChart 
              data={useWeightedAverages ? metrics.weightedDomainStats : metrics.rawDomainStats} 
              isWeighted={useWeightedAverages} 
              appSettings={appSettings} 
            />
          )}
          {viewConfig.showMastery && (
            <MasteryChart 
              data={useWeightedAverages ? metrics.weightedMasteryData : metrics.rawMasteryData} 
              isWeighted={useWeightedAverages} 
              appSettings={appSettings} 
            />
          )}
        </div>
      )}

      {/* 4. Performance History (Bottom) */}
      {viewConfig.showHistory && !renderHistoryAtTop && (
        <PerformanceHistory 
            historyData={historyList} 
            trendFilter={trendFilter} 
            setTrendFilter={setTrendFilter} 
            appSettings={appSettings} 
        />
      )}

      {/* 5. Optional Sections */}
      {viewConfig.showPriority && (
         <TopicsForReview 
            topics={useWeightedAverages ? priorityTopics : rawPriorityTopics} 
            isWeighted={useWeightedAverages} 
            appSettings={appSettings} 
         />
      )}

      {viewConfig.showStudyLog && (
         <StudyLog sessions={studySessions} />
      )}

    </div>
  );
};

export default OverviewSection;