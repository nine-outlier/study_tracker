import React, { useMemo } from 'react';
import StatsCard from '../UI/StatsCard.jsx';
import WeightedToggle from '../UI/WeightedToggle.jsx';
import DomainChart from '../charts/DomainChart.jsx';
import MasteryChart from '../charts/MasteryChart.jsx';
import DomainOverview from '../charts/DomainOverview.jsx';
import TopicsForReview from '../UI/TopicsForReview.jsx';
import PerformanceHistory from '../charts/PerformanceHistory.jsx';
import { config, DEFAULT_SETTINGS } from '../../config/appConfig.js';

const OverviewSection = ({
  metrics,
  useWeightedAverages,
  setUseWeightedAverages,
  appSettings,
  priorityTopics,
  rawPriorityTopics,
  trendData,
  trendFilter,
  setTrendFilter,
  overviewConfig,
  // setOverviewConfig is no longer needed here as settings moved to modal,
  // but kept in prop signature to avoid breakage if parent passes it.
  rankingEngine
}) => {
  
  // Safety: ensure all keys exist even if older saved settings are missing fields
  const viewConfig = useMemo(() => {
    const fallback = DEFAULT_SETTINGS?.overviewConfig || {};
    return { ...fallback, ...(overviewConfig || {}) };
  }, [overviewConfig]);

  // Extract Metrics
  const currentPTAvg = useWeightedAverages ? metrics.practiceTestWeightedAverage : metrics.practiceTestRawAverage;
  const currentOQAvg = useWeightedAverages ? metrics.officialQuizWeightedAverage : metrics.officialQuizRawAverage;
  const reviewCount = useWeightedAverages ? metrics.weightedPriorityTopics.length : metrics.rawPriorityTopics.length;
  const currentMasteredCount = useWeightedAverages ? metrics.weightedMasteredCount : metrics.rawMasteredCount;

  // Calculate Ranks using Engine (Simple Score-based for Averages)
  const ptRank = rankingEngine ? rankingEngine.determineRank(currentPTAvg) : 'Critical';
  const oqRank = rankingEngine ? rankingEngine.determineRank(currentOQAvg) : 'Critical';

  // Dynamic colors via rankingEngine
  const ptColor = rankingEngine ? rankingEngine.getRankClass(ptRank) : 'app-text-chart-1';
  const oqColor = rankingEngine ? rankingEngine.getRankClass(oqRank) : 'app-text-chart-1';

  // Special Counts
  const reviewColor = rankingEngine ? rankingEngine.getReviewRankClass(reviewCount, metrics.totalTopics) : 'app-text-chart-1';
  const masteredColor = rankingEngine ? rankingEngine.getMasteredRankClass(currentMasteredCount, metrics.totalTopics) : 'app-text-chart-1';

  const isCombined = !!viewConfig.combineCharts && !!viewConfig.showDomain && !!viewConfig.showMastery;
  const historyList = trendData ? [...trendData].reverse() : [];
  const renderHistoryAtTop = !!viewConfig.showHistory && !!viewConfig.showDomain;

  // Weighted toggle (nudged slightly down)
  const weightedToggleNode = (
    <div className="relative top-0.5">
      <WeightedToggle
        useWeightedAverages={useWeightedAverages}
        setUseWeightedAverages={setUseWeightedAverages}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overview controls: Weighted toggle RIGHT */}
      <div className="flex justify-end -mt-4 mb-4">
        {weightedToggleNode}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Practice Test Avg"
          value={`${currentPTAvg}%`}
          subtitle={`${metrics.practiceTestsCount} tests taken`}
          color={ptColor}
        />
        <StatsCard
          title="Official Quiz Avg"
          value={`${currentOQAvg}%`}
          subtitle={`${metrics.officialQuizCount} quizzes taken`}
          color={oqColor}
        />
        <StatsCard
          title="For Review"
          value={reviewCount}
          subtitle={`< ${config.PASSING_SCORE}% avg`}
          color={reviewColor}
        />
        <StatsCard
          title="Mastered"
          value={currentMasteredCount}
          subtitle={`of ${metrics.totalTopics} domains`}
          color={masteredColor}
        />
      </div>

      {renderHistoryAtTop && (
        <PerformanceHistory
          historyData={historyList}
          trendFilter={trendFilter}
          setTrendFilter={setTrendFilter}
          appSettings={appSettings}
          rankingEngine={rankingEngine}
        />
      )}

      {isCombined ? (
        <DomainOverview
          domainData={useWeightedAverages ? metrics.weightedDomainStats : metrics.rawDomainStats}
          masteryData={useWeightedAverages ? metrics.weightedMasteryData : metrics.rawMasteryData}
          isWeighted={useWeightedAverages}
          appSettings={appSettings}
          rankingEngine={rankingEngine}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {viewConfig.showDomain && (
            <DomainChart
              data={useWeightedAverages ? metrics.weightedDomainStats : metrics.rawDomainStats}
              isWeighted={useWeightedAverages}
              appSettings={appSettings}
              rankingEngine={rankingEngine}
            />
          )}
          {viewConfig.showMastery && (
            <MasteryChart
              data={useWeightedAverages ? metrics.weightedMasteryData : metrics.rawMasteryData}
              isWeighted={useWeightedAverages}
              appSettings={appSettings}
              rankingEngine={rankingEngine}
            />
          )}
        </div>
      )}

      {viewConfig.showHistory && !renderHistoryAtTop && (
        <PerformanceHistory
          historyData={historyList}
          trendFilter={trendFilter}
          setTrendFilter={setTrendFilter}
          appSettings={appSettings}
          rankingEngine={rankingEngine}
        />
      )}

      {viewConfig.showPriority && (
        <TopicsForReview
          topics={useWeightedAverages ? priorityTopics : rawPriorityTopics}
          isWeighted={useWeightedAverages}
          appSettings={appSettings}
        />
      )}
    </div>
  );
};

export default OverviewSection;