import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ReferenceLine, Label } from 'recharts';
import StatsCard from '../UI/StatsCard.jsx';
import WeightedToggle from '../UI/WeightedToggle.jsx';
import { config } from '../../config/appConfig.js';
import { getChartColors, getTrendColorClass, getHighContrastColor } from '../../utils/themeHelpers.js';
import ChartGradientDefs from '../UI/ChartGradientDefs.jsx';

const PerformanceTrends = ({ trendData, rawTrendStats, weightedTrendStats, useWeightedAverages, setUseWeightedAverages, trendFilter, setTrendFilter, weights, setWeights, appSettings }) => {
  const [showCustomize, setShowCustomize] = useState(false);
  
  // Use Pure White/Black for the Line Chart based on Theme Brightness
  const contrastColor = getHighContrastColor(appSettings);
  
  const CustomDot = (props) => {
    const { cx, cy, stroke } = props;
    return <circle cx={cx} cy={cy} r={5} fill={contrastColor} stroke={stroke} strokeWidth={2} />;
  };
  
  const FilterCheckbox = ({ value, label }) => (
    <label className="flex items-center space-x-2 px-3 py-1 cursor-pointer">
      <input
        type="checkbox"
        checked={trendFilter[value]}
        onChange={(e) => setTrendFilter(prev => ({ ...prev, [value]: e.target.checked }))}
        className="form-checkbox h-4 w-4 app-text-primary rounded border-gray-300"
      />
      <span className="text-sm app-text-main">{label}</span>
    </label>
  );
  
  const WeightInput = ({ value, label }) => (
    <label className="flex items-center space-x-2 px-3 py-1">
      <span className="text-sm app-text-main w-24">{label}:</span>
      <input
        type="number"
        min="0"
        step="0.5"
        value={weights[value]}
        onChange={(e) => setWeights(prev => ({ ...prev, [value]: parseFloat(e.target.value) || 0 }))}
        className="form-input h-8 w-20 text-sm rounded-md app-border-muted bg-transparent app-text-main"
      />
    </label>
  );
  
  const trendStats = useWeightedAverages ? weightedTrendStats : rawTrendStats;
  const trendClass = getTrendColorClass(trendStats.trend);
  
  const axisStroke = "var(--app-text-muted)";
  const labelFill = "var(--app-text-muted)";
  const gridStroke = "var(--app-border)";

  return (
  <div className="space-y-6">
    {/* 1. Statistical Summary */}
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
       <h2 className="text-lg font-semibold app-text-main">Statistical Summary</h2>
       <WeightedToggle useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} />
      </div>
      <p className="text-xs app-text-muted -mt-4 mb-4">
        {useWeightedAverages ? "(Using weighted mean; other stats raw)" : "(Using raw stats)"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Trend" value={trendStats.trend} color={trendClass} />
        <StatsCard title="Trend Slope" value={`${trendStats.trendSlope > 0 ? '+' : ''}${trendStats.trendSlope.toFixed(1)}%`} subtitle="per test" color={trendClass} />
        <StatsCard title="Overall Mean" value={`${trendStats.mean}%`} color="app-text-primary" />
        <StatsCard title="Median Score" value={`${trendStats.median}%`} color="app-text-primary" />
      </div>
    </div>

    {/* 2. Overall Performance Timeline */}
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold app-text-main">Overall Performance Timeline</h2>
        <button
          onClick={() => setShowCustomize(!showCustomize)}
          className="text-sm font-medium app-text-primary hover:opacity-80 transition-colors"
        >
          {showCustomize ? 'Hide' : 'Customize'}
        </button>
      </div>
      
      {showCustomize && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 rounded-lg border app-border-muted">
          <div>
            <span className="text-sm font-medium app-text-main">Filter Timeline:</span>
            <div className="flex flex-col">
              <FilterCheckbox value="practiceTest" label="Practice Tests" />
              <FilterCheckbox value="officialQuiz" label="Official Quizzes" />
              <FilterCheckbox value="miniTest" label="Mini Tests" />
              <FilterCheckbox value="miniQuiz" label="(Legacy) Mini Quizzes" />
            </div>
          </div>
          <div>
            <span className="text-sm font-medium app-text-main">Set Data Weights:</span>
            <div className="flex flex-col">
              <WeightInput value="practiceTest" label="Practice Tests" />
              <WeightInput value="officialQuiz" label="Official Quizzes" />
              <WeightInput value="miniTest" label="Mini Tests" />
              <WeightInput value="miniQuiz" label="(Legacy) Mini Quiz" />
            </div>
            <p className="text-xs app-text-muted mt-2 pl-3">
              Note: Timeline dots are scaled by weight when 'Use Weighted Averages' is on.
            </p>
          </div>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={trendData}>
          <ChartGradientDefs />
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.5} />
          <XAxis dataKey="session" fontSize={12} stroke={axisStroke} tick={{ fill: labelFill }} />
          <YAxis domain={[0, 100]} fontSize={12} unit="%" stroke={axisStroke} tick={{ fill: labelFill }} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Score']}
            contentStyle={{ backgroundColor: 'var(--app-bg-surface)', borderColor: 'var(--app-primary)', color: 'var(--app-text-main)' }}
            labelFormatter={(label, payload) => {
             if (payload && payload[0]) {
              return `${payload[0].payload.session} (Weight: ${payload[0].payload.weight})`;
             }
             return label;
            }}
          />
          {/* MAIN LINE: Uses Pure White/Black */}
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke={contrastColor} 
            strokeWidth={3} 
            dot={useWeightedAverages ? <CustomDot /> : true}
            activeDot={useWeightedAverages ? <CustomDot /> : { r: 8 }} 
          />
          {/* PASSING LINE: Uses Pure White/Black */}
          <ReferenceLine y={config.PASSING_SCORE} stroke={contrastColor} strokeDasharray="4 4" zIndex={10}>
            <Label value="Passing" position="insideTopRight" fill={contrastColor} fontSize={12} fontWeight="bold" />
          </ReferenceLine>
        </LineChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
};

export default PerformanceTrends;