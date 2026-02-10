import React, { useState, useEffect } from 'react';
import { PREMADE_DATA } from '../../config/appConfig'; 

/**
 * AddCertModal -> CertificationManager
 * A unified modal for Creating, Enabling Premade, and Managing visibility of certifications.
 * Updated: Added Star icon to premade content squircle.
 */
const AddCertModal = ({ 
  isVisible, 
  onClose, 
  onAddCert, 
  onToggleCert,
  onDeleteCert, // Added missing prop here
  examData = {} 
}) => {
  const [certName, setCertName] = useState('');
  const [show, setShow] = useState(false);

  // Calculate how many certifications are currently visible
  const visibleCertCount = Object.values(examData).filter(c => !c.isHidden).length;

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setCertName('');
    } else {
      setShow(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const trimmed = certName.trim();
    if (!trimmed) return;
    
    onAddCert(trimmed);
    setCertName(''); // Clear input after add
  };

  const isCertActive = (key) => examData[key] && !examData[key].isHidden;

  // Separation of concerns: Identify Premade vs Custom keys
  const premadeKeys = Object.keys(PREMADE_DATA);
  const customKeys = Object.keys(examData).filter(key => !premadeKeys.includes(key));

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`app-bg-surface p-6 rounded-2xl border app-border shadow-2xl w-full max-w-lg m-4 transform transition-all duration-200 max-h-[85vh] flex flex-col ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-xl font-bold app-text-main">
            Manage Certifications
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 rounded-lg app-text-muted hover:app-bg-highlight transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm app-text-muted mb-6">
          Add new study tracks or toggle visibility.
        </p>

        {/* --- CREATE SECTION (Sticky Top) --- */}
        <form onSubmit={handleCreateSubmit} className="mb-6 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              placeholder="Create custom (e.g., AWS SAA)"
              className="flex-1 px-4 py-2.5 app-bg-page border app-border rounded-xl focus:ring-2 focus:ring-[var(--app-primary-ring)] focus:border-transparent outline-none transition-all app-text-main placeholder-[var(--app-text-muted)] text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={!certName.trim()}
              className="px-4 py-2.5 app-bg-primary hover:opacity-90 app-text-on-primary font-medium rounded-xl shadow-lg shadow-[var(--app-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              Add
            </button>
          </div>
        </form>

        {/* --- SCROLLABLE LIST AREA --- */}
        <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2 space-y-6">
          
          {/* LIBRARY SECTION */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider app-text-subtle mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Library
            </div>
            <div className="space-y-3">
              {Object.values(PREMADE_DATA).map((cert) => {
                const isActive = isCertActive(cert.id);
                // Cannot disable if it's the last one standing
                const isLastActive = isActive && visibleCertCount <= 1;

                return (
                  <div key={cert.id} className="flex items-center justify-between p-3 rounded-xl border app-border app-bg-page/50 hover:app-bg-page transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Squircle with Star */}
                      <div className="relative w-9 h-9 rounded-lg bg-[var(--app-primary-light)] flex items-center justify-center text-[var(--app-primary)]">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        
                        {/* Star Badge (Top Right) */}
                        <svg 
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[var(--app-primary)] fill-current stroke-[var(--app-bg-surface)] stroke-2" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>

                      <div>
                        <div className="text-sm font-semibold app-text-main">{cert.short}</div>
                        <div className="text-[10px] app-text-muted">
                          {cert.domains.length} Domains
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => !isLastActive && onToggleCert(cert.id, cert.domains)}
                      disabled={isLastActive}
                      className={`
                        relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
                        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-offset-1
                        ${isActive ? 'app-bg-primary' : 'app-bg-highlight'}
                        ${isLastActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      style={{ outlineColor: 'var(--app-primary-ring)' }}
                    >
                      <span
                        aria-hidden="true"
                        className={`
                          pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0
                          transition duration-200 ease-in-out
                          ${isActive ? 'translate-x-4' : 'translate-x-0'}
                        `}
                        style={{ backgroundColor: 'var(--app-pure-white)' }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CUSTOM SECTION */}
          {customKeys.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider app-text-subtle mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                My Certifications
              </div>
              <div className="space-y-2">
                {customKeys.map((key) => {
                  const data = examData[key];
                  const isActive = !data.isHidden;
                  const isLastActive = isActive && visibleCertCount <= 1;

                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:app-bg-highlight transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--app-success-light)] flex items-center justify-center text-[var(--app-success)]">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className={`text-sm font-medium ${isActive ? 'app-text-main' : 'app-text-muted line-through'}`}>
                          {data.shortName || data.fullName || key}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteCert) onDeleteCert(key);
                          }}
                          className="p-1.5 app-text-muted hover:text-[var(--app-danger)] hover:bg-[var(--app-danger-light)]/20 rounded-lg transition-colors"
                          title="Delete Certification"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => !isLastActive && onToggleCert(key)}
                          disabled={isLastActive}
                          className={`
                            relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-offset-1
                            ${isActive ? 'app-bg-primary' : 'app-bg-highlight'}
                            ${isLastActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          style={{ outlineColor: 'var(--app-primary-ring)' }}
                        >
                          <span
                            aria-hidden="true"
                            className={`
                              pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0
                              transition duration-200 ease-in-out
                              ${isActive ? 'translate-x-4' : 'translate-x-0'}
                            `}
                            style={{ backgroundColor: 'var(--app-pure-white)' }}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCertModal;