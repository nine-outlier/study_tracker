import React, { useEffect, useState, useRef } from 'react';

const RollingSlotNumber = ({ value }) => {
  // Internal display state (what the user sees)
  const [displayValue, setDisplayValue] = useState(value);
  
  // Refs to track values inside the animation frame without closure staleness
  const targetRef = useRef(value);
  const displayRef = useRef(value);

  useEffect(() => {
    targetRef.current = value;
    let animationFrameId;

    const animate = () => {
      const current = displayRef.current;
      const target = targetRef.current;
      
      const diff = target - current;

      // Stop animation if we are close enough (avoids infinite jitter)
      if (diff === 0) return;

      // --- THE SLOT MACHINE MATH ---
      // 1. We move 15% of the remaining distance per frame.
      //    This creates a "Zeno's Paradox" curve: Fast start, slow end.
      let step = diff * 0.15;

      // 2. Minimum Speed Clamp
      //    Ensure we always move at least 1 unit so we actually finish.
      //    (Handles both counting UP and counting DOWN)
      if (Math.abs(step) < 1) {
        step = Math.sign(diff); // Returns 1 or -1
      } else {
        step = Math.round(step);
      }

      // Apply the step
      const nextValue = current + step;
      
      displayRef.current = nextValue;
      setDisplayValue(nextValue);

      // Keep looping until we hit the target
      if (nextValue !== target) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    // Kick off the animation
    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  // Render with locale string (e.g., "1,000,000" instead of "1000000")
  return (
    <span className="tabular-nums">
      {displayValue.toLocaleString()}
    </span>
  );
};

export default RollingSlotNumber;