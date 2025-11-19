import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const MasteryChart = ({ data, isWeighted, appSettings }) => {
    // Thematic colors for chart text
    const pieLabelFill = appSettings.darkMode ? '#e2e8f0' : '#1e293b'; // White / Slate 800
    const legendTextFill = appSettings.darkMode ? '#94a3b8' : '#334155'; // Dim Gray / Slate 700

    return (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-4 sm:p-6 dark:bg-gray-900 dark:ring-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
                Domain Mastery (by {isWeighted ? 'Weighted Avg' : 'Raw Avg'})
            </h2>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="40%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="count"
                        nameKey="label"
                        labelLine={false}
                        isAnimationActive={false} 
                        label={({ label, count, percent }) => `${label}: ${count} (${(percent * 100).toFixed(0)}%)`}
                        fontSize={12}
                        fill={pieLabelFill} 
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.label}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right" 
                        wrapperStyle={{ color: legendTextFill }}
                        formatter={(value) => <span className="text-slate-700 dark:text-slate-300">{value}</span>}
                    />
                    <Tooltip
                        formatter={(value, name, props) => [`${value} domains (${props.payload.percentage}%)`, props.payload.label]}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MasteryChart;