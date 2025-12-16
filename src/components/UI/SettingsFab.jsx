import React, { useRef, useState, useEffect } from 'react';
import { SettingsIcon } from './Icons.jsx';

const SettingsFab = ({ onOpenSettings, onEnterArcade, onHoldProgress }) => {
  const requestRef = useRef(null);
  const startTimeRef = useRef(null);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const animateHold = () => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    const duration = 3000;

    const progress = Math.min(elapsed / duration, 1);

    if (onHoldProgress) {
      onHoldProgress(progress);
    }

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animateHold);
    } else {
      setIsHolding(false);
      if (navigator.vibrate) navigator.vibrate(200); 
      onEnterArcade();
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault(); 
    setIsHolding(true);
    startTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(animateHold);
  };

  const handleMouseUp = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }

    const elapsed = Date.now() - startTimeRef.current;
    
    if (isHolding && elapsed < 3000) {
      onOpenSettings();
      if (onHoldProgress) onHoldProgress(0);
    }
    
    setIsHolding(false);
  };

  const handleMouseLeave = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (isHolding) {
      if (onHoldProgress) onHoldProgress(0);
    }
    setIsHolding(false);
  };

  const holdClass = isHolding ? 'scale-110 ring-4 ring-indigo-500/50 transition-transform duration-200' : 'scale-100 transition-transform duration-200';

  // UPDATED: z-[10000] to be above sparkles
  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={`fixed bottom-8 left-8 w-14 h-14 bg-slate-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700 z-[10000] ${holdClass}`}
      title="Settings (Hold for Secrets)"
    >
      <SettingsIcon />
    </button>
  );
};

export default SettingsFab;