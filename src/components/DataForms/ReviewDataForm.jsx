// FILE: src/components/DataForms/ReviewDataForm.jsx
import React, { useState } from 'react';
import { config } from '../../config/appConfig.js';

const TEST_TYPES =
  (config && config.TEST_TYPES) || {
    miniQuiz: 'Mini Quiz',
    officialQuiz: 'Official Quiz',
    miniTest: 'Mini Test',
    practiceTest: 'Practice Test',
  };

const UNCATEGORIZED_KEY =
  (config && config.UNCATEGORIZED_KEY) || '[Uncategorized Data]';

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 3a1.5 1.5 0 011.5-1.5h1.5A1.5 1.5 0 0114.25 3h3a.75.75 0 010 1.5h-.443l-.8 12.01A2.25 2.25 0 0113.77 18.75H10.23a2.25 2.25 0 01-2.237-2.24L7.193 4.5H6.75A.75.75 0 016 3.75h3.75zM10.5 7.5a.75.75 0 00-.75.75v7.5a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75zm3 0a.75.75 0 00-.75.75v7.5a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75z"
    />
  </svg>
);

/**
 * ReviewDataForm: Component to review and delete existing data entries.
 */
const ReviewDataForm = ({ certData = {}, onDeleteTest, onDeleteStudySession }) => {
  const [reviewType, setReviewType] = useState('practiceTest');

  const allTests = (certData.tests || []).filter((t) => !t.isDeleted);
  const allStudySessions = (certData.studySessions || []).filter(
    (s) => !s.isDeleted
  );

  const filterTests = (type) => {
    const tests =
      type === 'miniQuiz'
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
            ([domainKey]) => domainKey !== UNCATEGORIZED_KEY
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
    return `px-3 py-1.5 text-sm rounded-md transition-colors ${
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
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 my-4 dark:bg-gray-950">
          <button
            type="button"
            onClick={() => setReviewType('practiceTest')}
            className={getTabClass('practiceTest')}
          >
            Practice Tests
          </button>
          <button
            type="button"
            onClick={() => setReviewType('officialQuiz')}
            className={getTabClass('officialQuiz')}
          >
            Official Quizzes
          </button>
          <button
            type="button"
            onClick={() => setReviewType('miniQuiz')}
            className={getTabClass('miniQuiz')}
          >
            Mini Tests
          </button>
          <button
            type="button"
            onClick={() => setReviewType('study')}
            className={getTabClass('study')}
          >
            Study Log
          </button>
        </div>

        <div className="space-y-2 mt-4 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-md dark:bg-gray-800">
          {reviewType === 'study' ? (
            hasStudySessions ? (
              [...allStudySessions].reverse().map((session, index) => (
                <div
                  key={session.id || index}
                  className="flex justify-between items-center px-2 py-3 bg-white rounded-md border dark:bg-gray-700 dark:border-gray-600 transition-colors hover:bg-slate-100 dark:hover:bg-gray-600/50"
                >
                  <span className="text-sm dark:text-slate-100">
                    {session.topic} ({session.duration} min) - {session.date}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteStudySession(session.id)}
                    className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 flex-shrink-0 ml-2"
                    title="Delete Study Session"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                No study sessions to review.
              </p>
            )
          ) : testsToReview.length > 0 ? (
            testsToReview.map((test, groupIndex) => (
              <div
                key={groupIndex}
                className="flex justify-between items-center px-2 py-3 bg-white rounded-md border border-slate-200 dark:bg-gray-700 dark:border-gray-600 transition-colors hover:bg-slate-100 dark:hover:bg-gray-600/50"
              >
                <div className="dark:text-slate-100">
                  <span className="text-sm">
                    <strong>{test.label}</strong>{' '}
                    ({TEST_TYPES[test.type] || test.type}) - {test.date}
                  </span>
                  {test.allDomains && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 pl-2">
                      {Object.entries(test.allDomains).map(([domain, score]) => (
                        <span key={domain} className="mr-2">
                          {domain}: {score.correct}/{score.total}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => test.testIds.forEach((id) => onDeleteTest(id))}
                  className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 flex-shrink-0 ml-2"
                  title="Delete Test Entry"
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No {TEST_TYPES[reviewType] || ''} entries to review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDataForm;