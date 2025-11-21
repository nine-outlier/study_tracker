import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const MasteryChart = ({ data, isWeighted, appSettings }) => {
    // FIX: High contrast colors for Dark Mode text
    // Using Slate-50 (#f8fafc) for labels on dark mode so they pop against the dark card
    const pieLabelFill = appSettings.darkMode ? '#f8fafc' : '#1e293b'; 
    // Using Slate-300 (#cbd5e1) for legend text
    const legendTextFill = appSettings.darkMode ? '#cbd5e1' : '#334155'; 

    // Tooltip Colors - FIX: Explicitly define text color for dark mode
    const tooltipBg = appSettings.darkMode ? '#1f2937' : '#ffffff';
    const tooltipBorder = appSettings.darkMode ? '#374151' : '#e2e8f0';
    const tooltipText = appSettings.darkMode ? '#f3f4f6' : '#111827'; // White text on dark bg

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
                            <Cell 
                                key={`cell-${entry.label}`} 
                                fill={entry.color} 
                                stroke={appSettings.darkMode ? '#111827' : '#ffffff'} // Dark stroke in dark mode to separate slices
                                strokeWidth={2}
                            />
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
                        contentStyle={{ 
                            backgroundColor: tooltipBg,
                            borderColor: tooltipBorder,
                            color: tooltipText,
                            borderRadius: '0.5rem'
                        }}
                        // FIX: Force item and label text color to match theme
                        itemStyle={{ color: tooltipText }}
                        labelStyle={{ color: tooltipText, fontWeight: 'bold' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MasteryChart;