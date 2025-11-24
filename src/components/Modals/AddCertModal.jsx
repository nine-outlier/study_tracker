import React, { useState, useEffect } from 'react';

/**
 * AddCertModal
 * A modal for adding subsequent certifications.
 *
 * Props:
 * - isVisible: boolean - Controls visibility for animation
 * - onAddCert: (name: string) => void - Callback to parent to save data
 * - onClose: () => void - Callback to close modal without saving
 */
const AddCertModal = ({ onAddCert, onClose, isVisible }) => {
  const [certName, setCertName] = useState('');
  const [show, setShow] = useState(false);

  // Handle CSS transition for fade-in/out
  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = certName.trim();
    if (!trimmed) return;
    
    // Pass data back to App.jsx
    onAddCert(trimmed);
    
    // Reset and close
    setCertName('');
    setShow(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white p-6 rounded-xl ring-1 ring-slate-200 shadow-lg w-full max-w-md m-4 dark:bg-gray-900 dark:ring-gray-800 transform transition-all duration-200 ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Add New Certification
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Enter the name of the new certification you want to track.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="newCertName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Certification Name
            </label>
            <input
              type="text"
              id="newCertName"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              placeholder="e.g., AWS Cloud Practitioner"
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
              required
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
              Add Certification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCertModal;