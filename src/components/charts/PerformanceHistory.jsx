import React from 'react';
import { config } from '../../config/appConfig.js';

const PerformanceHistory = ({ historyData, trendFilter, setTrendFilter, appSettings, rankingEngine }) => {
    
  const toggleFilter = (type) => {
    setTrendFilter(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredHistory = historyData.filter(item => trendFilter[item.type]);
  const visibleHistory = filteredHistory.slice(0, 3);

  return (
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-lg font-semibold app-text-main">Performance History</h2>
            
            <div className="flex flex-wrap gap-2">
                {Object.entries(config.TEST_TYPES || {}).map(([key, label]) => {
                   const isActive = trendFilter[key];
                   const activeClass = 'app-bg-primary app-text-on-primary app-border-primary';
                   const inactiveClass = 'app-bg-surface app-text-muted app-border-muted hover:opacity-80';

                   return (
                       <button
                           key={key}
                           onClick={() => toggleFilter(key)}
                           className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${isActive ? activeClass : inactiveClass}`}
                       >
                           {label}
                       </button>
                   );
                })}
            </div>
        </div>
        
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {visibleHistory.length === 0 ? (
                <div className="text-center py-8 app-text-muted italic">
                    No data matching filters.
                </div>
            ) : (
                visibleHistory.map((item, idx) => {
                    // Use rankingEngine passed from App.jsx to determine color based on the rank
                    // Note: historyData items now have a 'rank' property added by App.jsx
                    const rank = item.rank || (rankingEngine ? rankingEngine.determineRank(item.score) : 'Critical');
                    
                    const barColor = rankingEngine ? rankingEngine.getRankClass(rank, 'bg') : '';
                    const scoreColor = rankingEngine ? rankingEngine.getRankClass(rank, 'text') : '';

                    return (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg border app-border-muted hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-10 rounded-full ${barColor}`}></div>
                                
                                <div>
                                    <h4 className="text-sm font-bold app-text-main">
                                        {item.session}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs app-text-muted mt-0.5">
                                        <span>{item.date}</span>
                                        <span>•</span>
                                        <span className="capitalize">{config.TEST_TYPES?.[item.type] || item.type}</span>
                                        {item.weight !== 1 && <span className="opacity-70 italic"> (x{item.weight})</span>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className={`text-xl font-black ${scoreColor}`}>
                                    {item.score}%
                                </div>
                                <div className="text-xs font-medium app-text-muted">
                                    {item.total} Qs
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
};

export default PerformanceHistory;