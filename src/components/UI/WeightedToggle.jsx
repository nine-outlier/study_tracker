import React from 'react';

const WeightedToggle = ({ useWeightedAverages, setUseWeightedAverages }) => {
  const pillBase =
    'px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-colors';
  const pillOn = 'app-bg-primary app-text-on-primary shadow-sm';
  const pillOff = 'app-text-muted hover:app-text-main hover:app-bg-highlight';

  return (
    <div className="flex items-center space-x-2 p-1 rounded-lg">
      {/* RAW (left) */}
      <span
        className={`${pillBase} ${!useWeightedAverages ? pillOn : pillOff}`}
        onClick={() => setUseWeightedAverages(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setUseWeightedAverages(false)}
        aria-pressed={!useWeightedAverages}
      >
        Raw
      </span>

      <button
        type="button"
        onClick={() => setUseWeightedAverages(!useWeightedAverages)}
        className={`
          relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-offset-1
          ${useWeightedAverages ? 'app-bg-primary' : 'app-bg-highlight'}
        `}
        style={{ outlineColor: 'var(--app-primary-ring)' }}
        role="switch"
        aria-checked={useWeightedAverages}
      >
        <span className="sr-only">Toggle weighted averages</span>

        {/* RAW (OFF) = knob LEFT, WEIGHTED (ON) = knob RIGHT */}
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0
            transition duration-200 ease-in-out
            ${useWeightedAverages ? 'translate-x-4' : 'translate-x-0'}
          `}
          style={{ backgroundColor: 'var(--app-pure-white)' }}
        />
      </button>

      {/* WEIGHTED (right) */}
      <span
        className={`${pillBase} ${useWeightedAverages ? pillOn : pillOff}`}
        onClick={() => setUseWeightedAverages(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setUseWeightedAverages(true)}
        aria-pressed={useWeightedAverages}
      >
        Weighted
      </span>
    </div>
  );
};

export default WeightedToggle;