import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, ReferenceLine, Label } from 'recharts';
import { config } from '../../config/appConfig.js';
import { getHighContrastColor } from '../../utils/themeHelpers.js';
import ChartGradientDefs from '../UI/ChartGradientDefs.jsx';

const DomainChart = ({ data, isWeighted, appSettings, rankingEngine }) => {
  const passingLineColor = getHighContrastColor(appSettings?.theme ?? appSettings);

  const axisStroke = "var(--app-text-muted)";
  const labelFill = "var(--app-text-muted)";
  const gridStroke = "var(--app-border)";

  return (
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4 app-text-main">
        Overall Domain Performance ({isWeighted ? 'Weighted Avg' : 'Raw Avg'})
      </h2>
      <ResponsiveContainer width="100%" height={Math.max(250, data.length * 40 + 80)}>
        <BarChart data={data} layout="vertical" margin={{ left: 100, right: 30, top: 20, bottom: 10 }}>
          <ChartGradientDefs />
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.5} />
          <XAxis type="number" domain={[0, 100]} fontSize={12} unit="%" stroke={axisStroke} tick={{ fill: labelFill }} />
          <YAxis dataKey="domain" type="category" width={100} fontSize={12} interval={0} stroke={axisStroke} tick={{ fill: labelFill }} />
          <Tooltip
            formatter={(value) => [`${value}%`, isWeighted ? 'Weighted Avg' : 'Raw Avg']}
            contentStyle={{ backgroundColor: 'var(--app-bg-surface)', borderColor: 'var(--app-primary)', color: 'var(--app-text-main)' }}
            itemStyle={{ color: 'var(--app-text-main)' }}
            cursor={{ fill: 'var(--app-text-muted)', opacity: 0.1 }}
          />
          <Bar dataKey="accuracy" radius={[0, 5, 5, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={rankingEngine ? rankingEngine.getRankColor(entry.rank) : 'var(--chart-1)'}
              />
            ))}
          </Bar>
          <ReferenceLine y={0} stroke={gridStroke} />
          <ReferenceLine x={config.PASSING_SCORE} stroke={passingLineColor} strokeWidth={2} strokeDasharray="4 4" zIndex={10}>
            <Label value="Passing" position="insideTopRight" fill={passingLineColor} fontSize={12} fontWeight="bold" />
          </ReferenceLine>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DomainChart;