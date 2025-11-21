import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { config } from '../../config/appConfig.js';
import StatsCard from '../UI/StatsCard.jsx';
import WeightedToggle from '../UI/WeightedToggle.jsx';
import { getScoreClass } from '../../utils/themeHelpers.js';

const PerformanceTrends = ({ trendData, rawTrendStats, weightedTrendStats, useWeightedAverages, setUseWeightedAverages, trendFilter, setTrendFilter, weights, setWeights, appSettings }) => {
  const [showCustomize, setShowCustomize] = useState(false);
  
  // Custom dot for the line chart to show data weight
  const CustomDot = (props) => {
    const { cx, cy, payload, stroke } = props;
    const weight = payload.weight || 1;
    const minRadius = 3;
    const maxRadius = 8;
    // Logic: Higher weight = Bigger dot
    const radius = Math.max(minRadius, Math.min(maxRadius, minRadius + (weight - 1) * 1.5)); 
    return <circle cx={cx} cy={cy} r={radius} fill={stroke} />;
  };
  
  const FilterCheckbox = ({ value, label }) => (
    <label className="flex items-center space-x-2 px-3 py-1 cursor-pointer">
      <input
        type="checkbox"
        checked={trendFilter[value]}
        onChange={(e) => setTrendFilter(prev => ({ ...prev, [value]: e.target.checked }))}
        className="form-checkbox h-4 w-4 text-sky-600 rounded"
      />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
  
  const WeightInput = ({ value, label }) => (
    <label className="flex items-center space-x-2 px-3 py-1">
      <span className="text-sm text-slate-700 dark:text-slate-300 w-24">{label}:</span>
      <input
        type="number"
        min="0"
        step="0.5"
        value={weights[value]}
        onChange={(e) => setWeights(prev => ({ ...prev, [value]: parseFloat(e.target.value) || 0 }))}
        className="form-input h-8 w-20 text-sm rounded-md border-slate-300 dark:bg-gray-700 dark:border-gray-600 dark:text-slate-100 focus:ring-sky-500 focus:border-sky-500"
      />
    </label>
  );
  
  const trendStats = useWeightedAverages ? weightedTrendStats : rawTrendStats;
  
  // FIX: High contrast colors for Dark Mode
  const axisFill = appSettings.darkMode ? '#f1f5f9' : '#64748b'; 
  const gridStroke = appSettings.darkMode ? '#475569' : '#e2e8f0'; 
  const passingLineStroke = appSettings.darkMode ? '#f8fafc' : '#000000'; 
  const passingLabelFill = appSettings.darkMode ? '#f8fafc' : '#334155'; 

  // Tooltip Colors
  const tooltipBg = appSettings.darkMode ? '#1f2937' : '#ffffff';
  const tooltipBorder = appSettings.darkMode ? '#374151' : '#e2e8f0';
  const tooltipText = appSettings.darkMode ? '#f3f4f6' : '#111827';
  
  const trendColor = trendStats.trend === 'Positive' ? (appSettings.colorblindMode ? 'text-teal-600 dark:text-teal-400' : 'text-green-600 dark:text-green-400') :
                     trendStats.trend === 'Negative' ? (appSettings.colorblindMode ? 'text-red-600 dark:text-red-400' : 'text-red-600 dark:text-red-400') :
                     'text-slate-900 dark:text-slate-100';
  const meanColor = getScoreClass(trendStats.mean, appSettings.colorblindMode);
  const medianColor = getScoreClass(trendStats.median, appSettings.colorblindMode);

  return (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-4 sm:p-6 dark:bg-gray-900 dark:ring-gray-800">
      <div className="flex justify-between items-center mb-4">
       <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Statistical Summary</h2>
       <WeightedToggle useWeightedAverages={useWeightedAverages} setUseWeightedAverages={setUseWeightedAverages} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-4 mb-4">
        {useWeightedAverages ? "(Using weighted mean; other stats raw)" : "(Using raw stats)"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Trend" value={trendStats.trend} color={trendColor} />
        <StatsCard title="Trend Slope" value={`${trendStats.trendSlope > 0 ? '+' : ''}${trendStats.trendSlope.toFixed(1)}%`} subtitle="per test" color={trendColor} />
        <StatsCard title="Overall Mean" value={`${trendStats.mean}%`} color={meanColor} />
        <StatsCard title="Median Score" value={`${trendStats.median}%`} color={medianColor} />
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-4 sm:p-6 dark:bg-gray-900 dark:ring-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Overall Performance Timeline</h2>
        <button
          onClick={() => setShowCustomize(!showCustomize)}
          className="text-sm text-sky-600 hover:text-sky-800 font-medium dark:text-sky-400 dark:hover:text-sky-300"
        >
          {showCustomize ? 'Hide' : 'Customize'}
        </button>
      </div>
      
      {showCustomize && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-slate-100 rounded-lg dark:bg-gray-800">
          <div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter Timeline:</span>
            <div className="flex flex-col">
              {Object.entries(config.TEST_TYPES).map(([key, label]) => (
                  <FilterCheckbox key={key} value={key} label={label} />
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set Data Weights:</span>
            <div className="flex flex-col">
              {Object.entries(config.TEST_TYPES).map(([key, label]) => (
                  <WeightInput key={key} value={key} label={label} />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pl-3">
              Note: Timeline dots are scaled by weight when 'Use Weighted Averages' is on.
            </p>
          </div>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="session" fontSize={12} stroke={axisFill} tick={{ fill: axisFill }} />
          <YAxis domain={[0, 100]} fontSize={12} unit="%" stroke={axisFill} tick={{ fill: axisFill }} />
          <Tooltip 
            formatter={(value, name, props) => [`${value}%`, 'Score']}
            labelFormatter={(label, payload) => {
             if (payload && payload[0]) {
              return `${payload[0].payload.session} (Weight: ${payload[0].payload.weight})`;
             }
             return label;
            }}
            contentStyle={{ 
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                color: tooltipText,
                borderRadius: '0.5rem'
            }}
            // FIX: Force item and label text color
            itemStyle={{ color: tooltipText }}
            labelStyle={{ color: tooltipText, fontWeight: 'bold', marginBottom: '0.25rem' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#0ea5e9" 
            strokeWidth={3} 
            dot={useWeightedAverages ? <CustomDot /> : true}
            activeDot={useWeightedAverages ? <CustomDot /> : { r: 8 }} 
          />
          <ReferenceLine y={config.PASSING_SCORE} stroke={passingLineStroke} strokeDasharray="4 4" zIndex={10}>
            <Label value="Passing" position="insideTopRight" fill={passingLabelFill} fontSize={12} />
          </ReferenceLine>
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};

export default PerformanceTrends;