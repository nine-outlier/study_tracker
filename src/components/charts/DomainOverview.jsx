// DomainOverview.jsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, Label, PieChart, Pie } from 'recharts';
import { config } from '../../config/appConfig.js';
import { getHighContrastColor } from '../../utils/themeHelpers.js';
import ChartGradientDefs from '../UI/ChartGradientDefs.jsx';

const DomainOverview = ({ domainData, masteryData, isWeighted, appSettings, rankingEngine }) => {
  const passingLineColor = typeof getHighContrastColor === 'function'
    ? getHighContrastColor(appSettings?.theme ?? appSettings)
    : '#000';

  const axisStroke = "var(--app-text-muted)";
  const labelFill = "var(--app-text-muted)";
  const gridStroke = "var(--app-border)";

  const TIER_ORDER = ['Critical', 'Weak', 'Developing', 'Strong', 'Mastered'];

  const coloredMasteryData = masteryData.map((d) => {
    const colorVar = rankingEngine ? rankingEngine.getRankColor(d.label) : 'var(--chart-1)';
    return {
      ...d,
      color: colorVar
    };
  });

  const legendItems = TIER_ORDER.map((label) => ({
    label,
    color: rankingEngine ? rankingEngine.getRankColor(label) : 'var(--chart-1)'
  }));

  return (
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 relative flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
        <div className="flex items-center gap-3 self-start sm:self-center">
          <h2 className="text-base font-semibold app-text-main whitespace-nowrap">
            Domain Overview
          </h2>

          {/* Small Pie Chart Preview - ring, no horizontal gap */}
          <div className="w-12 h-12 relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coloredMasteryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={10}
                  outerRadius={20}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                  dataKey="count"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {coloredMasteryData.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end">
          {legendItems.reverse().map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ background: item.color }}
              />
              <span className="text-[9px] font-medium app-text-muted uppercase tracking-wide">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[220px] flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={domainData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <ChartGradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="domain" fontSize={10} tickLine={false}
              axisLine={{ stroke: axisStroke }} tick={{ fill: labelFill, fontSize: 9 }}
              interval={0} height={20}
            />
            <YAxis
              domain={[0, 100]} fontSize={10} tickLine={false} axisLine={false}
              tick={{ fill: labelFill }} width={30}
            />
            <Tooltip
              cursor={{ fill: 'var(--app-text-muted)', opacity: 0.1 }}
              formatter={(value) => [`${value}%`, isWeighted ? 'Weighted Avg' : 'Raw Avg']}
              contentStyle={{ backgroundColor: 'var(--app-bg-surface)', borderColor: 'var(--app-primary)', color: 'var(--app-text-main)' }}
              itemStyle={{ color: 'var(--app-text-main)' }}
            />
            <Bar dataKey="accuracy" radius={[3, 3, 0, 0]} maxBarSize={50}>
              {domainData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={rankingEngine ? rankingEngine.getRankColor(entry.rank) : 'var(--chart-1)'}
                />
              ))}
            </Bar>
            <ReferenceLine y={config.PASSING_SCORE} stroke={passingLineColor} strokeWidth={2} strokeDasharray="3 3">
              <Label value="PASS" position="insideLeft" fill={passingLineColor} fontSize={9} offsetY={8} fontWeight="bold" />
            </ReferenceLine>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DomainOverview;