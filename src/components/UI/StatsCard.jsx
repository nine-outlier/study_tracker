import React from 'react';

const StatsCard = ({ title, value, subtitle, color = 'text-slate-900 dark:text-slate-100' }) => (
  <div className="app-bg-surface bg-white p-4 rounded-xl ring-1 ring-slate-200 shadow-sm dark:bg-gray-900 dark:ring-gray-800 border app-border-muted">
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="text-sm font-medium text-slate-700 dark:text-slate-100">{title}</div>
    {subtitle ? (
      <div className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>
    ) : null}
  </div>
);

export default StatsCard;