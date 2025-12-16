import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { getChartColors } from '../../utils/themeHelpers.js';
import ChartGradientDefs from '../UI/ChartGradientDefs.jsx';

const MasteryChart = ({ data, isWeighted, appSettings }) => {
  const themeColors = getChartColors(appSettings);
  
  // Standard Tier Order to ensure consistent coloring
  const TIER_ORDER = ['Critical', 'Weak', 'Developing', 'Strong', 'Mastered'];

  const coloredData = data.map((d) => {
    const idx = TIER_ORDER.indexOf(d.label);
    return {
        ...d,
        color: idx >= 0 ? themeColors[idx] : themeColors[0]
    };
  });

  const showLegend = appSettings.theme !== 'red'; 
  
  return (
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4 app-text-main">
        Domain Mastery (by {isWeighted ? 'Weighted Avg' : 'Raw Avg'})
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <ChartGradientDefs />
          <Pie
            data={coloredData}
            cx="40%"
            cy="50%"
            outerRadius={90}
            dataKey="count"
            nameKey="label"
            labelLine={false}
            isAnimationActive={false} 
            label={({ label, count, percent }) => `${label}: ${count} (${(percent * 100).toFixed(0)}%)`}
            fontSize={12}
            fill="var(--app-text-main)"
          >
            {coloredData.map((entry) => (
              <Cell key={`cell-${entry.label}`} fill={entry.color} />
            ))}
          </Pie>
          
          {showLegend && (
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ color: 'var(--app-text-muted)' }}
              formatter={(value) => <span className="app-text-main">{value}</span>}
            />
          )}
          
          <Tooltip
            formatter={(value, name, props) => [`${value} domains (${props.payload.percentage}%)`, props.payload.label]}
            contentStyle={{ backgroundColor: 'var(--app-bg-surface)', borderColor: 'var(--app-primary)', color: 'var(--app-text-main)' }}
            itemStyle={{ color: 'var(--app-text-main)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MasteryChart;