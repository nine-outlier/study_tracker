import React, { useState, useEffect, useRef } from 'react';

const ColorHerdGame = ({ onComplete = () => {}, difficulty }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  // --- Game Logic Refs (Mutable state for Canvas Loop) ---
  const particlesRef = useRef([]);
  const playerVisRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight * 0.7 });
  
  // --- React State (UI) ---
  const [round, setRound] = useState(1);
  const [playerPosition, setPlayerPosition] = useState('middle'); // left, middle, right
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // --- State Refs (The Fix) ---
  // We sync these refs with state so the animation loop can read them 
  // without needing to be in the useEffect dependency array.
  const playerPositionRef = useRef(playerPosition);
  const isLockedRef = useRef(false);

  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]); // Assuming isLocked state exists below

  // We use refs for colors to access them inside the animation loop without dependencies
  const colorsRef = useRef({ player: null, left: null, right: null });
  const bgColorRef = useRef({ bg: 'rgba(15, 23, 42, 0.4)', trail: 'rgba(15, 23, 42, 0.4)' });
  
  const [timer, setTimer] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState('');
  
  const speedFactor = 1;
  const baseColors = ['#38bdf8', '#818cf8', '#c084fc', '#22d3ee', '#34d399', '#fbbf24', '#f472b6'];
  const allColors = [
    '#38bdf8', '#818cf8', '#c084fc', '#22d3ee', '#34d399', '#fbbf24', '#f472b6',
    '#67e8f9', '#a78bfa', '#34d399', '#facc15', '#ef4444', '#ec4899', '#8b5cf6',
    '#06b6d4', '#10b981', '#f59e0b', '#14b8a6', '#6366f1', '#a855f7', '#f43f5e'
  ];

  // --- Detect Theme ---
  useEffect(() => {
    const detectTheme = () => {
      const root = window.document.documentElement;
      const isDark = root.classList.contains('dark');
      setIsDarkMode(isDark);
      
      // Update background colors based on theme
      if (isDark) {
        bgColorRef.current = {
          bg: 'rgba(15, 23, 42, 1)', // Dark slate
          trail: 'rgba(15, 23, 42, 0.4)'
        };
      } else {
        bgColorRef.current = {
          bg: 'rgba(241, 245, 249, 1)', // Light slate
          trail: 'rgba(241, 245, 249, 0.4)'
        };
      }
    };
    
    detectTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(window.document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // --- Setup & Logic ---
  const generateSimilarColors = () => {
    const color1Index = Math.floor(Math.random() * allColors.length);
    let color2Index = Math.floor(Math.random() * allColors.length);
    while (color2Index === color1Index) {
      color2Index = Math.floor(Math.random() * allColors.length);
    }
    return [allColors[color1Index], allColors[color2Index]];
  };

  const initRound = (roundNum) => {
    const [color1, color2] = generateSimilarColors();
    const playerCol = Math.random() > 0.5 ? color1 : color2;
    const leftCol = Math.random() > 0.5 ? color1 : color2;
    
    colorsRef.current = {
      player: playerCol,
      left: leftCol,
      right: leftCol === color1 ? color2 : color1
    };

    // Initialize Particles for this round
    if (canvasRef.current) { 
       initParticles(canvasRef.current.width, canvasRef.current.height);
    }

    setRound(roundNum);
    setTimer(5);
    setPlayerPosition('middle');
    setIsLocked(false);
    setMessage('');
  };

  useEffect(() => {
    initRound(1);
  }, []);

  const movePlayer = (direction) => {
    if (isLocked) return;
    setPlayerPosition(direction);
  };

  const lockInChoice = () => {
    if (isLocked || playerPosition === 'middle') return;
    setIsLocked(true);
    
    const correctSide = (colorsRef.current.left === colorsRef.current.player) ? 'left' : 'right';
    
    if (playerPosition === correctSide) {
      setMessage('MATCH!');
      setTimeout(() => {
        if (round < 3) {
          initRound(round + 1);
        } else {
          onComplete(true, 30); // Win
        }
      }, 200);
    } else {
      setMessage('WRONG!');
      setTimeout(() => onComplete(false), 1000); // Lose
    }
  };

  // Timer
  useEffect(() => {
    if (isLocked) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0.1) {
          clearInterval(interval);
          onComplete(false); // Timeout
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isLocked]);

  // Keyboard Controls
  useEffect(() => {
      const handleKeyDown = (e) => {
          if (e.key === 'ArrowLeft' || e.key === 'a') movePlayer('left');
          if (e.key === 'ArrowRight' || e.key === 'd') movePlayer('right');
          if (e.key === 'ArrowDown' || e.key === 's') movePlayer('middle');
          if (e.key === ' ' || e.key === 'Enter') lockInChoice();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, playerPosition]);

  // --- PARTICLE SYSTEM HELPERS ---
  const createParticle = (w, h, overrideY = null, xRange = null, forceColor = null) => {
      const z = Math.pow(Math.random(), 0.7);
      let type = 'normal';
      let color = forceColor || baseColors[Math.floor(Math.random() * baseColors.length)];
      
      const baseSpeedY = (1 - z) * 14 + 1.5;
      const baseSwirlSpeed = (Math.random() * 0.05) + 0.02;
      const baseRotationSpeed = (Math.random() * 0.1) - 0.05;

      let xPos;
      if (xRange) {
        xPos = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
      } else {
        xPos = Math.random() * w;
      }

      return {
        x: xPos,
        initialX: xPos,
        y: overrideY !== null ? overrideY : Math.random() * h,
        z: z,
        type: type,
        radius: (1 - z) * 3.5 + 0.5,
        speed: baseSpeedY * speedFactor,
        baseOpacity: (1 - z) * 0.85 + 0.45,
        opacity: (1 - z) * 0.85 + 0.45,
        opacityPhase: Math.random() * Math.PI * 2,
        opacitySpeed: 0.02 + Math.random() * 0.03,
        color: color,
        vx: 0,
        vy: 0,
        glintPhase: Math.random() * Math.PI,
        swirlOffset: Math.random() * Math.PI * 2,
        swirlSpeed: baseSwirlSpeed * speedFactor,
        swirlAmp: (Math.random() * 30) + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: baseRotationSpeed * speedFactor,
        groupColor: forceColor,
        xRange: xRange // Store range for respawning
      };
  };

  const initParticles = (w, h) => {
    const p = [];
    // Left Group
    for (let i = 0; i < 100; i++) {
      p.push(createParticle(w, h, null, [w * 0.05, w * 0.35], colorsRef.current.left));
    }
    // Right Group
    for (let i = 0; i < 100; i++) {
      p.push(createParticle(w, h, null, [w * 0.65, w * 0.95], colorsRef.current.right));
    }
    particlesRef.current = p;
  };

  // --- ANIMATION LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-init particles on resize to fit new bounds
      initParticles(canvas.width, canvas.height);
    };
    
    const handleMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize(); // Initial sizing

    const animate = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      
      // 1. Clear with dynamic background
      ctx.fillStyle = bgColorRef.current.trail;
      ctx.fillRect(0, 0, w, h);

      // 2. Particles
      particlesRef.current.forEach(p => {
        // Physics (Attraction to mouse - kept low for this game so it doesn't break herds)
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        
        // Very weak attraction just for "life"
        const attractionStrength = 0.00001 * (1 - p.z); 
        p.vx += dx * attractionStrength;
        p.vy += dy * attractionStrength;
        
        p.vx *= 0.96;
        p.vy *= 0.96;
        
        // Move UP
        p.y -= p.speed + p.vy; 
        p.x += p.vx;

        // Opacity Pulse
        p.opacityPhase += p.opacitySpeed;
        const opacityVariation = Math.sin(p.opacityPhase) * 0.3;
        p.opacity = p.baseOpacity + opacityVariation;

        // Respawn Loop
        if (p.y < -20) { 
           // Respawn at bottom, keeping x-range constraints
           Object.assign(p, createParticle(w, h, h + 20, p.xRange, p.groupColor));
           p.x = p.initialX; // Reset X to avoid drifting herds merging
        }

        // Draw
        ctx.beginPath();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        const stretchFactor = 1 + (p.speed * 0.05); 
        // Draw as ellipse stretching with speed
        ctx.ellipse(p.x, p.y, p.radius, p.radius * stretchFactor, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 3. Player Character
      // Logic: Calculate target X based on STATE REF (This fixes the bug)
      let targetX = w * 0.5; // Middle
      if (playerPositionRef.current === 'left') targetX = w * 0.2;
      if (playerPositionRef.current === 'right') targetX = w * 0.8;

      // Smooth Movement (Lerp)
      // Move visual position 15% closer to target position every frame
      playerVisRef.current.x += (targetX - playerVisRef.current.x) * 0.15;
      
      // Bobbing Motion
      const bob = Math.sin(frame * 0.05) * 10;
      const playerY = (h * 0.75) + bob;
      const pColor = colorsRef.current.player || '#ffffff';

      ctx.save();
      ctx.translate(playerVisRef.current.x, playerY);
      
      // Glow / Lock Visuals
      // Use REF instead of state here to avoid dependency
      if (isLockedRef.current) { 
         ctx.shadowBlur = 40;
         ctx.shadowColor = 'white';
         ctx.fillStyle = '#ffffff';
         ctx.globalAlpha = 0.8 + (Math.sin(frame * 0.2) * 0.2); // Flash
      } else { 
         ctx.shadowBlur = 20;
         ctx.shadowColor = pColor;
         ctx.fillStyle = pColor;
      }

      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Ring around player
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 32 + (Math.sin(frame * 0.1) * 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []); // FIX: Empty dependency array prevents re-initialization on state change

  // --- HTML OVERLAY FOR UI ---
  return (
    <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: bgColorRef.current.bg }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <div className="relative z-10 h-full flex flex-col justify-between p-8 pointer-events-none">
         
         {/* Header */}
         <div className="text-center">
            <div className={`text-2xl font-black drop-shadow-lg tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               ROUND {round}/3
            </div>
         </div>

         {/* Center Status Message */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
             {message && <h1 className={`text-7xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{message}</h1>}
         </div>

         {/* Footer Controls */}
         <div className="text-center pb-8">
            <div className={`text-7xl font-mono font-bold mb-4 ${isDarkMode ? 'text-white/30' : 'text-slate-900/30'}`}>
               {timer.toFixed(1)}
            </div>
            <div className={`flex justify-center gap-8 text-xs font-bold tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>[←] LEFT</span>
                <span>[↓] MIDDLE</span>
                <span>[→] RIGHT</span>
                <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>[SPACE] LOCK</span>
            </div>
         </div>

      </div>
    </div>
  );
};

export default ColorHerdGame;