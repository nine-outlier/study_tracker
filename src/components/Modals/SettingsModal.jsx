import React, { useEffect, useState } from 'react';

// Inline SVG components
const Icons = {
  X: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  Palette: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.39 2.3-1.03.43-.45.57-1.1.38-1.81-.22-.76-.08-1.55.38-2.12.46-.57 1.14-.84 1.94-.84 1.15 0 2.1-.8 2.4-1.84.34-1.14.05-2.5-.83-3.41C16.92 9.05 14.54 8 12 2z" />
    </svg>
  ),
  Monitor: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  ),
  Database: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  ),
  Eye: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Zap: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Rocket: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
      <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
    </svg>
  ),
  Accessibility: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="16" cy="4" r="1" />
      <path d="m18 19 1-7-6 1" />
      <path d="m5 8 3-3 5.5 3-2.36 3.5" />
      <path d="M4.24 14.5a5 5 0 0 0 6.88 6" />
      <path d="M13.76 17.5a5 5 0 0 0-6.88-6" />
    </svg>
  ),
  ShieldCheck: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Trash2: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  ),
  Layout: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  ChevronDown: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  AlertTriangle: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Maximize: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  ),
  Minimize: ({ size = 18, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  ),
};

// Only allow Light + Midnight Blue (users cannot see/select others)
const THEME_OPTIONS = [
  { id: 'light', name: 'Standard Light', color: '#f8fafc', desc: 'Crisp & Professional' },
  { id: 'midnight', name: 'Midnight Blue', color: '#020617', desc: 'Deep Focus Dark' },
];

const ToggleRow = ({ id, title, desc, icon, checked, onChange }) => (
  <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/60 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group">
    <div className="min-w-0 flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</div>
        {desc ? <div className="text-xs text-slate-500 dark:text-slate-400">{desc}</div> : null}
      </div>
    </div>

    <span className="relative inline-flex items-center">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={!!checked}
        onChange={(e) => onChange(id, e.target.checked)}
      />
      <span className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-indigo-600 transition-colors" />
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4 shadow-sm" />
    </span>
  </label>
);

const AccordionItem = ({ id, title, icon, activeId, onClick, children }) => {
  const isOpen = activeId === id;

  return (
    <div className={`overflow-hidden rounded-xl border transition-all duration-300 ${isOpen ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900'}`}>
      <button
        onClick={() => onClick(id)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`transition-colors ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {icon}
          </span>
          <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
            {title}
          </span>
        </div>
        <Icons.ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 pt-0 border-t border-dashed border-slate-100 dark:border-slate-800/50">
          <div className="pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ isVisible, onClose, onPromptPurge, onSystemWipe, appSettings, setAppSettings }) => {
  const [activeSection, setActiveSection] = useState('appearance');

  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const updateSetting = (key, value) => {
    setAppSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSectionClick = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const WIDTH_OPTIONS = [
    { value: 'max-w-5xl', label: 'Contained', desc: 'Focus Mode', icon: <Icons.Minimize size={18} /> },
    { value: 'max-w-7xl', label: 'Standard', desc: 'Balanced Layout', icon: <Icons.Monitor size={18} /> },
    { value: 'max-w-full', label: 'Full Width', desc: 'Expanded View', icon: <Icons.Maximize size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 z-10">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-white">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close settings"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50/50 dark:bg-black/20">

          {/* Section 1: Appearance */}
          <AccordionItem
            id="appearance"
            title="Interface & Theme"
            icon={<Icons.Palette size={18} />}
            activeId={activeSection}
            onClick={handleSectionClick}
          >
            <div className="space-y-3">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Select Theme</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const selected = appSettings.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => updateSetting('theme', theme.id)}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200
                        ${selected
                          ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                    >
                      <span
                        className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: theme.color }}
                      >
                        {selected && (
                          <Icons.ShieldCheck
                            size={14}
                            className={theme.id === 'midnight' ? 'text-white' : 'text-slate-900'}
                          />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${selected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                          {theme.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-500 truncate">
                          {theme.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </AccordionItem>

          {/* Section 2: Layout */}
          <AccordionItem
            id="layout"
            title="Page Layout"
            icon={<Icons.Layout size={18} />}
            activeId={activeSection}
            onClick={handleSectionClick}
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Content Width</div>

                <div className="grid grid-cols-1 gap-2">
                  {WIDTH_OPTIONS.map((option) => {
                    const selected = (appSettings.maxWidth || 'max-w-7xl') === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => updateSetting('maxWidth', option.value)}
                        className={`relative flex items-center gap-4 p-3 rounded-xl border text-left transition-all duration-200
                          ${selected
                            ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${selected ? 'bg-white dark:bg-indigo-900/40 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {option.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-semibold ${selected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                            {option.label}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-500">
                            {option.desc}
                          </div>
                        </div>

                        {selected && (
                          <div className="text-indigo-600 dark:text-indigo-400">
                            <Icons.ShieldCheck size={18} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 mt-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex gap-2 items-center text-xs text-slate-600 dark:text-slate-400">
                    <Icons.Monitor size={14} />
                    <span>Adjusts the maximum width of the application container.</span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>

          {/* Section 3: Accessibility */}
          <AccordionItem
            id="accessibility"
            title="Accessibility"
            icon={<Icons.Accessibility size={18} />}
            activeId={activeSection}
            onClick={handleSectionClick}
          >
            <div className="space-y-2">
              {[
                { id: 'colorblindMode', title: 'Colorblind safety', icon: <Icons.Eye size={16} />, desc: 'Higher contrast in charts.' },
                { id: 'useAccessibleFont', title: 'High-legibility font', icon: <span className="text-xs font-bold">Lex</span>, desc: 'Use Lexend for readability.' },
                { id: 'quickLoad', title: 'Quick load', icon: <Icons.Rocket size={16} />, desc: 'Skip boot animations.' },
                { id: 'reduceMotion', title: 'Reduce motion', icon: <Icons.Zap size={16} />, desc: 'Minimize transitions.' },
              ].map((item) => (
                <ToggleRow
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  desc={item.desc}
                  icon={item.icon}
                  checked={appSettings[item.id]}
                  onChange={(k, v) => updateSetting(k, v)}
                />
              ))}
            </div>
          </AccordionItem>

          {/* Section 4: Data Management */}
          <AccordionItem
            id="data"
            title="Data Management"
            icon={<Icons.Database size={18} />}
            activeId={activeSection}
            onClick={handleSectionClick}
          >
            <div className="space-y-4">
              {/* Purge Block */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-500 shadow-sm">
                    <Icons.Trash2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Purge deleted data
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                      Permanently removes all soft-deleted records. This action cannot be undone.
                    </div>
                    <button
                      onClick={onPromptPurge}
                      className="text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
                    >
                      Purge Soft-Deleted Items
                    </button>
                  </div>
                </div>
              </div>

              {/* Wipe Block (Danger Zone) */}
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shadow-sm">
                    <Icons.AlertTriangle size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-rose-700 dark:text-rose-400">
                      System Wipe
                    </div>
                    <div className="text-xs text-rose-600/80 dark:text-rose-400/70 mt-1 mb-3">
                      Factory reset. Deletes ALL settings, data, and users locally.
                    </div>
                    <button
                      onClick={onSystemWipe}
                      className="w-full text-xs font-bold px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Icons.Trash2 size={14} />
                      Delete Everything
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-end z-10">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;