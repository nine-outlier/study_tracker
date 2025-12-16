import React from 'react';

const ChartGradientDefs = () => (
  <defs>
    {/* Animated Red Gradient for Lines */}
    <linearGradient id="redActiveGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#ef4444">
        <animate attributeName="stopColor" values="#ef4444;#7f1d1d;#ef4444" dur="3s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stopColor="#7f1d1d">
        <animate attributeName="stopColor" values="#7f1d1d;#ef4444;#7f1d1d" dur="3s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stopColor="#ef4444">
        <animate attributeName="stopColor" values="#ef4444;#7f1d1d;#ef4444" dur="3s" repeatCount="indefinite" />
      </stop>
    </linearGradient>
  </defs>
);

export default ChartGradientDefs;