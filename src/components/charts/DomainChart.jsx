import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Cell } from 'recharts';
import { config } from '../../config/appConfig.js';
import { NORMAL_COLORS, COLORBLIND_SAFE_COLORS } from '../../utils/themeHelpers.js';

const DomainChart = ({ data, isWeighted, appSettings }) => {
    const colors = appSettings.colorblindMode ? COLORBLIND_SAFE_COLORS : NORMAL_COLORS;
    
    // High contrast colors for Dark Mode visibility
    const axisFill = appSettings.darkMode ? '#f1f5f9' : '#64748b'; // Slate 100 (Bright) vs Slate 500
    const gridStroke = appSettings.darkMode ? '#475569' : '#e2e8f0'; // Slate 600 (Visible) vs Slate 200
    const passingLineStroke = appSettings.darkMode ? '#f8fafc' : '#000000'; // White vs Black
    const passingLabelFill = appSettings.darkMode ? '#f8fafc' : '#334155'; // White vs Slate 700

    // Tooltip Text Colors - FIX: Explicitly define text color for dark mode
    const tooltipBg = appSettings.darkMode ? '#1f2937' : '#ffffff';
    const tooltipBorder = appSettings.darkMode ? '#374151' : '#e2e8f0';
    const tooltipText = appSettings.darkMode ? '#f3f4f6' : '#111827'; // White text on dark bg

    return (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-4 sm:p-6 dark:bg-gray-900 dark:ring-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
                Overall Domain Performance ({isWeighted ? 'Weighted Avg' : 'Raw Avg'})
            </h2>
            <ResponsiveContainer width="100%" height={data.length * 40 + 80}>
                <BarChart data={data} layout="vertical" margin={{ left: 100, right: 30, top: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" domain={[0, 100]} fontSize={12} unit="%" stroke={axisFill} tick={{ fill: axisFill }} />
                    <YAxis dataKey="domain" type="category" width={100} fontSize={12} interval={0} stroke={axisFill} tick={{ fill: axisFill }} />
                    <Tooltip
                        formatter={(value) => [`${value}%`, isWeighted ? 'Weighted Average' : 'Raw Average']}
                        cursor={{ fill: appSettings.darkMode ? '#374151' : '#f3f4f6', opacity: 0.4 }}
                        contentStyle={{ 
                            backgroundColor: tooltipBg,
                            borderColor: tooltipBorder,
                            color: tooltipText,
                            borderRadius: '0.5rem'
                        }}
                        // FIX: Force item and label text color to match theme
                        itemStyle={{ color: tooltipText }}
                        labelStyle={{ color: tooltipText, fontWeight: 'bold', marginBottom: '0.25rem' }}
                    />
                    <Bar dataKey="accuracy" radius={[0, 5, 5, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                                entry.accuracy >= 80 ? colors[3] : // Strong
                                entry.accuracy >= 60 ? colors[2] : // Developing
                                entry.accuracy >= 40 ? colors[1] : // Weak
                                colors[0] // Critical
                            } />
                        ))}
                    </Bar>
                    <ReferenceLine y={0} stroke={gridStroke} />
                    <ReferenceLine x={config.PASSING_SCORE} stroke={passingLineStroke} strokeDasharray="4 4" zIndex={10}>
                        <Label value="Passing" position="insideTopRight" fill={passingLabelFill} fontSize={12} />
                    </ReferenceLine>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DomainChart;