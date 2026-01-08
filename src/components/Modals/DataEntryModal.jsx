import React, { useState, useEffect } from 'react';
import DataForm from '../DataForms/DataForm';
import DomainForm from '../DataForms/DomainForm';
import ReviewDataForm from '../DataForms/ReviewDataForm';
import UncategorizedDataForm from '../DataForms/UncategorizedDataForm';

/**
 * DataEntryModal: Main modal for all data input, using tabs.
 * - Study Session tab removed
 * - Review tab no longer includes Study Sessions
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
}) => {
  const [formType, setFormType] = useState('data');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setFormType('data'); // always start on Add Test
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

  // Helper for tab classes
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
          <button
            type="button"
            onClick={() => setFormType('data')}
            className={getTabClass('data')}
          >
            Add Test
          </button>

          <button
            type="button"
            onClick={() => setFormType('domains')}
            className={getTabClass('domains')}
          >
            Domains
          </button>

          <button
            type="button"
            onClick={() => setFormType('edit')}
            className={getTabClass('edit')}
          >
            Review
          </button>

          {/* Show Uncategorized tab only if data exists */}
          {hasUncategorized && (
            <button
              type="button"
              onClick={() => setFormType('uncategorized')}
              className={`${getTabClass(
                'uncategorized'
              )} text-red-600 dark:text-red-400`}
            >
              Uncategorized
            </button>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {formType === 'data' && (
            <DataForm
              existingDomains={activeDomainNames}
              onAddTest={onAddTest}
              onClose={handleClose}
              showToast={showToast}
            />
          )}

          {formType === 'domains' && (
            <DomainForm
              existingDomains={activeDomainNames}
              onAddDomain={onAddDomain}
              onDeleteDomain={onDeleteDomain}
              showToast={showToast}
            />
          )}

          {formType === 'edit' && (
            <ReviewDataForm
              certData={certData}
              onDeleteTest={onDeleteTest}
              // ✅ explicitly hide/remove Study Sessions in Review
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