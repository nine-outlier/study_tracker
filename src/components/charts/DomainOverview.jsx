import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, Label, PieChart, Pie } from 'recharts';
import { config } from '../../config/appConfig.js';
import { getChartColors, getHighContrastColor } from '../../utils/themeHelpers.js';
import ChartGradientDefs from '../UI/ChartGradientDefs.jsx';

const DomainOverview = ({ domainData, masteryData, isWeighted, appSettings }) => {
  const colors = getChartColors(appSettings);
  const passingLineColor = getHighContrastColor(appSettings);
  const axisStroke = "var(--app-text-muted)";
  const labelFill = "var(--app-text-muted)";
  const gridStroke = "var(--app-border)";

  // Standard Tier Order matching the chart colors array [Critical, Weak, Developing, Strong, Mastered]
  const TIER_ORDER = ['Critical', 'Weak', 'Developing', 'Strong', 'Mastered'];

  const coloredMasteryData = masteryData.map((d) => {
    // Correctly map label to the fixed color index
    const colorIndex = TIER_ORDER.indexOf(d.label);
    return {
        ...d,
        color: colorIndex >= 0 ? colors[colorIndex] : colors[0]
    };
  });
  
  const legendItems = Object.entries(config.MASTERY_LABELS || {}).map(([key, label]) => {
     const idx = TIER_ORDER.indexOf(key);
     return {
        label,
        color: idx >= 0 ? colors[idx] : colors[0]
     };
  });

  return (
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 relative flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
          <div className="flex items-center gap-3 self-start sm:self-center">
             <h2 className="text-base font-semibold app-text-main whitespace-nowrap">
               Domain Overview
             </h2>
             <div className="w-10 h-10 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                       <Pie
                           data={coloredMasteryData}
                           cx="50%"
                           cy="50%"
                           innerRadius={8} 
                           outerRadius={18}
                           paddingAngle={5}
                           dataKey="count"
                           stroke="none"
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
                <Cell key={`cell-${index}`} fill={
                  (appSettings.theme === 'red') ? colors[0] :
                  (
                      entry.accuracy >= 90 ? colors[4] :
                      entry.accuracy >= 80 ? colors[3] :
                      entry.accuracy >= 60 ? colors[2] :
                      entry.accuracy >= 40 ? colors[1] :
                      colors[0]
                  )
                } />
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