import React from 'react';
import { SettingsIcon } from './Icons.jsx';

const SettingsFab = ({ onOpenSettings }) => {
  return (
    <button
      onClick={onOpenSettings}
      className="fixed bottom-8 left-8 w-14 h-14 bg-slate-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700 z-50 transition-transform duration-200 hover:scale-105 active:scale-95"
      title="Settings"
    >
      <SettingsIcon />
    </button>
  );
};

export default SettingsFab;