// FILE: src/components/DataForms/UncategorizedDataForm.jsx
import React, { useState } from 'react';

/**
 * UncategorizedDataForm
 * Component to manage and reassign uncategorized data.
 */
const UncategorizedDataForm = ({
  uncategorizedEntries = [],
  existingDomains = [],
  onReassignData,
  showToast,
}) => {
  const [assignments, setAssignments] = useState({});

  const handleSelectChange = (testId, domain) => {
    setAssignments((prev) => ({ ...prev, [testId]: domain }));
  };

  const handleReassign = (testId) => {
    const targetDomain = assignments[testId];
    if (!targetDomain) {
      showToast('Please select a domain to reassign this data to.', true);
      return;
    }
    onReassignData(testId, targetDomain);
  };

  if (!uncategorizedEntries.length) {
    return (
      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
          Uncategorized Data
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4 py-4">
          No uncategorized data found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
          Uncategorized Data
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This data came from domains that were deleted. Please reassign it to an
          existing domain.
        </p>

        <div className="space-y-2 mt-4 max-h-80 overflow-y-auto p-2 bg-slate-50 rounded-md dark:bg-gray-800">
          {uncategorizedEntries.map((entry) => (
            <div
              key={entry.testId}
              className="p-3 bg-white rounded-md border dark:bg-gray-700 dark:border-gray-600"
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {entry.label} ({entry.date})
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 ml-2">
                Uncategorized Score:{' '}
                <strong className="text-red-600 dark:text-red-400">
                  {entry.scoreData.correct} / {entry.scoreData.total}
                </strong>
              </div>

              <div className="flex space-x-2 mt-2">
                <select
                  value={assignments[entry.testId] || ''}
                  onChange={(e) => handleSelectChange(entry.testId, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
                >
                  <option value="" disabled>
                    Select a domain...
                  </option>
                  {existingDomains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleReassign(entry.testId)}
                  disabled={!assignments[entry.testId]}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 disabled:bg-slate-400"
                >
                  Reassign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UncategorizedDataForm;