// FILE: src/components/DataForms/StudySessionForm.jsx
import React, { useState } from 'react';
import { generateId } from '../../utils/helpers.js';

/**
 * StudySessionForm: Component to log study time.
 */
const StudySessionForm = ({ onAddStudySession, showToast }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTopic = topic.trim();

    if (!trimmedTopic || duration === '' || !date) {
      showToast("Please fill out all fields.", true);
      return;
    }

    const durationNum = parseInt(duration, 10);

    if (Number.isNaN(durationNum) || durationNum <= 0) {
      showToast("Duration must be a positive number.", true);
      return;
    }

    onAddStudySession({
      id: generateId('session'),
      topic: trimmedTopic,
      duration: durationNum,
      date,
      isDeleted: false,
    });

    setTopic('');
    setDuration('');
    showToast("Study Session Saved!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
        Add Study Session
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Topic Studied (e.g., VLANs)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
          required
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
          required
        />
      </div>

      <input
        type="number"
        placeholder="Duration (in minutes)"
        min="1"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100"
        required
      />

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
      >
        Save Session
      </button>
    </form>
  );
};

export default StudySessionForm;