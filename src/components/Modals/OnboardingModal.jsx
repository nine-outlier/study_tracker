// FILE: src/components/Modals/OnboardingModal.jsx
import React, { useState } from 'react';

/**
 * OnboardingModal
 * A full-screen modal for first-time users to add their first cert.
 *
 * Props:
 * - onAddFirstCert: (name: string) => void
 */
const OnboardingModal = ({ onAddFirstCert }) => {
  const [certName, setCertName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = certName.trim();
    if (!trimmed) return;
    onAddFirstCert(trimmed);
    setCertName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-lg m-4 ring-1 ring-slate-200 dark:ring-gray-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Welcome!
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 mb-6">
          Let&apos;s get started by adding your first certification to track.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="certName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Certification Name
            </label>
            <input
              type="text"
              id="certName"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              placeholder="e.g., CompTIA A+"
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            Start Tracking
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;