import React from 'react';
import { getTopicColorClasses } from '../../utils/themeHelpers.js';
import { config } from '../../config/appConfig.js';

const TopicsForReview = ({ topics, isWeighted, appSettings }) => {
  return (
    <div className="app-bg-surface rounded-xl shadow-sm border app-border-muted p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold app-text-main">Domains for Review</h2>
        <p className="text-sm app-text-muted">
          All domains with a {isWeighted ? 'weighted' : 'raw'} average below passing ({config.PASSING_SCORE}%), ranked by priority.
        </p>
      </div>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {topics.length > 0 ? topics.map((area, idx) => {
          const colors = getTopicColorClasses(area.weightedAvg, appSettings);
          // Use colors.badge if available, otherwise fallback to bg/text combo
          const badgeClass = colors.badge || `${colors.bg} ${colors.text}`;
          
          return (
            <div key={area.domain} className={`p-4 rounded-lg ring-1 ${colors.ring} ${colors.bg || ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${badgeClass}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${colors.text}`}>{area.domain}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:gap-6 ml-11 sm:ml-0">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${colors.score}`}>{area.weightedAvg}%</div>
                    <div className={`text-xs ${colors.text}`}>{isWeighted ? 'Weighted' : 'Raw'} Avg</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${colors.text}`}>{area.totalQuestions}</div>
                    <div className={`text-xs ${colors.text}`}>Total Qs</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-8 app-text-muted">
            <div className="text-4xl mb-2">🎉</div>
            <p>No domains found for review! All domains are at or above the passing score.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicsForReview;