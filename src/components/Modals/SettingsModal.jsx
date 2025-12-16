import React, { useState, useEffect } from 'react';

// ... [GeneralSettingsForm, DataManagementForm components remain unchanged] ...

const GeneralSettingsForm = ({ appSettings, setAppSettings }) => {
  const handleSettingChange = (key, value) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
  };

  // ... [SettingToggle, SettingSelect components] ...

  const SettingToggle = ({ id, label, description, checked, onChange }) => (
    <div className="flex justify-between items-start">
      <div>
        <label htmlFor={id} className="text-md font-medium text-slate-800 dark:text-slate-100">{label}</label>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button 
        type="button" 
        role="switch" 
        aria-checked={checked} 
        onClick={onChange} 
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${checked ? 'bg-sky-600 dark:bg-sky-500' : 'bg-slate-200 dark:bg-gray-700'}`}
      >
        <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const SettingSelect = ({ id, label, value, onChange, children }) => (
    <div className="flex justify-between items-center">
      <label htmlFor={id} className="text-md font-medium text-slate-800 dark:text-slate-100">{label}</label>
      <select 
        id={id} 
        value={value} 
        onChange={onChange} 
        className="w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-slate-100 cursor-pointer"
      >
        {children}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Display & Accessibility</h3>
      <div className="space-y-6 p-4 bg-slate-50 rounded-lg border border-slate-200 dark:bg-gray-800 dark:border-gray-700">
        
        <SettingToggle
          id="quickLoad"
          label="Quick Load"
          description="Eliminate all non-essential elements for faster startup."
          checked={appSettings.quickLoad}
          onChange={() => handleSettingChange('quickLoad', !appSettings.quickLoad)}
        />
        
        <hr className="border-slate-200 dark:border-gray-700" />

        {/* UPDATED: Theme Selector restricted to Light and Midnight Blue */}
        <SettingSelect 
          id="theme" 
          label="App Theme" 
          value={appSettings.theme || 'light'} 
          onChange={(e) => handleSettingChange('theme', e.target.value)}
        >
          <option value="light">Light</option>
          <option value="midnight">Midnight Blue</option>
        </SettingSelect>

        {/* ... [Rest of settings toggles unchanged] ... */}
        <hr className="border-slate-200 dark:border-gray-700" />
        <SettingToggle id="accessibleFont" label="Accessible Font" description="Uses Lexend, a font with wider spacing for readability." checked={appSettings.useAccessibleFont} onChange={() => handleSettingChange('useAccessibleFont', !appSettings.useAccessibleFont)} />
        <hr className="border-slate-200 dark:border-gray-700" />
        <SettingToggle id="colorblindMode" label="Colorblind Safe Colors" description="Use chart colors that are easier to distinguish." checked={appSettings.colorblindMode} onChange={() => handleSettingChange('colorblindMode', !appSettings.colorblindMode)} />
        <hr className="border-slate-200 dark:border-gray-700" />
        <SettingToggle id="reduceMotion" label="Reduce Motion" description="Disable animations and transitions." checked={appSettings.reduceMotion} onChange={() => handleSettingChange('reduceMotion', !appSettings.reduceMotion)} />
        <hr className="border-slate-200 dark:border-gray-700" />
        <SettingSelect id="maxWidth" label="Page Width" value={appSettings.maxWidth} onChange={(e) => handleSettingChange('maxWidth', e.target.value)}>
          <option value="max-w-5xl">Contained</option>
          <option value="max-w-7xl">Standard</option>
          <option value="max-w-full">Full Width</option>
        </SettingSelect>

      </div>
    </div>
  );
};

// ... [DataManagementForm, SettingsModal same as before] ...
const DataManagementForm = ({ onPromptPurge }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Data Management</h3>
      <div className="p-4 bg-red-50 border-red-200 border rounded-lg dark:bg-red-900/30 dark:border-red-500/50">
        <h4 className="text-md font-medium text-red-800 dark:text-red-300">Permanent Deletion</h4>
        <p className="text-sm text-red-700 dark:text-red-400 mt-2">This action will permanently delete all tests, sessions, and domains that you have previously "soft deleted". This cannot be undone.</p>
        <button type="button" onClick={onPromptPurge} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Purge All Deleted Data</button>
      </div>
    </div>
  );
};

const SettingsModal = ({ isVisible, onClose, onPromptPurge, appSettings, setAppSettings }) => {
  const [formType, setFormType] = useState('general');
  const [show, setShow] = useState(false);

  useEffect(() => { if (isVisible) setShow(true); }, [isVisible]);
  const handleClose = () => { setShow(false); setTimeout(onClose, 300); };
  
  if (!isVisible) return null;

  return (
    <div className={`modal-backdrop fixed inset-0 z-40 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
      <div className={`modal-content bg-white p-6 rounded-xl ring-1 ring-slate-200 shadow-lg w-full max-w-2xl m-4 dark:bg-gray-900 dark:ring-gray-800 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-6 dark:bg-gray-950">
          <button onClick={() => setFormType('general')} className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${formType === 'general' ? 'font-semibold bg-white text-slate-900 dark:bg-gray-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-gray-800'}`}>General</button>
          <button onClick={() => setFormType('data')} className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${formType === 'data' ? 'font-semibold bg-white text-slate-900 dark:bg-gray-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-gray-800'}`}>Data Management</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {formType === 'general' && <GeneralSettingsForm appSettings={appSettings} setAppSettings={setAppSettings} />}
          {formType === 'data' && <DataManagementForm onPromptPurge={onPromptPurge} />}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;