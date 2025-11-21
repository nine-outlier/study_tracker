import React, { useState } from 'react';
import { config } from '../../config/appConfig';
import { TrashIcon } from '../UI/Icons';

const DomainForm = ({ existingDomains = [], onAddDomain, onDeleteDomain, showToast }) => {
    const [newDomain, setNewDomain] = useState('');

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const trimmed = newDomain.trim();

        if (!trimmed) {
            showToast('Please enter a domain name.', true);
            return;
        }

        if (trimmed === config.ALL_DOMAINS_KEY || trimmed === config.UNCATEGORIZED_KEY) {
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
            {/* Add Section */}
            <form onSubmit={handleAddSubmit} className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Add New Domain</h3>
                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        New Domain Name
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="e.g., 1.0 Networking"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            className="flex-grow px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors dark:bg-sky-500 dark:hover:bg-sky-600"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </form>

            {/* List Section */}
            <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">Existing Domains</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200 dark:bg-gray-800 dark:border-gray-700">
                    {existingDomains.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                            No domains created yet.
                        </p>
                    ) : (
                        existingDomains.map((domainName) => {
                            const isReserved = domainName === config.ALL_DOMAINS_KEY || domainName === config.UNCATEGORIZED_KEY;
                            
                            return (
                                <div key={domainName} className="flex justify-between items-center p-3 bg-white rounded border border-slate-200 dark:bg-gray-700 dark:border-gray-600">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-100 truncate mr-2">
                                        {domainName}
                                    </span>
                                    {!isReserved && (
                                        <button
                                            type="button"
                                            onClick={() => onDeleteDomain(domainName)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                                            title="Delete Domain"
                                        >
                                            <TrashIcon className="w-4 h-4" />
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