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

  // Helper to split data into chunks of 5
  const chunkData = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const domainChunks = chunkData(data || [], 5);

  // Custom label component to display percentage number for small bars
  const CustomBarLabel = (props) => {
    const { x, y, width, height, value } = props;

    // If the value is 10% or less, show the number explicitly
    if (value <= 10) {
      return (
        <text 
          x={x + width + 8} 
          y={y + height / 2 + 1} 
          fill="var(--app-text-muted)" 
          textAnchor="start" 
          dominantBaseline="middle"
          fontSize={20}
          fontWeight="700"
        >
          {value}%
        </text>
      );
    }
    return null;
  };

  return (
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-6 app-text-main">
        Overall Domain Performance ({isWeighted ? 'Weighted Avg' : 'Raw Avg'})
      </h2>
      
      {/* Grid layout for chunks: Stacks on mobile, 2 columns on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-8">
        {domainChunks.map((chunk, index) => (
          <div key={index} className="w-full">
            {/* Dynamic height calculation: 
               - Base height to accommodate axis labels
               - Per-row height to ensure bars stay consistent thickness regardless of chunk size
            */}
            <ResponsiveContainer width="100%" height={Math.max(chunk.length * 60 + 50, 150)}>
              <BarChart data={chunk} layout="vertical" margin={{ left: 10, right: 40, top: 10, bottom: 10 }}>
                <ChartGradientDefs />
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.5} />
                
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  fontSize={12} 
                  unit="%" 
                  stroke={axisStroke} 
                  tick={{ fill: labelFill }} 
                />
                
                <YAxis 
                  dataKey="domain" 
                  type="category" 
                  width={140} 
                  fontSize={11} 
                  interval={0} 
                  stroke={axisStroke} 
                  tick={{ fill: labelFill, width: 130 }} 
                  // Allow text wrapping for long domain names
                  tickFormatter={(val) => val.length > 25 ? `${val.substring(0, 25)}...` : val}
                />

                <Tooltip
                  formatter={(value) => [`${value}%`, isWeighted ? 'Weighted Avg' : 'Raw Avg']}
                  contentStyle={{ backgroundColor: 'var(--app-bg-surface)', borderColor: 'var(--app-primary)', color: 'var(--app-text-main)' }}
                  itemStyle={{ color: 'var(--app-text-main)' }}
                  cursor={{ fill: 'var(--app-text-muted)', opacity: 0.1 }}
                />

                <Bar dataKey="accuracy" radius={[0, 5, 5, 0]} barSize={32} label={<CustomBarLabel />}>
                  {chunk.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={rankingEngine ? rankingEngine.getRankColor(entry.rank) : 'var(--chart-1)'}
                    />
                  ))}
                </Bar>

                <ReferenceLine y={0} stroke={gridStroke} />
                <ReferenceLine x={config.PASSING_SCORE} stroke={passingLineColor} strokeWidth={2} strokeDasharray="4 4" zIndex={10}>
                  {/* Only show label on the first row of charts to reduce clutter, or if there's only one chunk */}
                  {(index < 2) && (
                    <Label value="Passing" position="insideTopRight" fill={passingLineColor} fontSize={10} fontWeight="bold" dy={-10} />
                  )}
                </ReferenceLine>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainChart;