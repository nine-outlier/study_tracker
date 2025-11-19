// FILE: src/components/UI/Navigation.jsx
import React, { useState } from 'react';

/**
 * Navigation: Top-level tabs for certifications and app sections.
 *
 * Props:
 * - examData: { [certKey]: { fullName?: string, ... } }
 * - activeCert: string
 * - onCertChange: (certKey: string) => void
 * - activeTab: string
 * - onTabChange: (tabKey: string) => void
 * - onShowAddCertModal?: () => void
 */
const Navigation = ({
  examData = {},
  activeCert,
  onCertChange,
  activeTab,
  onTabChange,
  onShowAddCertModal,
}) => {
  const [showAllTabs, setShowAllTabs] = useState(false);

  const mainTabs = ['overview', 'priority', 'trends'];
  const moreTabs = ['study log'];

  const handleTabClick = (tab) => {
    onTabChange(tab);
    if (moreTabs.includes(tab)) {
      setShowAllTabs(true);
    }
  };

  // 🔴 THIS IS THE "C-3" HANDLER 🔴
  const handleAddCertClick = () => {
    if (typeof onShowAddCertModal === 'function') {
      onShowAddCertModal();
    }
  };

  const certKeys = Object.keys(examData || {});

  return (
    <div className="mb-6">
      {/* Certification Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-gray-800 mb-4">
        {certKeys.length === 0 ? (
          <span className="py-2 text-sm text-slate-500 dark:text-slate-400">
            No certifications configured yet.
          </span>
        ) : (
          certKeys.map((certKey) => (
            <button
              key={certKey}
              type="button"
              onClick={() => onCertChange(certKey)}
              className={`px-4 py-2 -mb-px text-sm font-medium border-b-2
                ${
                  activeCert === certKey
                    ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-gray-700'
                }`}
            >
              {examData[certKey].fullName || certKey}
            </button>
          ))
        )}

        {/* 🔵 THIS IS THE PLUS BUTTON USING C-3 🔵 */}
        <button
          type="button"
          onClick={handleAddCertClick}
          className="px-2.5 py-1 -mb-px text-sm font-medium text-sky-600 dark:text-sky-400 rounded-md hover:bg-sky-100 dark:hover:bg-sky-900/50"
          title="Add New Certification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-gray-950 rounded-lg p-1">
        {mainTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors 
              ${
                activeTab === tab
                  ? 'font-semibold bg-white text-slate-900 dark:bg-gray-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-gray-800'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}

        {showAllTabs &&
          moreTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors 
                ${
                  activeTab === tab
                    ? 'font-semibold bg-white text-slate-900 dark:bg-gray-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-gray-800'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}

        {!showAllTabs && moreTabs.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAllTabs(true)}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors 
                ${
                  moreTabs.includes(activeTab)
                    ? 'font-semibold bg-white text-slate-900 dark:bg-gray-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-gray-800'
                }`}
            >
              ...
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;