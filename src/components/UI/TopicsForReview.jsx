import React from 'react';
import { getTopicColorClasses } from '../../utils/themeHelpers.js';
import { config } from '../../config/appConfig.js';

const TopicsForReview = ({ topics, isWeighted, appSettings }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-4 sm:p-6 dark:bg-gray-900 dark:ring-gray-800">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Domains for Review</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    All domains with a {isWeighted ? 'weighted' : 'raw'} average below passing ({config.PASSING_SCORE}%), ranked by priority.
                </p>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {topics.length > 0 ? topics.map((area, idx) => {
                    const colors = getTopicColorClasses(area.weightedAvg, appSettings.colorblindMode);
                    return (
                        <div key={area.domain} className={`p-4 bg-slate-50 dark:bg-gray-800 rounded-lg ring-1 ${colors.ring}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                    <div className={`flex items-center justify-center w-8 h-8 ${colors.bg} rounded-full text-sm font-bold ${colors.text}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{area.domain}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end sm:gap-6 ml-11 sm:ml-0">
                                    <div className="text-center">
                                        <div className={`text-lg font-bold ${colors.score}`}>{area.weightedAvg}%</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{isWeighted ? 'Weighted' : 'Raw'} Avg</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{area.totalQuestions}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Total Qs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <div className="text-4xl mb-2">🎉</div>
                        <p>No domains found for review! All domains are at or above the passing score.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicsForReview;