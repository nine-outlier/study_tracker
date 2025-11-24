import React, { useEffect, useRef, useState } from 'react';

const ColorWheelGame = ({ onComplete = () => {}, difficulty }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const textRef = useRef(null); 
  
  // --- Game State Refs ---
  const rotationAngle = useRef(Math.PI / 4); 
  const menuSelectionIndex = useRef(0); 
  const particlesRef = useRef([]); 
  const starburstParticlesRef = useRef([]); 

  // Game State now holds boolean flags for every possible distraction
  const gameState = useRef({
      targetIndex: 0,    
      inkColor: '#fff',
      
      distractions: {
          spin: false,
          textOrbit: false,
          hueShimmer: false,
          wander: false,
          adsEnabled: false,     
          sideAd: false,         
          reverseControls: false, 
          mirrorText: false,      
          heartbeat: false,       
          spotlight: false,       
          ghostCursor: false,
          
          inverted: false,       
          blur: false,           
          
          retroMenu: false,      
          retroMenuType: 'none', 
          
          handObstruct: false,   
          cornerWheel: false,    
          smallText: false,
          largeText: false,
          directionalParticles: false 
      },

      stroopMenuOptions: [], 

      wheelRotationOffset: 0, 
      wheelPositionOffset: { x: 0, y: 0 },
      textOrbitOffset: { x: 0, y: 0 },
      particleDirection: { x: 0, y: -1 }, 
      handPosition: { x: 0, y: 0 }
  });

  // --- React State (UI) ---
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(10); 
  const [message, setMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Ad State
  const [adActive, setAdActive] = useState(false);
  
  const [currentWord, setCurrentWord] = useState(''); 
  const [currentInk, setCurrentInk] = useState('#fff');

  const bgColorRef = useRef({ bg: '#0f172a', trail: 'rgba(15, 23, 42, 0.2)' });

  // Config
  const sliceColors = [
      { name: 'RED', hex: '#ef4444', h: 0, s: 90, l: 60 },
      { name: 'BLUE', hex: '#3b82f6', h: 220, s: 95, l: 60 },
      { name: 'GREEN', hex: '#22c55e', h: 140, s: 80, l: 50 },
      { name: 'YELLOW', hex: '#eab308', h: 45, s: 95, l: 50 }
  ];
  
  const distractionColors = ['#a855f7', '#f97316', '#ec4899', '#14b8a6', '#6366f1'];

  // --- Theme Detection ---
  useEffect(() => {
    const detectTheme = () => {
      const root = window.document.documentElement;
      const isDark = root.classList.contains('dark');
      setIsDarkMode(isDark);
      
      // We use a darker base for better glow effects regardless of theme, 
      // but adapt UI text colors
      if (isDark) {
        bgColorRef.current = { bg: '#020617', trail: 'rgba(2, 6, 23, 0.3)' };
      } else {
        bgColorRef.current = { bg: '#0f172a', trail: 'rgba(15, 23, 42, 0.3)' }; // Keep dark bg for glow
      }
    };
    
    detectTheme();
    const observer = new MutationObserver(detectTheme);
    observer.observe(window.document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // --- Particle Systems ---

  const createOrbitParticle = (w, h, groupType) => {
      const z = Math.pow(Math.random(), 0.7); 
      const angle = Math.random() * Math.PI * 2;
      const radiusBase = groupType === 'inner' ? 180 : 380; 
      const radiusVar = Math.random() * 100;
      const baseSpeed = (1 - z) * 0.01 + 0.002; 
      const direction = groupType === 'inner' ? 1 : -1;

      return {
        type: 'orbit',
        angle: angle,
        orbitRadius: radiusBase + radiusVar,
        z: z,
        speed: baseSpeed * direction,
        radius: (1 - z) * 4 + 1, 
        baseOpacity: (1 - z) * 0.5 + 0.1, // Subtler
        opacity: 0,
        opacityPhase: Math.random() * Math.PI * 2,
        color: distractionColors[Math.floor(Math.random() * distractionColors.length)],
        group: groupType
      };
  };

  const createColorHerdParticle = (w, h, reset = false) => {
      const z = Math.pow(Math.random(), 0.7);
      const baseSpeed = (1 - z) * 14 + 2.0; // Slightly faster for pop
      
      let x, y, vx, vy, angle;

      if (gameState.current.distractions.directionalParticles) {
          const dirX = gameState.current.particleDirection.x;
          const dirY = gameState.current.particleDirection.y;
          
          if (reset) {
             if (Math.abs(dirX) > Math.abs(dirY)) {
                 x = dirX > 0 ? -50 : w + 50;
                 y = Math.random() * h;
             } else {
                 x = Math.random() * w;
                 y = dirY > 0 ? -50 : h + 50;
             }
          } else {
             x = Math.random() * w;
             y = Math.random() * h;
          }
          
          vx = dirX * baseSpeed;
          vy = dirY * baseSpeed;
          angle = Math.atan2(vy, vx); 

      } else {
          angle = Math.random() * Math.PI * 2;
          const maxDist = Math.sqrt(w*w + h*h) / 2;
          const startDist = reset ? 0 : Math.random() * maxDist;
          
          x = (w/2) + Math.cos(angle) * startDist;
          y = (h/2) + Math.sin(angle) * startDist;
          
          vx = Math.cos(angle) * baseSpeed;
          vy = Math.sin(angle) * baseSpeed;
      }

      return {
          x, y, vx, vy, angle, z,
          speed: baseSpeed,
          radius: (1 - z) * 4.0 + 1.0, // Larger particles
          baseOpacity: (1 - z) * 0.8 + 0.2,
          opacity: (1 - z) * 0.8 + 0.2,
          opacityPhase: Math.random() * Math.PI * 2,
          opacitySpeed: 0.05 + Math.random() * 0.05, // Faster pulse
          color: Math.random() > 0.6 ? '#ffffff' : distractionColors[Math.floor(Math.random() * distractionColors.length)],
      };
  };

  const initParticles = (w, h) => {
      const p = [];
      for (let i = 0; i < 60; i++) p.push(createOrbitParticle(w, h, 'inner'));
      for (let i = 0; i < 80; i++) p.push(createOrbitParticle(w, h, 'outer'));
      particlesRef.current = p;
      
      const s = [];
      for (let i = 0; i < 250; i++) { // Increased count slightly
          s.push(createColorHerdParticle(w, h, false));
      }
      starburstParticlesRef.current = s;
  };

  // --- Game Logic ---
  const initRound = (r) => {
      const targetIdx = Math.floor(Math.random() * 4);
      gameState.current.targetIndex = targetIdx;
      setCurrentWord(sliceColors[targetIdx].name);

      // Ink Logic
      const useInkDistraction = Math.random() > 0.3; 
      let inkHex;
      if (useInkDistraction) {
          if (Math.random() > 0.5) {
              inkHex = distractionColors[Math.floor(Math.random() * distractionColors.length)];
          } else {
              let wrongIdx = Math.floor(Math.random() * 4);
              while(wrongIdx === targetIdx) wrongIdx = Math.floor(Math.random() * 4);
              inkHex = sliceColors[wrongIdx].hex;
          }
      } else {
          inkHex = sliceColors[targetIdx].hex; 
      }
      gameState.current.inkColor = inkHex;
      setCurrentInk(inkHex);

      // --- CALCULATE DISTRACTIONS ---
      const d = {
          hueShimmer: Math.random() < 0.4,       
          textOrbit: Math.random() < 0.4,        
          directionalParticles: Math.random() < 0.5, 
          
          retroMenu: Math.random() < 0.2, 
          sideAd: Math.random() < 0.2,           
          handObstruct: Math.random() < 0.15,    
          cornerWheel: Math.random() < 0.02,     
          smallText: Math.random() < 0.1,        
          largeText: Math.random() < 0.1,        

          inverted: Math.random() < 0.05,        
          blur: Math.random() < 0.05,            

          spin: Math.random() < 0.2,             
          wander: Math.random() < 0.2,          
          heartbeat: Math.random() < 0.2,       
          
          ghostCursor: Math.random() < 0.2,      
          mirrorText: Math.random() < 0.1,      
          reverseControls: Math.random() < 0.08,  
          spotlight: Math.random() < 0.05,       
          adsEnabled: Math.random() < 0.03       
      };
      
      // --- SANITY CHECKS ---
      if (d.retroMenu) {
          d.retroMenuType = Math.random() > 0.5 ? 'windows95' : 'stroopList';
          d.cornerWheel = false; 
          d.spin = false; 
          d.wander = false;
          d.spotlight = false;
          d.ghostCursor = false;
          d.textOrbit = false;
          d.handObstruct = false;
          
          gameState.current.stroopMenuOptions = sliceColors.map((sc, i) => {
              let ink = sliceColors[Math.floor(Math.random() * 4)].hex;
              return { text: sc.name, ink: ink, realIndex: i };
          });
      } else {
          d.retroMenuType = 'none';
      }

      if (d.cornerWheel) { d.wander = false; d.sideAd = false; d.largeText = false; }
      if (d.blur) { d.smallText = false; d.textOrbit = false; }
      if (d.smallText && d.largeText) d.largeText = false;

      if (d.directionalParticles) {
          const angle = Math.random() * Math.PI * 2;
          gameState.current.particleDirection = { x: Math.cos(angle), y: Math.sin(angle) };
      }
      
      gameState.current.handPosition = {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100
      };
      
      gameState.current.distractions = d;

      setRound(r);
      setTimer(10 - (Math.min(r, 5) * 0.5)); 
      setIsLocked(false);
      setAdActive(false);
      setMessage('');
      
      gameState.current.wheelRotationOffset = 0;
      gameState.current.wheelPositionOffset = { x: 0, y: 0 };
      
      menuSelectionIndex.current = 0;
      
      if (canvasRef.current) {
          initParticles(canvasRef.current.width, canvasRef.current.height);
      }
  };

  useEffect(() => {
    initRound(1);
  }, []);

  // --- Timer ---
  useEffect(() => {
    if (isLocked || adActive) return; 
    const interval = setInterval(() => {
        setTimer(prev => {
            if (prev <= 0) {
                clearInterval(interval);
                handleAction(true); 
                return 0;
            }
            return prev - 0.05;
        });
    }, 50);
    return () => clearInterval(interval);
  }, [isLocked, adActive]);

  // --- Controls ---
  const handleAction = (forceFail = false) => {
      if (isLocked || adActive) return;
      
      const d = gameState.current.distractions;
      let success = false;

      if (!forceFail) {
        if (d.retroMenu) {
            success = (menuSelectionIndex.current === gameState.current.targetIndex);
        } else {
            let ang = rotationAngle.current;
            let cursorAng = ang % (Math.PI * 2);
            if (cursorAng < 0) cursorAng += Math.PI * 2;

            let adjustedAng = cursorAng - gameState.current.wheelRotationOffset;
            adjustedAng = adjustedAng % (Math.PI * 2);
            if (adjustedAng < 0) adjustedAng += Math.PI * 2;

            const sliceIndex = Math.floor(adjustedAng / (Math.PI / 2));
            success = (sliceIndex === gameState.current.targetIndex);
        }
      }

      setIsLocked(true);

      if (success) {
          setMessage('MATCH!');
          setTimeout(() => {
              if (round < 3) {
                  initRound(round + 1);
              } else {
                  onComplete(true, 40); 
              }
          }, 200); 
      } else {
          setMessage('WRONG!');
          setTimeout(() => onComplete(false), 1000); 
      }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (isLocked) return;
        
        if (adActive) {
            if (e.key === ' ' || e.key === 'Enter') {
                setAdActive(false);
            }
            return; 
        }

        const d = gameState.current.distractions;
        
        let isLeft = ['ArrowLeft', 'a'].includes(e.key);
        let isRight = ['ArrowRight', 'd'].includes(e.key);
        let isUp = ['ArrowUp', 'w'].includes(e.key);
        let isDown = ['ArrowDown', 's'].includes(e.key);
        let isSelect = [' ', 'Enter'].includes(e.key);

        if (d.reverseControls) {
            let temp = isLeft; isLeft = isRight; isRight = temp;
            temp = isUp; isUp = isDown; isDown = temp;
        }

        if (d.retroMenu) {
            if (isUp || isLeft) {
                menuSelectionIndex.current = (menuSelectionIndex.current - 1 + 4) % 4;
            }
            if (isDown || isRight) {
                menuSelectionIndex.current = (menuSelectionIndex.current + 1) % 4;
            }
        } else {
            const snapAmount = Math.PI / 2;
            if (isLeft) {
                 const currentSlot = Math.round((rotationAngle.current - (Math.PI / 4)) / snapAmount);
                 rotationAngle.current = ((currentSlot - 1) * snapAmount) + (Math.PI / 4);
            }
            if (isRight) {
                 const currentSlot = Math.round((rotationAngle.current - (Math.PI / 4)) / snapAmount);
                 rotationAngle.current = ((currentSlot + 1) * snapAmount) + (Math.PI / 4);
            }
        }

        if (isSelect) handleAction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, round, adActive]); 

  // --- Animation Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;

    const handleResize = () => { 
        width = window.innerWidth; 
        height = window.innerHeight; 
        canvas.width = width; 
        canvas.height = height; 
        initParticles(width, height);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const animate = () => {
      frame++;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.25;
      const maxDist = Math.sqrt(width*width + height*height) / 2;
      const d = gameState.current.distractions; 

      // 1. Clear with "Trail" effect
      ctx.fillStyle = bgColorRef.current.trail;
      ctx.fillRect(0,0, width, height);

      // 2. Physics & Logic Updates
      if (!isLocked && !adActive && d.adsEnabled) {
          if (Math.random() < 0.005) setAdActive(true);
      }

      if (d.spin) gameState.current.wheelRotationOffset += Math.sin(frame * 0.02) * 0.05; 
      else gameState.current.wheelRotationOffset *= 0.95;

      if (d.wander) {
          gameState.current.wheelPositionOffset.x = Math.sin(frame * 0.03) * (width * 0.15);
          gameState.current.wheelPositionOffset.y = Math.cos(frame * 0.05) * (height * 0.1);
      } else {
          gameState.current.wheelPositionOffset.x *= 0.95;
          gameState.current.wheelPositionOffset.y *= 0.95;
      }

      let baseX = cx, baseY = cy;
      if (d.cornerWheel) { baseX = width * 0.8; baseY = height * 0.8; }

      const finalWx = baseX + gameState.current.wheelPositionOffset.x;
      const finalWy = baseY + gameState.current.wheelPositionOffset.y;

      // Update HTML Text Transform
      if (textRef.current) {
          let tx = gameState.current.wheelPositionOffset.x;
          let ty = gameState.current.wheelPositionOffset.y;
          if (d.cornerWheel) { tx += (baseX - cx); ty += (baseY - cy); }
          if (d.textOrbit) {
              const orbitR = 50;
              tx += Math.cos(frame * 0.1) * orbitR;
              ty += Math.sin(frame * 0.1) * orbitR;
          }
          let transform = `translate(${tx}px, ${ty}px)`;
          if (d.mirrorText) transform += ` scaleX(-1)`;
          if (d.smallText) transform += ` scale(0.5)`;
          if (d.largeText) transform += ` scale(1.5)`;
          textRef.current.style.transform = transform;
      }

      // 3. Render Particles (Background - Orbital)
      ctx.globalCompositeOperation = 'lighter'; // GLOW MODE
      particlesRef.current.forEach(p => {
          p.angle += p.speed;
          const px = cx + Math.cos(p.angle) * p.orbitRadius;
          const py = cy + Math.sin(p.angle) * p.orbitRadius;
          p.opacityPhase += 0.02;
          p.opacity = p.baseOpacity + Math.sin(p.opacityPhase) * 0.2;

          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
          const stretch = 1 + (Math.abs(p.speed) * 100); 
          const tangentAngle = p.angle + (Math.PI / 2);
          ctx.ellipse(px, py, p.radius, p.radius * stretch, tangentAngle, 0, Math.PI * 2);
          ctx.fill();
      });

      // 4. Render Particles (Active - Starburst)
      starburstParticlesRef.current.forEach(p => {
          p.opacityPhase += p.opacitySpeed;
          const opacityVariation = Math.sin(p.opacityPhase) * 0.3;
          p.opacity = p.baseOpacity + opacityVariation;
          p.x += p.vx;
          p.y += p.vy;
          
          let respawn = false;
          if (d.directionalParticles) {
              const margin = 50;
              if (p.x < -margin || p.x > width + margin || p.y < -margin || p.y > height + margin) respawn = true;
          } else {
              const dx = p.x - cx;
              const dy = p.y - cy;
              if (Math.sqrt(dx*dx + dy*dy) > maxDist) respawn = true;
          }

          if (respawn) Object.assign(p, createColorHerdParticle(width, height, true));
          
          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10; // Intense glow
          ctx.shadowColor = p.color;
          
          ctx.beginPath();
          const stretchFactor = 1 + (p.speed * 0.1);
          ctx.ellipse(p.x, p.y, p.radius, p.radius * stretchFactor, p.angle, 0, Math.PI * 2);
          ctx.fill();
          
          // Reset shadow for performance
          ctx.shadowBlur = 0;
      });
      
      ctx.globalCompositeOperation = 'source-over'; // Reset blend mode for UI
      ctx.globalAlpha = 1.0;

      // 5. Render Wheel / Menu
      ctx.save();
      ctx.translate(finalWx, finalWy);
      
      if (d.heartbeat && !d.retroMenu) {
          const scale = 1 + Math.sin(frame * 0.2) * 0.15; 
          ctx.scale(scale, scale);
      }

      if (d.retroMenu) {
          // --- RETRO MENU RENDER ---
          if (d.retroMenuType === 'windows95') {
              const winW = 320; const winH = 260;
              const topX = -winW/2; const topY = -winH/2;

              // Shadow for window
              ctx.shadowColor = 'rgba(0,0,0,0.5)';
              ctx.shadowBlur = 20;
              
              ctx.fillStyle = '#c0c0c0';
              ctx.fillRect(topX, topY, winW, winH);
              ctx.shadowBlur = 0; // Reset shadow

              // 3D Bevels
              ctx.fillStyle = '#ffffff'; // Light edge
              ctx.fillRect(topX, topY, winW, 2); ctx.fillRect(topX, topY, 2, winH);
              ctx.fillStyle = '#404040'; // Dark edge
              ctx.fillRect(topX, topY + winH - 2, winW, 2); ctx.fillRect(topX + winW - 2, topY, 2, winH);

              // Header
              ctx.fillStyle = '#000080';
              ctx.fillRect(topX + 4, topY + 4, winW - 8, 25);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 14px monospace';
              ctx.textAlign = 'left';
              ctx.fillText('COLOR_SYSTEM_ERROR.EXE', topX + 8, topY + 20);
              
              ctx.textAlign = 'center';
              ctx.font = 'bold 20px monospace';
              
              sliceColors.forEach((col, i) => {
                  const btnY = topY + 50 + (i * 48);
                  const isSelected = (i === menuSelectionIndex.current);
                  
                  ctx.fillStyle = isSelected ? '#a0a0a0' : '#c0c0c0';
                  ctx.fillRect(topX + 20, btnY, winW - 40, 35);
                  
                  // Selected visual
                  if (isSelected) {
                      ctx.strokeStyle = '#000000';
                      ctx.setLineDash([2, 2]);
                      ctx.strokeRect(topX + 24, btnY + 4, winW - 48, 27);
                      ctx.setLineDash([]);
                  } else {
                       // Unselected bevel
                       ctx.fillStyle = '#ffffff';
                       ctx.fillRect(topX+20, btnY, winW-40, 2); ctx.fillRect(topX+20, btnY, 2, 35);
                       ctx.fillStyle = '#404040';
                       ctx.fillRect(topX+20, btnY+33, winW-40, 2); ctx.fillRect(topX+winW-22, btnY, 2, 35);
                  }
                  
                  ctx.fillStyle = '#000000';
                  ctx.fillText(col.name, 0, btnY + 24);
              });

          } else {
              // STROOP LIST
              ctx.shadowColor = 'black';
              ctx.shadowBlur = 20;
              ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
              ctx.fillRect(-160, -160, 320, 320);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.strokeRect(-160, -160, 320, 320);
              ctx.shadowBlur = 0;

              ctx.font = '900 32px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              gameState.current.stroopMenuOptions.forEach((opt, i) => {
                  const yOff = (i - 1.5) * 65;
                  const isSelected = (i === menuSelectionIndex.current);

                  if (isSelected) {
                      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                      ctx.fillRect(-150, yOff - 30, 300, 60);
                      ctx.fillStyle = '#ffffff';
                      ctx.font = '900 40px monospace'; // Bigger when selected
                      ctx.fillText('>', -120, yOff);
                      ctx.fillText('<', 120, yOff);
                      ctx.font = '900 32px monospace'; // Reset
                  }

                  ctx.shadowColor = opt.ink;
                  ctx.shadowBlur = 10;
                  ctx.fillStyle = opt.ink; 
                  ctx.fillText(opt.text, 0, yOff); 
                  ctx.shadowBlur = 0;
              });
          }

      } else {
          // --- FANCY WHEEL RENDER ---
          ctx.rotate(gameState.current.wheelRotationOffset); 

          let cursorRelAngle = rotationAngle.current - gameState.current.wheelRotationOffset;
          let normAng = cursorRelAngle % (Math.PI * 2);
          if (normAng < 0) normAng += Math.PI * 2;
          const activeSlice = Math.floor(normAng / (Math.PI / 2));

          for (let i = 0; i < 4; i++) {
              ctx.beginPath();
              ctx.moveTo(0, 0); 
              ctx.arc(0, 0, radius, i * (Math.PI/2), (i+1) * (Math.PI/2));
              ctx.closePath();
              
              const base = sliceColors[i];
              let hue = base.h;
              if (d.hueShimmer) hue = base.h + Math.sin(frame * 0.1 + i) * 20; 
              
              // Gradient Slice
              const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
              grad.addColorStop(0, `hsla(${hue}, ${base.s}%, 10%, 1)`); // Dark center
              grad.addColorStop(0.6, `hsla(${hue}, ${base.s}%, ${base.l}%, 1)`); // Bright Mid
              grad.addColorStop(1, `hsla(${hue}, ${base.s}%, 20%, 1)`); // Dark Rim
              
              ctx.fillStyle = grad;
              
              let alpha = 0.3; // Dimmer inactive
              if (activeSlice === i) alpha = 1.0;
              if (d.spotlight && activeSlice !== i) alpha = 0.05;
              
              ctx.globalAlpha = alpha;
              
              if (alpha === 1.0) {
                 ctx.shadowBlur = 40; // Mega Glow
                 ctx.shadowColor = `hsla(${hue}, ${base.s}%, ${base.l}%, 1)`;
              } else {
                 ctx.shadowBlur = 0;
              }
              ctx.fill();
          }

          // Cursor (Neon Style)
          const drawAng = rotationAngle.current - gameState.current.wheelRotationOffset;
          const tipX = Math.cos(drawAng) * (radius + 25);
          const tipY = Math.sin(drawAng) * (radius + 25);
          
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffffff';
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          // Ghost Cursor
          if (d.ghostCursor) {
              const ghostAng = drawAng + Math.PI + Math.sin(frame * 0.1);
              const gX = Math.cos(ghostAng) * (radius + 20);
              const gY = Math.sin(ghostAng) * (radius + 20);
              
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(gX, gY);
              ctx.strokeStyle = 'rgba(255,255,255,0.4)';
              ctx.lineWidth = 4;
              ctx.setLineDash([10, 10]); 
              ctx.stroke();
              ctx.setLineDash([]);
          }
          
          // Glassy Hub
          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();
          // Hub Rim
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();
      }

      ctx.restore(); 

      // 6. Obscuring Hand
      if (d.handObstruct) {
          ctx.font = '150px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'black';
          ctx.fillText('👈', finalWx + 100 + gameState.current.handPosition.x, finalWy + gameState.current.handPosition.y);
          ctx.shadowBlur = 0;
      }

      // 7. Spotlight Overlay
      if (d.spotlight) {
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.98)'; // Darker
          ctx.beginPath();
          ctx.rect(0, 0, width, height);
          
          const grad = ctx.createRadialGradient(finalWx, finalWy, radius * 0.4, finalWx, finalWy, radius * 1.6);
          grad.addColorStop(0, 'rgba(0,0,0,0)'); 
          grad.addColorStop(1, 'rgba(0,0,0,1)'); 
          
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isDarkMode, isLocked, adActive]); 

  const d = gameState.current.distractions;

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden transition-all duration-500 ${d.inverted ? 'invert' : ''} ${d.blur ? 'blur-sm' : ''}`} 
         style={{ backgroundColor: bgColorRef.current.bg }}>
        
        {/* Vignette Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'
        }}></div>

        {/* Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 2px, 3px 100%'
        }}></div>
        
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Side Ad Banner */}
        {d.sideAd && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-96 bg-yellow-200 border-l-4 border-yellow-500 flex flex-col items-center justify-center p-2 text-center animate-pulse z-20 shadow-2xl">
                <div className="text-4xl mb-2">💰</div>
                <div className="font-black text-red-600 text-xl leading-tight">WIN BIG!</div>
                <div className="text-xs mt-2 text-slate-700">CLICK HERE FOR FREE PRIZES</div>
                <div className="mt-4 text-3xl">🎰</div>
            </div>
        )}

        <div className="relative z-10 h-full flex flex-col justify-between p-8 pointer-events-none">
            
            {/* Header */}
            <div className="text-center">
                <div className="text-2xl font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] tracking-widest text-white">
                    ROUND {round}/3
                </div>
                <div className="text-sm font-bold tracking-[0.3em] mt-2 opacity-70 text-white drop-shadow-md">
                    {d.reverseControls ? "CONTROLS REVERSED!" : (d.retroMenu ? "USE ARROW KEYS" : "IGNORE THE INK")}
                </div>
            </div>

            {/* Center Word - Orbiting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div ref={textRef} className="flex flex-col items-center justify-center transition-transform duration-75 will-change-transform">
                    {!message && (
                        <h1 
                            className="text-6xl md:text-8xl font-black drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                            style={{ 
                                color: currentInk,
                                textShadow: '0 0 40px currentColor' // Neon Glow on text
                            }}
                        >
                            {currentWord}
                        </h1>
                    )}
                    {message && (
                        <h1 className="text-7xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce text-white">
                            {message}
                        </h1>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pb-8">
                <div className="text-7xl font-mono font-bold mb-4 text-white/20">
                    {timer.toFixed(1)}
                </div>
                <div className="flex justify-center gap-8 text-xs font-bold tracking-[0.2em] text-slate-400">
                    <span>[←] LEFT</span>
                    <span className="text-white drop-shadow-[0_0_5px_white]">[SPACE] SELECT</span>
                    <span>[→] RIGHT</span>
                </div>
            </div>
        </div>

        {/* MOCK POPUP AD */}
        {adActive && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto animate-in fade-in zoom-in duration-200">
                <div className="bg-white p-8 max-w-md text-center border-4 border-red-500 shadow-[0_0_100px_rgba(239,68,68,0.8)] rotate-2">
                    <h2 className="text-4xl font-black text-red-600 mb-4 uppercase tracking-tighter">WARNING!</h2>
                    <p className="text-slate-900 font-bold text-lg mb-6">
                        SYSTEM OVERLOAD DETECTED. <br/>
                        PLEASE VERIFY HUMANITY.
                    </p>
                    <div className="bg-slate-100 p-4 rounded border-2 border-dashed border-slate-300 mb-6">
                        <div className="text-sm text-slate-500 font-mono">CAPTCHA_V2.3</div>
                        <div className="text-3xl font-black text-slate-800 mt-2 tracking-[0.5em]">XYZ-123</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 tracking-widest animate-pulse">
                        PRESS [SPACE] TO DISMISS
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ColorWheelGame;