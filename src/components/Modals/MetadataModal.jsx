import React, { useState, useEffect } from 'react';

/**
 * MetadataModal: A modal to correct / rename uncategorized domains.
 */
const MetadataModal = ({ topic, onClose, onSubmit, showToast }) => {
  const initialName = topic?.domainName || '';
  const [domain, setDomain] = useState(initialName);
  const [isVisible, setIsVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // If a new topic is passed in while the modal is open, sync the input
  useEffect(() => {
    setDomain(topic?.domainName || '');
  }, [topic]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = domain.trim();
    if (!trimmed) {
      showToast('Please enter a domain name.', true);
      return;
    }

    onSubmit(topic, trimmed);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const domainNameLabel = topic?.domainName || '(unknown domain)';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800 transform transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Uncategorized Domain
        </h2>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          The domain{' '}
          <strong className="text-red-600 dark:text-red-400">
            {domainNameLabel}
          </strong>{' '}
          was found in your test data but isn&apos;t in your official domain
          list.
        </p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Please add it to your domain list, or correct the name.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="domainName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Correct Domain Name
            </label>
            <input
              type="text"
              id="domainName"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., 1.0 Domain One"
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              Add and Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MetadataModal;