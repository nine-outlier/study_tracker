import React from 'react';

const WeightedToggle = ({ useWeightedAverages, setUseWeightedAverages }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="checkbox"
      checked={useWeightedAverages}
      onChange={(e) => setUseWeightedAverages(e.target.checked)}
      className="form-checkbox h-4 w-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
    />
    <span className="text-sm text-slate-700 dark:text-slate-300">Use Weighted Averages</span>
  </label>
);

export default WeightedToggle;