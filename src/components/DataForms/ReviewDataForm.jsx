import React, { useMemo, useState } from 'react';
import { config } from '../../config/appConfig';
import { TrashIcon } from '../UI/Icons';

const ReviewDataForm = ({ certData = {}, onDeleteTest }) => {
  const [reviewType, setReviewType] = useState('practiceTest');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allTests = useMemo(
    () => (certData.tests || []).filter((t) => !t.isDeleted),
    [certData.tests]
  );

  const domainOptions = useMemo(() => {
    const domains = (certData.domains || [])
      .filter((d) => !d.isDeleted)
      .map((d) => d.name)
      .filter(Boolean);

    // Unique + stable
    return Array.from(new Set(domains)).sort((a, b) => a.localeCompare(b));
  }, [certData.domains]);

  const testsByType = useMemo(() => {
    const tests =
      reviewType === 'miniQuiz'
        ? allTests.filter((t) => t.type === 'miniQuiz' || t.type === 'miniTest')
        : allTests.filter((t) => t.type === reviewType);

    // Sort newest first by date (fallback to 0)
    return [...tests].sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
  }, [allTests, reviewType]);

  const filteredTests = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    return testsByType.filter((t) => {
      // Domain filter
      if (domainFilter !== 'ALL') {
        const keys = Object.keys(t?.domains || {});
        if (!keys.includes(domainFilter)) return false;
      }

      // Search by "label" (the name you gave the entry)
      if (q) {
        const label = (t?.label || '').toLowerCase();
        if (!label.includes(q)) return false;
      }

      return true;
    });
  }, [testsByType, domainFilter, searchQuery]);

  const getTabClass = (tabName) => {
    const isActive = reviewType === tabName;
    return `px-3 py-1.5 text-sm rounded-md transition-colors flex-1 text-center whitespace-nowrap ${
      isActive
        ? 'font-semibold bg-white text-slate-900 dark:bg-gray-700 dark:text-slate-100 shadow-sm'
        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-gray-700'
    }`;
  };

  const renderDomainsSummary = (domainsObj) => {
    if (!domainsObj) return null;

    const entries = Object.entries(domainsObj).filter(
      ([domainKey]) =>
        domainKey !== config.UNCATEGORIZED_KEY && domainKey !== config.ALL_DOMAINS_KEY
    );

    if (entries.length === 0) return null;

    return (
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {entries.map(([domain, score]) => {
          const ratio =
            score && score.total > 0 ? score.correct / score.total : 0;
          const good = ratio >= 0.8;

          return (
            <span key={domain}>
              {domain}:{' '}
              <span
                className={
                  good
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-600 dark:text-slate-300'
                }
              >
                {score?.correct ?? 0}/{score?.total ?? 0}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
          Review Data Entries
        </h3>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 my-4 dark:bg-gray-950 overflow-x-auto">
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
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Domain
            </label>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="text-sm rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-700
                         dark:bg-gray-900 dark:border-gray-700 dark:text-slate-200"
            >
              <option value="ALL">All domains</option>
              {domainOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Search
            </label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by entry name…"
              className="w-full text-sm rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700
                         dark:bg-gray-900 dark:border-gray-700 dark:text-slate-200"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold px-2 py-1.5 rounded-md bg-slate-100 text-slate-700
                           hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* List Area */}
        <div className="space-y-2 mt-4 max-h-[65vh] overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-1 pb-1 text-[11px] text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold">{filteredTests.length}</span> of{' '}
            <span className="font-semibold">{testsByType.length}</span>
          </div>

          {filteredTests.length > 0 ? (
            filteredTests.map((test, idx) => (
              <div
                key={test.id || idx}
                className="flex justify-between items-start gap-3 px-3 py-3 bg-white rounded-md border border-slate-200
                           dark:bg-gray-700 dark:border-gray-600 transition-colors hover:bg-slate-50 dark:hover:bg-gray-600/80"
              >
                <div className="dark:text-slate-100 overflow-hidden min-w-0">
                  <div className="text-sm flex items-center gap-2 min-w-0">
                    <span className="font-semibold truncate">
                      {test.label || 'Test'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      ({config.TEST_TYPES[test.type] || test.type})
                      {test.date ? ` - ${test.date}` : ''}
                    </span>
                  </div>

                  {renderDomainsSummary(test.domains)}
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteTest?.(test.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50
                             dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-red-900/30 flex-shrink-0"
                  title="Delete Test Entry"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">
              No entries match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDataForm;