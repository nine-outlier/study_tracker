// FILE: src/components/DataForms/DomainForm.jsx
import React, { useState } from 'react';
import { config } from '../../config/appConfig.js';

const ALL_DOMAINS_KEY =
  (config && config.ALL_DOMAINS_KEY) || '[All Domains (Overall Score)]';
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
 * DomainForm: Component to add or delete domains.
 */
const DomainForm = ({
  existingDomains = [],
  onAddDomain,
  onDeleteDomain,
  showToast,
}) => {
  const [newDomain, setNewDomain] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const trimmed = newDomain.trim();

    if (!trimmed) {
      showToast('Please enter a domain name.', true);
      return;
    }

    if (trimmed === ALL_DOMAINS_KEY || trimmed === UNCATEGORIZED_KEY) {
      showToast('That domain name is reserved.', true);
      return;
    }

    if (existingDomains.includes(trimmed)) {
      showToast('That domain already exists.', true);
      return;
    }

    onAddDomain(trimmed);
    setNewDomain('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddSubmit} className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
          Add New Domain
        </h3>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            New Domain Name
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g., 1.0 Networking"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
          Existing Domains
        </h3>
        <div className="space-y-2 mt-4 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-md dark:bg-gray-800">
          {existingDomains.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              No domains created yet.
            </p>
          ) : (
            existingDomains.map((domainName, index) => {
              const isReserved =
                domainName === ALL_DOMAINS_KEY ||
                domainName === UNCATEGORIZED_KEY;

              return (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-white rounded-md border dark:bg-gray-700 dark:border-gray-600"
                >
                  <span className="text-sm dark:text-slate-100">
                    {domainName}
                  </span>
                  {!isReserved && (
                    <button
                      type="button"
                      onClick={() => onDeleteDomain(domainName)}
                      className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                      title="Delete Domain"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainForm;