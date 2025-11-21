import React, { useState } from 'react';
import { PlusIcon } from './Icons';

/**
 * Navigation: Top-level tabs for certifications and app sections.
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

  // Logic for the "Add Certification" button (Breadcrumb creator)
  const handleAddCertClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onShowAddCertModal === 'function') {
      onShowAddCertModal();
    }
  };

  const certKeys = Object.keys(examData || {});

  return (
    <div className="mb-6">
      {/* Certification Tabs Row */}
      <div className="flex items-center border-b border-slate-200 dark:border-gray-800 mb-4">
        
        {/* Scrollable Container for Certs (Hidden Scrollbar) */}
        <div className="flex overflow-x-auto no-scrollbar flex-grow space-x-2 pr-2">
            {certKeys.length === 0 ? (
            <span className="py-2 text-sm text-slate-500 dark:text-slate-400 italic px-4">
                No certifications configured.
            </span>
            ) : (
            certKeys.map((certKey) => (
                <button
                key={certKey}
                type="button"
                onClick={() => onCertChange(certKey)}
                className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex-shrink-0
                    ${
                    activeCert === certKey
                        ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-gray-700'
                    }`}
                >
                {examData[certKey]?.shortName || examData[certKey]?.fullName || certKey}
                </button>
            ))
            )}
        </div>

        {/* Fixed "Add Cert" Button - Stays visible on the right */}
        <div className="pl-2 border-l border-slate-200 dark:border-gray-700 flex-shrink-0">
            <button
            type="button"
            onClick={handleAddCertClick}
            className="p-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Add New Certification"
            >
            <PlusIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Section Tabs (Overview, Priority, etc.) */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-gray-950 rounded-lg p-1 overflow-x-auto no-scrollbar">
        {mainTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
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
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
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
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowAllTabs(true)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors 
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