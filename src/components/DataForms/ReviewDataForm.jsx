import React, { useState } from 'react';
import { config } from '../../config/appConfig';
import { TrashIcon } from '../UI/Icons';

const ReviewDataForm = ({ certData = {}, onDeleteTest, onDeleteStudySession }) => {
    const [reviewType, setReviewType] = useState('practiceTest');

    const allTests = (certData.tests || []).filter((t) => !t.isDeleted);
    const allStudySessions = (certData.studySessions || []).filter((s) => !s.isDeleted);

    // Logic to group similar tests (same label/date/type) into one review card
    const filterTests = (type) => {
        const tests = type === 'miniQuiz'
            ? allTests.filter((t) => t.type === 'miniQuiz' || t.type === 'miniTest')
            : allTests.filter((t) => t.type === type);

        return tests.reduce((acc, test, index) => {
            const key = `${test.label || ''}${test.date || ''}${test.type || ''}`;
            if (!acc[key]) {
                acc[key] = {
                    ...test,
                    indices: [],
                    testIds: [],
                    allDomains: {},
                };
            }

            acc[key].indices.push(index);
            acc[key].testIds.push(test.id);

            if (test.domains) {
                const filteredDomains = Object.fromEntries(
                    Object.entries(test.domains).filter(
                        ([domainKey]) => domainKey !== config.UNCATEGORIZED_KEY
                    )
                );
                Object.assign(acc[key].allDomains, filteredDomains);
            }

            return acc;
        }, {});
    };

    const testsToReview = Object.values(filterTests(reviewType)).reverse();
    const hasStudySessions = allStudySessions.length > 0;

    const getTabClass = (tabName) => {
        const isActive = reviewType === tabName;
        return `px-3 py-1.5 text-sm rounded-md transition-colors flex-1 text-center whitespace-nowrap ${
            isActive
                ? 'font-semibold bg-white text-slate-900 dark:bg-gray-700 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-gray-700'
        }`;
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                    Review Data Entries
                </h3>
                
                {/* Filter Tabs */}
                <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 my-4 dark:bg-gray-950 overflow-x-auto">
                    <button type="button" onClick={() => setReviewType('practiceTest')} className={getTabClass('practiceTest')}>
                        Practice Tests
                    </button>
                    <button type="button" onClick={() => setReviewType('officialQuiz')} className={getTabClass('officialQuiz')}>
                        Official Quizzes
                    </button>
                    <button type="button" onClick={() => setReviewType('miniQuiz')} className={getTabClass('miniQuiz')}>
                        Mini Tests
                    </button>
                    <button type="button" onClick={() => setReviewType('study')} className={getTabClass('study')}>
                        Study Log
                    </button>
                </div>

                {/* List Area */}
                <div className="space-y-2 mt-4 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200 dark:bg-gray-800 dark:border-gray-700">
                    {reviewType === 'study' ? (
                        hasStudySessions ? (
                            [...allStudySessions].reverse().map((session, index) => (
                                <div
                                    key={session.id || index}
                                    className="flex justify-between items-center px-3 py-3 bg-white rounded-md border border-slate-200 dark:bg-gray-700 dark:border-gray-600 transition-colors hover:bg-slate-50 dark:hover:bg-gray-600/80"
                                >
                                    <span className="text-sm text-slate-700 dark:text-slate-100">
                                        <span className="font-medium">{session.topic}</span> <span className="text-slate-500">({session.duration} min)</span> - <span className="text-xs text-slate-400">{session.date}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onDeleteStudySession(session.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 flex-shrink-0 ml-2"
                                        title="Delete Study Session"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                                No study sessions to review.
                            </p>
                        )
                    ) : testsToReview.length > 0 ? (
                        testsToReview.map((test, groupIndex) => (
                            <div
                                key={groupIndex}
                                className="flex justify-between items-center px-3 py-3 bg-white rounded-md border border-slate-200 dark:bg-gray-700 dark:border-gray-600 transition-colors hover:bg-slate-50 dark:hover:bg-gray-600/80"
                            >
                                <div className="dark:text-slate-100 overflow-hidden">
                                    <div className="text-sm flex items-center gap-2">
                                        <span className="font-semibold truncate">{test.label}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            ({config.TEST_TYPES[test.type] || test.type}) - {test.date}
                                        </span>
                                    </div>
                                    {test.allDomains && (
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                            {Object.entries(test.allDomains).map(([domain, score]) => (
                                                <span key={domain}>
                                                    {domain}: <span className={score.correct/score.total >= 0.8 ? "text-green-600 dark:text-green-400" : "text-slate-600 dark:text-slate-300"}>{score.correct}/{score.total}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => test.testIds.forEach((id) => onDeleteTest(id))}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 flex-shrink-0 ml-2"
                                    title="Delete Test Entry"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                            No {config.TEST_TYPES[reviewType] || ''} entries to review.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewDataForm;