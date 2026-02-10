import React, { useMemo, useState } from 'react';
import { config } from '../../config/appConfig';
import { TrashIcon } from '../UI/Icons';

const ReviewDataForm = ({ certData = {}, onDeleteTest }) => {
  const [reviewType, setReviewType] = useState('practiceTest');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('ALL'); // 'ALL' | 'QUIZ'

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
      // Source Filter (Quiz Mode vs All)
      if (filterSource === 'QUIZ' && t.source !== 'quiz') {
        return false;
      }

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
  }, [testsByType, domainFilter, searchQuery, filterSource]);

  const getTabClass = (tabName) => {
    const isActive = reviewType === tabName;
    return `px-3 py-1.5 text-sm rounded-md transition-colors flex-1 text-center whitespace-nowrap ${
      isActive
        ? 'font-semibold app-bg-surface text-[var(--app-primary)] shadow-sm'
        : 'app-text-muted hover:app-bg-highlight'
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
      <div className="text-xs app-text-muted mt-1 flex flex-wrap gap-x-3 gap-y-1">
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
                    ? 'app-text-success'
                    : 'app-text-main'
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium app-text-main">
            Review Data Entries
          </h3>
          
          {/* Source Toggle */}
          <div className="flex space-x-1 app-bg-highlight rounded-lg p-1">
            <button
              type="button"
              onClick={() => setFilterSource('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterSource === 'ALL'
                  ? 'app-bg-surface app-text-main shadow-sm'
                  : 'app-text-muted hover:app-text-main'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterSource('QUIZ')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterSource === 'QUIZ'
                  ? 'app-bg-surface text-[var(--app-primary)] shadow-sm'
                  : 'app-text-muted hover:app-text-main'
              }`}
            >
              Quiz Only
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 app-bg-highlight rounded-lg p-1 my-4 overflow-x-auto">
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
            <label className="text-xs app-text-muted whitespace-nowrap">
              Domain
            </label>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="text-sm rounded-md border app-border app-bg-page px-2 py-1.5 app-text-main"
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
            <label className="text-xs app-text-muted whitespace-nowrap">
              Search
            </label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by entry name…"
              className="w-full text-sm rounded-md border app-border app-bg-page px-3 py-1.5 app-text-main"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold px-2 py-1.5 rounded-md app-bg-highlight app-text-main hover:opacity-80"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* List Area */}
        <div className="space-y-2 mt-4 max-h-[65vh] overflow-y-auto p-2 app-bg-page rounded-lg border app-border custom-scrollbar">
          <div className="px-1 pb-1 text-[11px] app-text-muted">
            Showing <span className="font-semibold">{filteredTests.length}</span> of{' '}
            <span className="font-semibold">{testsByType.length}</span>
          </div>

          {filteredTests.length > 0 ? (
            filteredTests.map((test, idx) => {
              const isQuiz = test.source === 'quiz';
              
              return (
                <div
                  key={test.id || idx}
                  className="flex justify-between items-start gap-3 px-3 py-3 app-bg-surface rounded-md border app-border transition-colors hover:app-bg-highlight"
                >
                  <div className="app-text-main overflow-hidden min-w-0">
                    <div className="text-sm flex items-center gap-2 min-w-0">
                      {/* Highlight label if source is quiz */}
                      <span className={`font-semibold truncate ${isQuiz ? 'text-[var(--app-primary)]' : ''}`}>
                        {test.label || 'Test'}
                      </span>
                      
                      <span className={`text-xs whitespace-nowrap ${isQuiz ? 'text-[var(--app-primary)]' : 'app-text-muted'}`}>
                        ({config.TEST_TYPES[test.type] || test.type})
                        {test.date ? ` - ${new Date(test.date).toLocaleDateString()}` : ''}
                      </span>
                    </div>

                    {renderDomainsSummary(test.domains)}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteTest?.(test.id)}
                    className="p-1.5 app-text-muted hover:text-[var(--app-danger)] rounded-md hover:app-bg-highlight flex-shrink-0"
                    title="Delete Test Entry"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm app-text-muted text-center py-10">
              No entries match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDataForm;