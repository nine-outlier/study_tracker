// MasteryChart.jsx
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import ChartGradientDefs from '../UI/ChartGradientDefs.jsx';

const MasteryChart = ({ data, isWeighted, appSettings, rankingEngine }) => {
  const TIER_ORDER = ['Critical', 'Weak', 'Developing', 'Strong', 'Mastered'];

  const coloredData = data.map((d) => {
    const colorVar = rankingEngine ? rankingEngine.getRankColor(d.label) : 'var(--chart-1)';
    return {
      ...d,
      color: colorVar
    };
  });

  const sortedData = [...coloredData].sort((a, b) => {
    return TIER_ORDER.indexOf(b.label) - TIER_ORDER.indexOf(a.label);
  });

  const showLegend = appSettings && appSettings.theme !== 'red';

  return (
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4 app-text-main">
        Domain Mastery (by {isWeighted ? 'Weighted Avg' : 'Raw Avg'})
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <ChartGradientDefs />
          <Pie
            data={sortedData}
            cx="40%"
            cy="50%"
            outerRadius={90}
            dataKey="count"
            nameKey="label"
            labelLine={false}
            isAnimationActive={false}
            label={({ cx, cy, midAngle, outerRadius, percent, payload, value }) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 18;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              const count = payload?.count ?? value;
              return (
                <text
                  x={x}
                  y={y}
                  fill={payload?.color}
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize={12}
                >
                  {`${count} (${(percent * 100).toFixed(0)}%)`}
                </text>
              );
            }}
            fontSize={12}
            fill="var(--app-text-main)"
          >
            {sortedData.map((entry) => (
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
            formatter={(value, name, props) => {
              const n = Number(value) || 0;
              const unit = n === 1 ? 'domain' : 'domains';
              return [`${n} ${unit} (${props.payload.percentage}%)`, props.payload.label];
            }}
            contentStyle={{ backgroundColor: 'var(--app-bg-surface)', borderColor: 'var(--app-primary)', color: 'var(--app-text-main)' }}
            itemStyle={{ color: 'var(--app-text-main)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MasteryChart;