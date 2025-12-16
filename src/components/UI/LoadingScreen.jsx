import React, { useEffect, useRef } from 'react';

// ==========================================
// OPTION 1: CANVAS LOADER (Particle Rain)
// ==========================================
const CanvasLoader = ({ message = "Loading...", reduceMotion = false, isDarkMode }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  // Slow down if reduceMotion is active
  const speedFactor = reduceMotion ? 0.1 : 1;
  
  const modeRef = useRef(null);
  if (!modeRef.current) {
    const rng = Math.random();
    if (rng < 0.016) modeRef.current = 'RED_STORM';
    else if (rng < 0.0033) modeRef.current = 'GOLD_RUSH';
    else modeRef.current = 'STANDARD';
  }

  // Slightly fewer particles if slowing down to keep it clean
  const particleCount = reduceMotion ? 350 : 450;
  
  const baseColors = [
    '#38bdf8', '#818cf8', '#c084fc', '#22d3ee', '#34d399', '#fbbf24', '#f472b6',
  ];

  const brightColors = [
    '#67e8f9', '#a78bfa', '#f472b6', '#34d399', '#facc15',
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let frame = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const createParticle = (overrideY = null) => {
      const z = Math.pow(Math.random(), 0.7); 
      let type, color;
      
      if (modeRef.current === 'GOLD_RUSH') {
        type = 'gold';
        color = '#fbbf24'; 
      } 
      else if (modeRef.current === 'RED_STORM') {
        type = 'red';
        color = '#ef4444'; 
      } 
      else {
        const rng = Math.random();
        if (rng < 0.005) {  
          type = 'bright';
          color = brightColors[Math.floor(Math.random() * brightColors.length)];
        } else {
          type = 'normal';
          color = baseColors[Math.floor(Math.random() * baseColors.length)];
        }
      }

      // Calculate base speeds
      const baseSpeedY = (1 - z) * 14 + 1.5;
      const baseSwirlSpeed = (Math.random() * 0.05) + 0.02;
      const baseRotationSpeed = (Math.random() * 0.1) - 0.05;

      return {
        x: Math.random() * canvas.width,
        initialX: Math.random() * canvas.width, 
        y: overrideY !== null ? overrideY : Math.random() * canvas.height,
        z: z,
        type: type,
        radius: (1 - z) * 3.5 + 0.5,  
        speed: baseSpeedY * speedFactor,  
        baseOpacity: (1 - z) * 0.7 + 0.3,
        opacity: (1 - z) * 0.7 + 0.3,
        color: color,
        vx: 0,
        vy: 0,
        glintPhase: Math.random() * Math.PI,
        swirlOffset: Math.random() * Math.PI * 2,
        swirlSpeed: baseSwirlSpeed * speedFactor,
        swirlAmp: (Math.random() * 30) + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: baseRotationSpeed * speedFactor
      };
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const animate = () => {
      frame++;
      
      // FIX: Use prop instead of querying DOM
      const isDark = isDarkMode;
      
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.85)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        // --- Physics Engine ---
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const repulsionRadius = 60; 
        
        if (distance < repulsionRadius && distance > 0) {
          const repulsionStrength = (repulsionRadius - distance) / repulsionRadius * 0.3;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * repulsionStrength * 1.5;
          p.vy -= Math.sin(angle) * repulsionStrength * 1.5;
        } else {
          const attractionStrength = 0.00006 * (1 - p.z) * speedFactor;
          const forceX = dx * attractionStrength;
          const forceY = dy * attractionStrength;
          
          p.vx += forceX;
          p.vy += forceY;
        }
        
        p.vx *= 0.96;
        p.vy *= 0.96;
        
        p.y += p.speed + p.vy;
        p.x += p.vx;

        if (p.type === 'red') {
          const swirl = Math.sin((p.y * 0.02) + p.swirlOffset) * p.swirlAmp * (1 - p.z);
          p.x += swirl * 0.1;  
        }

        if (p.type === 'bright') {
          p.rotation += p.rotationSpeed;
        }

        if (p.y > canvas.height + 20) {
          Object.assign(p, createParticle(-20));
          p.x = Math.random() * canvas.width;
          p.initialX = p.x;
        }

        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        
        // --- Render ---
        ctx.beginPath();
        
        if (p.type === 'gold') {
          const flicker = Math.random() > 0.8 ? 1.0 : 0.6;
          ctx.globalAlpha = p.baseOpacity * flicker;
          ctx.shadowBlur = (1 - p.z) * 15;
          ctx.shadowColor = '#FBBF24';
          ctx.fillStyle = isDark ? '#FDE68A' : '#D97706'; 
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          if (p.z < 0.6) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((frame * 0.05 * speedFactor) + p.glintPhase);
            ctx.beginPath();
            ctx.strokeStyle = isDark ? '#FFFFFF' : '#000000'; 
            ctx.lineWidth = 0.5;
            const glintSize = p.radius * 2.5;
            ctx.moveTo(-glintSize, 0);
            ctx.lineTo(glintSize, 0);
            ctx.moveTo(0, -glintSize);
            ctx.lineTo(0, glintSize);
            ctx.stroke();
            ctx.restore();
          }

        } else if (p.type === 'red') {
          ctx.globalAlpha = p.baseOpacity;
          ctx.shadowBlur = (1 - p.z) * 20;
          ctx.shadowColor = '#EF4444';
          ctx.fillStyle = '#EF4444';
          ctx.ellipse(p.x, p.y, p.radius, p.radius * 1.2, 0, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.type === 'bright') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 15;  
          ctx.shadowColor = p.color;
          ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
          
          const size = p.radius * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size, 0);
          ctx.closePath();
          ctx.fill();
          
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          ctx.restore();

        } else {
          ctx.shadowBlur = 0;
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          const stretchFactor = 1 + (p.speed * 0.10); 
          ctx.ellipse(p.x, p.y, p.radius, p.radius * stretchFactor, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [reduceMotion, isDarkMode]); // Added isDarkMode dependency

  const containerBg = isDarkMode ? 'bg-slate-950' : 'bg-slate-50';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${containerBg}`}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      <div className="relative z-10 text-center px-4 pointer-events-none">
        <h2 className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text mb-6 tracking-tight pb-2 ${
          modeRef.current === 'GOLD_RUSH' ? 'bg-gradient-to-r from-amber-300 to-yellow-500' :
          modeRef.current === 'RED_STORM' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
          (isDarkMode ? 'bg-gradient-to-r from-sky-400 to-indigo-400' : 'bg-gradient-to-r from-slate-800 to-slate-600')
        } animate-pulse`}>
          Study Tracker
        </h2>
        
        <p className={`text-lg font-light tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// OPTION 2: DOT LOADER (Floating Dots)
// ==========================================
const DotLoader = ({ message = "Loading...", reduceMotion = false, isDarkMode }) => {
  const mouse = useRef({ x: 0, y: 0 });
  const dotEls = useRef([]);
  
  const speedFactor = reduceMotion ? 0.1 : 1;
  const durationMultiplier = 1 / speedFactor; 
  
  const dotPositions = useRef([
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }
  ]);

  const modeRef = useRef(null);
  if (!modeRef.current) {
    const rng = Math.random();
    if (rng < 0.016) modeRef.current = 'DISCO';  // 1.6% chance
    else modeRef.current = 'STANDARD';
  }

  const standardConfig = [
    { color: 'bg-blue-500', size: 'w-6 h-6', animation: 'dot-blue', speed: 0.15 },  
    { color: 'bg-red-500', size: 'w-8 h-8', animation: 'dot-red', speed: 0.08 },  
    { color: 'bg-yellow-500', size: 'w-5 h-5', animation: 'dot-yellow', speed: 0.20 }, 
    { color: 'bg-green-500', size: 'w-6 h-6', animation: 'dot-green', speed: 0.12 },  
    { color: 'bg-purple-500', size: 'w-10 h-10', animation: 'dot-purple', speed: 0.05 }
  ];

  const discoConfig = [
    { color: 'bg-red-500', size: 'w-8 h-8', animation: 'dot-disco-1', speed: 0.15, orbitRadius: 120, orbitSpeed: 3 },  
    { color: 'bg-red-600', size: 'w-10 h-10', animation: 'dot-disco-2', speed: 0.08, orbitRadius: 140, orbitSpeed: 4 },  
    { color: 'bg-red-400', size: 'w-7 h-7', animation: 'dot-disco-3', speed: 0.20, orbitRadius: 100, orbitSpeed: 2.5 }, 
    { color: 'bg-red-700', size: 'w-9 h-9', animation: 'dot-disco-4', speed: 0.12, orbitRadius: 160, orbitSpeed: 5 },  
    { color: 'bg-red-500', size: 'w-12 h-12', animation: 'dot-disco-5', speed: 0.05, orbitRadius: 180, orbitSpeed: 6 }
  ];

  const dotConfig = modeRef.current === 'DISCO' ? discoConfig : standardConfig;

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouse.current = { 
        x: event.clientX - window.innerWidth / 2, 
        y: event.clientY - window.innerHeight / 2 
      };
    };

    let animationFrameId;

    const animate = () => {
      dotPositions.current.forEach((pos, index) => {
        const config = dotConfig[index];
        const el = dotEls.current[index];

        if (el) {
          const dx = mouse.current.x - pos.x;
          const dy = mouse.current.y - pos.y;

          pos.x += dx * config.speed * speedFactor;
          pos.y += dy * config.speed * speedFactor;

          el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reduceMotion]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden cursor-none ${isDarkMode ? 'bg-gray-950' : 'bg-slate-50'}`}>
      
      <style>{`
        @keyframes float-blue { 0% { transform: translate(0px, -60px) scale(1); } 33% { transform: translate(50px, 30px) scale(1.2); } 66% { transform: translate(-50px, 30px) scale(0.9); } 100% { transform: translate(0px, -60px) scale(1); } }
        @keyframes float-red { 0% { transform: translate(80px, 0px) scale(0.9); } 50% { transform: translate(-80px, 0px) scale(1.1); } 100% { transform: translate(80px, 0px) scale(0.9); } }
        @keyframes float-yellow { 0% { transform: translate(0px, 80px) scale(1.1); } 50% { transform: translate(0px, -80px) scale(0.8); } 100% { transform: translate(0px, 80px) scale(1.1); } }
        @keyframes float-green { 0% { transform: translate(-50px, -50px) scale(1); } 25% { transform: translate(50px, -50px) scale(1.1); } 50% { transform: translate(50px, 50px) scale(1); } 75% { transform: translate(-50px, 50px) scale(0.9); } 100% { transform: translate(-50px, -50px) scale(1); } }
        @keyframes float-purple { 0% { transform: rotate(0deg) translate(70px) rotate(0deg) scale(1); } 100% { transform: rotate(360deg) translate(70px) rotate(-360deg) scale(1); } }
        
        @keyframes disco-orbit-1 { 0% { transform: rotate(0deg) translate(120px) rotate(0deg); } 100% { transform: rotate(360deg) translate(120px) rotate(-360deg); } }
        @keyframes disco-orbit-2 { 0% { transform: rotate(0deg) translate(140px) rotate(0deg); } 100% { transform: rotate(360deg) translate(140px) rotate(-360deg); } }
        @keyframes disco-orbit-3 { 0% { transform: rotate(0deg) translate(100px) rotate(0deg); } 100% { transform: rotate(360deg) translate(100px) rotate(-360deg); } }
        @keyframes disco-orbit-4 { 0% { transform: rotate(0deg) translate(160px) rotate(0deg); } 100% { transform: rotate(360deg) translate(160px) rotate(-360deg); } }
        @keyframes disco-orbit-5 { 0% { transform: rotate(0deg) translate(180px) rotate(0deg); } 100% { transform: rotate(360deg) translate(180px) rotate(-360deg); } }
        
        @keyframes disco-shimmer { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
        
        /* Inject calculated durations */
        .dot-blue { animation: float-blue ${3 * durationMultiplier}s ease-in-out infinite; }
        .dot-red { animation: float-red ${3.5 * durationMultiplier}s ease-in-out infinite; }
        .dot-yellow { animation: float-yellow ${2.5 * durationMultiplier}s ease-in-out infinite; }
        .dot-green { animation: float-green ${3.2 * durationMultiplier}s linear infinite; }
        .dot-purple { animation: float-purple ${5 * durationMultiplier}s linear infinite; }
        
        .dot-disco-1 { animation: disco-orbit-1 ${3 * durationMultiplier}s linear infinite; }
        .dot-disco-2 { animation: disco-orbit-2 ${4 * durationMultiplier}s linear infinite; }
        .dot-disco-3 { animation: disco-orbit-3 ${2.5 * durationMultiplier}s linear infinite; }
        .dot-disco-4 { animation: disco-orbit-4 ${5 * durationMultiplier}s linear infinite; }
        .dot-disco-5 { animation: disco-orbit-5 ${6 * durationMultiplier}s linear infinite; }
      `}</style>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {dotConfig.map((dot, i) => (
          <div  
            key={i}
            ref={el => dotEls.current[i] = el}
            className="absolute inset-0 flex items-center justify-center will-change-transform"
          >
            {modeRef.current === 'DISCO' ? (
              <div className={`${dot.size} relative ${dot.animation}`}>
                {/* Vibrant colored background glow */}
                <div className={`absolute inset-0 ${dot.color} rounded-full blur-2xl opacity-80`} />
                <div className={`absolute inset-0 ${dot.color} rounded-full blur-xl opacity-60`} style={{ transform: 'scale(1.5)' }} />                                 
                {/* Disco ball structure */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-400 shadow-2xl overflow-hidden border border-white/50">
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-[1px] p-[1px]">
                    {Array.from({ length: 36 }).map((_, idx) => {
                      const row = Math.floor(idx / 6);
                      const col = idx % 6;
                      const distanceFromCenter = Math.sqrt(Math.pow(row - 2.5, 2) + Math.pow(col - 2.5, 2));
                      const brightness = Math.max(0.5, 1 - distanceFromCenter / 5);
                      
                      return (
                        <div 
                          key={idx}
                          className="bg-gradient-to-br from-white via-gray-50 to-gray-200 rounded-[1px]"
                          style={{
                            opacity: 0.6 + brightness * 0.4,
                            animation: `disco-shimmer ${0.4 + Math.random() * 0.8}s ease-in-out infinite ${Math.random() * 0.6}s`,
                            boxShadow: `inset 0 0 2px rgba(255,255,255,${brightness * 0.8})`
                          }}
                        />
                      );
                    })}
                  </div>
                  {/* Static reflections */}
                  <div className="absolute top-[12%] left-[15%] w-[25%] h-[25%] bg-white rounded-full blur-[3px] opacity-90" />
                  <div className="absolute top-[20%] left-[25%] w-[15%] h-[15%] bg-white rounded-full blur-[2px] opacity-70" />
                  
                  <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                    <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
                    <div className="absolute h-full w-[2px] bg-gradient-to-b from-transparent via-white to-transparent opacity-60" />
                  </div>
                  
                  <div className="absolute inset-0 rounded-full border-2 border-white/60 shadow-inner" />
                </div>
              </div>
            ) : (
              <div className={`${dot.size} ${dot.color} rounded-full shadow-xl ${dot.animation} ${isDarkMode ? 'mix-blend-screen blur-[1px]' : 'opacity-80 mix-blend-multiply'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center px-4 pointer-events-none">
        <h2 className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text mb-6 tracking-tight pb-2 ${
          modeRef.current === 'DISCO' 
            ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-pulse' 
            : (isDarkMode ? 'bg-gradient-to-r from-sky-400 to-indigo-400 animate-pulse' : 'bg-gradient-to-r from-slate-800 to-slate-600 animate-pulse')
        }`}>
          Study Tracker
        </h2>
        <p className={`text-lg font-light tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// OPTION 3: CORNER PULSE LOADER
// ==========================================
const CornerPulseLoader = ({ message, reduceMotion = false, isDarkMode }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  // Speed factor applied to pulse speed
  const speedFactor = reduceMotion ? 0.75 : 1;

  const colorFamilies = {
    Red: ['#f87171', '#ef4444'],
    Yellow: ['#fbbf24', '#fcd34d'],
    Blue: ['#60a5fa', '#93c5fd'],
    Green: ['#34d399', '#6ee7b7'], 
    Purple: ['#a78bfa', '#c4b5fd'], 
    Orange: ['#fb923c', '#fdba74'],
  };

  const activeColors = useRef(() => {
    const families = Object.keys(colorFamilies);
    const shuffledFamilies = [...families].sort(() => 0.5 - Math.random());
    const selectedKeys = shuffledFamilies.slice(0, 4);
    
    return selectedKeys.map(key => {
      const shades = colorFamilies[key];
      const randomShadeIndex = Math.floor(Math.random() * shades.length);
      return shades[randomShadeIndex];
    });
  }).current();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;

    let maxDim, baseSize, pulseAmount;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      maxDim = Math.max(width, height);
      
      baseSize = maxDim * 0.35; 
      pulseAmount = maxDim * 0.12;  
    };
    
    // Scale speeds initially
    const dots = [
      { id: 'TL', color: activeColors[0], speed: (Math.random() * 0.005 + 0.002) * speedFactor, offset: Math.random() * Math.PI * 2 },
      { id: 'TR', color: activeColors[1], speed: (Math.random() * 0.005 + 0.002) * speedFactor, offset: Math.random() * Math.PI * 2 },
      { id: 'BL', color: activeColors[2], speed: (Math.random() * 0.005 + 0.002) * speedFactor, offset: Math.random() * Math.PI * 2 },
      { id: 'BR', color: activeColors[3], speed: (Math.random() * 0.005 + 0.002) * speedFactor, offset: Math.random() * Math.PI * 2 }
    ];

    const animate = () => {
      time++;
      
      // FIX: Use prop instead of querying DOM
      const isDark = isDarkMode;

      const entranceDuration = 100;
      const progress = Math.min(time / entranceDuration, 1);
      const entranceScale = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';

      dots.forEach((dot) => {
        // Pulse logic remains, speed is already scaled in `dots` init
        const pulse = Math.sin(time * dot.speed + dot.offset);
        
        const targetRadius = baseSize + (pulse * pulseAmount);
        const currentRadius = targetRadius * entranceScale;
        const drift = pulse * 15; 

        let x, y;

        switch (dot.id) {
          case 'TL': 
            x = 0 + drift;
            y = 0 + drift;
            break;
          case 'TR': 
            x = width - drift;
            y = 0 + drift;
            break;
          case 'BL': 
            y = height - drift;
            x = 0 + drift;
            break;
          case 'BR': 
            x = width - drift;
            y = height - drift;
            break;
          default:
            x = width / 2;
            y = height / 2;
        }

        ctx.beginPath();
        ctx.arc(x, y, Math.max(0, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        
        ctx.shadowBlur = maxDim * 0.02;
        ctx.shadowColor = dot.color;
        
        ctx.fill();
        ctx.shadowBlur = 0; 
      });

      ctx.globalCompositeOperation = 'source-over';

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [reduceMotion, isDarkMode]); // Added isDarkMode dependency

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      <div className="relative z-10 text-center px-4">
        <h2 className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text mb-6 tracking-tight pb-2 animate-pulse ${
          isDarkMode ? 'bg-gradient-to-r from-sky-400 to-indigo-400' : 'bg-gradient-to-r from-slate-800 to-slate-600'
        }`}>
          Study Tracker
        </h2>
        
        <p className={`text-lg font-light tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// MAIN EXPORT: RANDOMIZER
// ==========================================
const LoadingScreen = ({ message, reduceMotion = false, isDarkMode }) => {
  const loaderVariant = useRef(null);
  if (!loaderVariant.current) {
    const rand = Math.random();
    if (rand < 0.33) {
      loaderVariant.current = 'CANVAS';
    } else if (rand < 0.66) {
      loaderVariant.current = 'DOTS';
    } else {
      loaderVariant.current = 'CORNER_PULSE';
    }
  }

  if (loaderVariant.current === 'CANVAS') {
    return <CanvasLoader message={message} reduceMotion={reduceMotion} isDarkMode={isDarkMode} />;
  }
  
  if (loaderVariant.current === 'DOTS') {
    return <DotLoader message={message} reduceMotion={reduceMotion} isDarkMode={isDarkMode} />;
  }

  return <CornerPulseLoader message={message} reduceMotion={reduceMotion} isDarkMode={isDarkMode} />;
};

export default LoadingScreen;