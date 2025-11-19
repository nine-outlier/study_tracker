// FILE: src/components/DataForms/DataForm.jsx
import React, { useState, useEffect } from 'react';
import { generateId } from '../../utils/helpers.js';
import { config } from '../../config/appConfig.js';

// Fall back to the literal string if config doesn't define it for some reason
const ALL_DOMAINS_KEY =
  (config && config.ALL_DOMAINS_KEY) || '[All Domains (Overall Score)]';

/**
 * DataForm: Component to add a new test/quiz entry.
 */
const DataForm = ({ existingDomains = [], onAddTest, showToast }) => {
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [testType, setTestType] = useState('officialQuiz');
  const [domainSelection, setDomainSelection] = useState(
    existingDomains[0] || ALL_DOMAINS_KEY
  );
  const [domainCorrect, setDomainCorrect] = useState('');
  const [domainTotal, setDomainTotal] = useState('');

  useEffect(() => {
    if (!domainSelection && existingDomains.length > 0) {
      setDomainSelection(existingDomains[0]);
    } else if (domainSelection === '' && existingDomains.length === 0) {
      setDomainSelection(ALL_DOMAINS_KEY);
    } else if (
      !existingDomains.includes(domainSelection) &&
      domainSelection !== ALL_DOMAINS_KEY
    ) {
      setDomainSelection(existingDomains[0] || ALL_DOMAINS_KEY);
    }
  }, [existingDomains, domainSelection]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!label || !date) {
      showToast('Please add a test label and date.', true);
      return;
    }
    if (!domainSelection || domainCorrect === '' || domainTotal === '') {
      showToast('Please select a domain and fill out all score fields.', true);
      return;
    }

    const correctVal = parseInt(domainCorrect, 10);
    const totalVal = parseInt(domainTotal, 10);

    if (Number.isNaN(correctVal) || Number.isNaN(totalVal)) {
      showToast('Please enter valid numbers for Correct and Total.', true);
      return;
    }

    if (correctVal > totalVal) {
      showToast("'Correct' cannot be greater than 'Total'.", true);
      return;
    }

    const domains = {
      [domainSelection]: {
        correct: correctVal,
        total: totalVal,
      },
    };

    const testData = {
      id: generateId('test'),
      label,
      date,
      type: testType,
      domains,
      isDeleted: false,
    };

    onAddTest(testData);

    setDomainCorrect('');
    setDomainTotal('');
    showToast('Data Entry Saved!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
        Add Test Data
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Test Label (e.g., Chapter 1 Quiz)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
          required
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Test Type
        </label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
        >
          <option value="officialQuiz">Official Quiz</option>
          <option value="miniTest">Mini Test</option>
          <option value="practiceTest">Practice Test</option>
          <option value="miniQuiz">(Legacy) Mini Quiz</option>
        </select>
      </div>

      <div className="p-4 border border-slate-200 rounded-lg space-y-4 dark:border-gray-700">
        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
          Add Score
        </h4>

        <div className="grid grid-cols-1">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Domain
            </label>
            <select
              value={domainSelection}
              onChange={(e) => setDomainSelection(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
            >
              {existingDomains.length === 0 && (
                <option value="" disabled>
                  Please add domains in the &apos;Domains&apos; tab
                </option>
              )}
              {existingDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value={ALL_DOMAINS_KEY}>
                [All Domains (Overall Score)]
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Correct"
            min="0"
            value={domainCorrect}
            onChange={(e) => setDomainCorrect(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
          />
          <input
            type="number"
            placeholder="Total"
            min="1"
            value={domainTotal}
            onChange={(e) => setDomainTotal(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 disabled:bg-slate-400"
      >
        Save Data Entry
      </button>
    </form>
  );
};

export default DataForm;