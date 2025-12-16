import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const Sparkle = ({ x, y, delay, scale, color }) => (
  <div
    className="absolute pointer-events-none animate-sparkle"
    style={{
      left: x,
      top: y,
      transform: `scale(${scale})`,
      animationDelay: `${delay}ms`,
      zIndex: 9999, 
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill={color} />
    </svg>
  </div>
);

const ThemeEffects = ({ theme }) => {
  const [sparkles, setSparkles] = useState([]);
  const requestRef = useRef();
  const lastSpawnTime = useRef(0);

  useEffect(() => {
    // Clear if not Red or Gold
    if (theme !== 'red' && theme !== 'gold') {
      setSparkles([]);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const spawnSparkle = () => {
      const now = Date.now();
      if (now - lastSpawnTime.current > Math.random() * 300 + 200) {
        lastSpawnTime.current = now;

        const targets = document.querySelectorAll('.bg-white'); 
        let targetX, targetY;

        if (targets.length > 0 && Math.random() > 0.4) { 
          const target = targets[Math.floor(Math.random() * targets.length)];
          const rect = target.getBoundingClientRect();
          targetX = rect.left + Math.random() * rect.width;
          targetY = rect.top + Math.random() * rect.height;
          targetX += (Math.random() - 0.5) * 50;
          targetY += (Math.random() - 0.5) * 50;
        } else {
          targetX = (window.innerWidth * 0.1) + Math.random() * (window.innerWidth * 0.8);
          targetY = (window.innerHeight * 0.1) + Math.random() * (window.innerHeight * 0.8);
        }

        const newSparkle = {
          id: now,
          x: targetX,
          y: targetY,
          scale: 0.6 + Math.random() * 0.8,
          delay: 0,
          // Dynamic color based on theme
          color: theme === 'gold' ? '#f59e0b' : '#ef4444'
        };

        setSparkles(prev => [...prev.slice(-12), newSparkle]);
      }
      requestRef.current = requestAnimationFrame(spawnSparkle);
    };

    requestRef.current = requestAnimationFrame(spawnSparkle);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [theme]);

  if (theme !== 'red' && theme !== 'gold') return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      {sparkles.map(s => (
        <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} scale={s.scale} color={s.color} />
      ))}
      <style>{`
        @keyframes sparkle-fade {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(45deg); }
            100% { opacity: 0; transform: scale(0) rotate(90deg); }
        }
        .animate-sparkle {
            animation: sparkle-fade 1.5s ease-in-out forwards;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ThemeEffects;