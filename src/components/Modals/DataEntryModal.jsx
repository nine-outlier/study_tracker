import React, { useState, useEffect } from 'react';
import DataForm from '../DataForms/DataForm';
import DomainForm from '../DataForms/DomainForm';
import ReviewDataForm from '../DataForms/ReviewDataForm';
import UncategorizedDataForm from '../DataForms/UncategorizedDataForm';
import { PREMADE_DATA } from '../../config/appConfig';

/**
 * DataEntryModal: Main modal for all data input, using tabs.
 * - Study Session tab removed
 * - Review tab no longer includes Study Sessions
 * - Premade tab removed (moved to AddCertModal)
 */
const DataEntryModal = ({
  isVisible,
  activeCert,
  certData,
  uncategorizedEntries,
  existingDomains,
  onAddTest,
  onAddDomain,
  onDeleteDomain,
  onDeleteTest,
  onReassignData,
  onClose,
  showToast,
  isPremade = false, // New prop to control domain editing
}) => {
  const [formType, setFormType] = useState('data');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setFormType('data');
    }
  }, [isVisible]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  const activeDomainNames = existingDomains || [];
  const hasUncategorized =
    Array.isArray(uncategorizedEntries) && uncategorizedEntries.length > 0;

  // Ensure we only lock domains for actual premade certifications defined in config
  // This overrides any potential false positives from the isPremade prop or data
  const isLockedPremade = PREMADE_DATA && PREMADE_DATA[activeCert];

  const getTabClass = (tabName) => {
    const isActive = formType === tabName;
    return `whitespace-nowrap px-3 py-2 rounded-md text-sm transition-colors ${
      isActive
        ? 'font-semibold bg-white text-slate-900 dark:bg-gray-800 dark:text-slate-100 shadow-sm'
        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-gray-800'
    }`;
  };

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white p-6 rounded-xl ring-1 ring-slate-200 shadow-lg w-full max-w-2xl m-4 dark:bg-gray-900 dark:ring-gray-800 transform transition-all duration-200 ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Tabs */}
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-6 dark:bg-gray-950 overflow-x-auto">
          <button onClick={() => setFormType('data')} className={getTabClass('data')}>
            Add Test
          </button>
          <button onClick={() => setFormType('domains')} className={getTabClass('domains')}>
            Domains
          </button>
          <button onClick={() => setFormType('edit')} className={getTabClass('edit')}>
            Review
          </button>
          {hasUncategorized && (
            <button onClick={() => setFormType('uncategorized')} className={`${getTabClass('uncategorized')} text-red-600 dark:text-red-400`}>
              Uncategorized
            </button>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {formType === 'data' && (
            <DataForm
              existingDomains={activeDomainNames}
              onAddTest={onAddTest}
              onClose={handleClose}
              showToast={showToast}
            />
          )}
          
          {formType === 'domains' && (
            isLockedPremade ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Managed Certification</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  Domains for this certification are managed automatically and cannot be modified.
                </p>
              </div>
            ) : (
              <DomainForm
                existingDomains={activeDomainNames}
                onAddDomain={onAddDomain}
                onDeleteDomain={onDeleteDomain}
                showToast={showToast}
              />
            )
          )}

          {formType === 'edit' && (
            <ReviewDataForm
              certData={certData}
              onDeleteTest={onDeleteTest}
              hideStudySessions={true}
            />
          )}
          {formType === 'uncategorized' && (
            <UncategorizedDataForm
              uncategorizedEntries={uncategorizedEntries}
              existingDomains={activeDomainNames}
              onReassignData={onReassignData}
              showToast={showToast}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DataEntryModal;