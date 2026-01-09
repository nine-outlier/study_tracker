import React, { useState, useMemo } from 'react';
import { PlusIcon, TrashIcon } from './Icons';

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
  onDeleteCert, // ✅ new
}) => {
  const [showAllTabs, setShowAllTabs] = useState(false);

  // Define all tabs in one place. If you add more later, the "..." logic will work automatically.
  const allTabs = useMemo(() => ([
    'overview',
    'priority',
    'trends',
  ]), []);

  // If you ever add more tabs, they'll fall into "moreTabs" automatically.
  const mainTabs = allTabs.slice(0, 3);
  const moreTabs = allTabs.slice(3);

  const handleTabClick = (tab) => {
    if (typeof onTabChange === 'function') onTabChange(tab);

    // Only expand if user picked a tab that lives in the overflow.
    if (moreTabs.includes(tab)) {
      setShowAllTabs(true);
    }
  };

  // Logic for the "Add Certification" button
  const handleAddCertClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onShowAddCertModal === 'function') {
      onShowAddCertModal();
    }
  };

  // ✅ Delete active certification
  const handleDeleteCertClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeCert && typeof onDeleteCert === 'function') {
      onDeleteCert(activeCert);
    }
  };

  const certKeys = Object.keys(examData || {});
  const canDelete = certKeys.length > 0 && !!activeCert;

  return (
    <div className="mb-6 space-y-4">
      {/* 1. Certification Selector (Pill Style) */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar">
        {certKeys.length === 0 ? (
          <span className="py-2 text-sm app-text-muted italic px-4">No certifications configured.</span>
        ) : (
          certKeys.map((certKey) => {
            const isActive = activeCert === certKey;
            const cert = examData[certKey];
            return (
              <button
                key={certKey}
                onClick={() => onCertChange(certKey)}
                // Use Palette Slot 27 (Bg) and Slot 28 (Text) for Active State
                style={isActive ? {
                  backgroundColor: 'var(--app-pure-white)',
                  color: 'var(--app-pure-black)',
                  borderColor: 'var(--app-pure-white)'
                } : {}}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all border
                  ${isActive
                    ? 'shadow-md scale-105'
                    : 'app-bg-surface app-text-muted app-border-muted hover:opacity-80'
                  }
                `}
              >
                {cert?.shortName || cert?.fullName || certKey}
              </button>
            );
          })
        )}

        <button
          onClick={handleAddCertClick}
          className="flex-shrink-0 w-9 h-9 rounded-lg border border-dashed app-border-muted flex items-center justify-center app-text-muted hover:app-text-primary hover:app-border-primary transition-colors"
          title="Add Certification"
        >
          <PlusIcon className="w-5 h-5" />
        </button>

        {/* ✅ Delete Active Certification */}
        <button
          onClick={handleDeleteCertClick}
          disabled={!canDelete}
          className={`flex-shrink-0 w-9 h-9 rounded-lg border border-dashed app-border-muted flex items-center justify-center transition-colors
            ${canDelete
              ? 'text-red-600 hover:opacity-80'
              : 'text-slate-400 opacity-50 cursor-not-allowed'
            }`}
          title="Delete Active Certification"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Section Tabs (Thin Line Style - Removed Thick Bar) */}
      <div className="flex border-b app-border-muted space-x-6 overflow-x-auto custom-scrollbar">
        {mainTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`
              pb-3 text-sm font-medium capitalize transition-colors relative whitespace-nowrap
              ${activeTab === tab ? 'app-text-primary' : 'app-text-muted hover:app-text-main'}
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 app-bg-primary rounded-t-full" />
            )}
          </button>
        ))}

        {/* Render overflow tabs if expanded */}
        {showAllTabs && moreTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`
              pb-3 text-sm font-medium capitalize transition-colors relative whitespace-nowrap
              ${activeTab === tab ? 'app-text-primary' : 'app-text-muted hover:app-text-main'}
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 app-bg-primary rounded-t-full" />
            )}
          </button>
        ))}

        {/* Only show "..." if there actually ARE overflow tabs */}
        {!showAllTabs && moreTabs.length > 0 && (
          <button
            onClick={() => setShowAllTabs(true)}
            className={`
              pb-3 text-sm font-medium transition-colors relative whitespace-nowrap
              ${moreTabs.includes(activeTab) ? 'app-text-primary' : 'app-text-muted hover:app-text-main'}
            `}
          >
            ...
            {moreTabs.includes(activeTab) && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 app-bg-primary rounded-t-full" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Navigation;