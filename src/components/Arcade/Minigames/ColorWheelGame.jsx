import React, { useEffect, useRef, useState } from 'react';

const ColorWheelGame = ({ onComplete = () => {}, difficulty }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const textRef = useRef(null); 
  
  // --- Game State Refs ---
  const rotationAngle = useRef(Math.PI / 4); 
  const menuSelectionIndex = useRef(0); // Tracks 0-3 index for menu modes
  const particlesRef = useRef([]); 
  const starburstParticlesRef = useRef([]); 

  // Game State now holds boolean flags for every possible distraction
  const gameState = useRef({
      targetIndex: 0,    
      inkColor: '#fff',
      
      // Distraction Flags (Calculated per round)
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
          
          // Menu Distractions
          retroMenu: false,      
          retroMenuType: 'none', 
          
          handObstruct: false,   
          cornerWheel: false,    
          smallText: false,
          largeText: false,
          directionalParticles: false 
      },

      // Menu Data (Pre-generated for Stroop List)
      stroopMenuOptions: [], 

      // Dynamic values for animations
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

  const bgColorRef = useRef({ bg: 'rgba(15, 23, 42, 1)', text: '#ffffff' });

  // Config
  const sliceColors = [
      { name: 'RED', hex: '#ef4444', h: 0, s: 80, l: 60 },
      { name: 'BLUE', hex: '#3b82f6', h: 220, s: 90, l: 60 },
      { name: 'GREEN', hex: '#22c55e', h: 140, s: 70, l: 50 },
      { name: 'YELLOW', hex: '#eab308', h: 45, s: 90, l: 50 }
  ];
  
  const distractionColors = ['#a855f7', '#f97316', '#ec4899', '#14b8a6', '#6366f1'];

  // --- Theme Detection ---
  useEffect(() => {
    const detectTheme = () => {
      const root = window.document.documentElement;
      const isDark = root.classList.contains('dark');
      setIsDarkMode(isDark);
      
      if (isDark) {
        bgColorRef.current = { bg: 'rgba(15, 23, 42, 1)', text: '#ffffff' };
      } else {
        bgColorRef.current = { bg: 'rgba(241, 245, 249, 1)', text: '#0f172a' };
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
      const radiusBase = groupType === 'inner' ? 150 : 350; 
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
        baseOpacity: (1 - z) * 0.7 + 0.3,
        opacity: 0,
        opacityPhase: Math.random() * Math.PI * 2,
        color: distractionColors[Math.floor(Math.random() * distractionColors.length)],
        group: groupType
      };
  };

  const createColorHerdParticle = (w, h, reset = false) => {
      const z = Math.pow(Math.random(), 0.7);
      const baseSpeed = (1 - z) * 14 + 1.5;
      
      let x, y, vx, vy, angle;

      if (gameState.current.distractions.directionalParticles) {
          const dirX = gameState.current.particleDirection.x;
          const dirY = gameState.current.particleDirection.y;
          
          if (reset) {
             if (Math.abs(dirX) > Math.abs(dirY)) {
                 x = dirX > 0 ? -20 : w + 20;
                 y = Math.random() * h;
             } else {
                 x = Math.random() * w;
                 y = dirY > 0 ? -20 : h + 20;
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
          radius: (1 - z) * 3.5 + 0.5,
          baseOpacity: (1 - z) * 0.85 + 0.45,
          opacity: (1 - z) * 0.85 + 0.45,
          opacityPhase: Math.random() * Math.PI * 2,
          opacitySpeed: 0.02 + Math.random() * 0.03,
          color: Math.random() > 0.5 ? '#ffffff' : distractionColors[Math.floor(Math.random() * distractionColors.length)],
      };
  };

  const initParticles = (w, h) => {
      const p = [];
      for (let i = 0; i < 60; i++) p.push(createOrbitParticle(w, h, 'inner'));
      for (let i = 0; i < 80; i++) p.push(createOrbitParticle(w, h, 'outer'));
      particlesRef.current = p;
      
      const s = [];
      for (let i = 0; i < 200; i++) {
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
          // Common Visuals
          hueShimmer: Math.random() < 0.4,       
          textOrbit: Math.random() < 0.4,        
          directionalParticles: Math.random() < 0.5, 
          
          // Menu Distractions
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
              return {
                  text: sc.name,
                  ink: ink,
                  realIndex: i
              };
          });
      } else {
          d.retroMenuType = 'none';
      }

      if (d.cornerWheel) {
          d.wander = false;
          d.sideAd = false;
          d.largeText = false;
      }

      if (d.blur) {
          d.smallText = false;
          d.textOrbit = false;
      }

      if (d.smallText && d.largeText) d.largeText = false;

      if (d.directionalParticles) {
          const angle = Math.random() * Math.PI * 2;
          gameState.current.particleDirection = {
              x: Math.cos(angle),
              y: Math.sin(angle)
          };
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
                  // Win Condition: Completed 3 rounds
                  onComplete(true, 40); 
              }
          }, 200); // Standardized to 200ms
      } else {
          setMessage('WRONG!');
          // Lose Condition: Immediate Failure
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

      // --- 1. Event Triggers ---
      if (!isLocked && !adActive && d.adsEnabled) {
          if (Math.random() < 0.005) { 
             setAdActive(true);
          }
      }

      // --- 2. Update Physics ---
      if (d.spin) {
          gameState.current.wheelRotationOffset += Math.sin(frame * 0.02) * 0.05; 
      } else {
          gameState.current.wheelRotationOffset *= 0.95;
      }

      if (d.wander) {
          gameState.current.wheelPositionOffset.x = Math.sin(frame * 0.03) * (width * 0.15);
          gameState.current.wheelPositionOffset.y = Math.cos(frame * 0.05) * (height * 0.1);
      } else {
          gameState.current.wheelPositionOffset.x *= 0.95;
          gameState.current.wheelPositionOffset.y *= 0.95;
      }

      let baseX = cx, baseY = cy;
      if (d.cornerWheel) {
          baseX = width * 0.8;
          baseY = height * 0.8;
      }

      const finalWx = baseX + gameState.current.wheelPositionOffset.x;
      const finalWy = baseY + gameState.current.wheelPositionOffset.y;

      // Update Text Position
      if (textRef.current) {
          let tx = gameState.current.wheelPositionOffset.x;
          let ty = gameState.current.wheelPositionOffset.y;
          
          if (d.cornerWheel) {
             tx += (baseX - cx);
             ty += (baseY - cy);
          }

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

      // --- 3. Render Background ---
      ctx.fillStyle = bgColorRef.current.bg;
      ctx.fillRect(0,0, width, height);

      // --- 4. Render Particles ---
      
      // A) Orbital
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

      // B) Active/ColorHerd
      starburstParticlesRef.current.forEach(p => {
          p.opacityPhase += p.opacitySpeed;
          const opacityVariation = Math.sin(p.opacityPhase) * 0.3;
          p.opacity = p.baseOpacity + opacityVariation;

          p.x += p.vx;
          p.y += p.vy;
          
          let respawn = false;
          if (d.directionalParticles) {
              const margin = 50;
              if (p.x < -margin || p.x > width + margin || p.y < -margin || p.y > height + margin) {
                  respawn = true;
              }
          } else {
              const dx = p.x - cx;
              const dy = p.y - cy;
              if (Math.sqrt(dx*dx + dy*dy) > maxDist) respawn = true;
          }

          if (respawn) {
               Object.assign(p, createColorHerdParticle(width, height, true));
          }
          
          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const stretchFactor = 1 + (p.speed * 0.05);
          ctx.ellipse(p.x, p.y, p.radius, p.radius * stretchFactor, p.angle, 0, Math.PI * 2);
          ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // --- 5. RENDER MENU or WHEEL ---
      ctx.save();
      ctx.translate(finalWx, finalWy);
      
      if (d.heartbeat && !d.retroMenu) {
          const scale = 1 + Math.sin(frame * 0.2) * 0.15; 
          ctx.scale(scale, scale);
      }

      if (d.retroMenu) {
          // --- MENU MODE RENDER ---
          
          if (d.retroMenuType === 'windows95') {
              // RETRO WINDOW STYLE
              const winW = 300;
              const winH = 250;
              const topX = -winW/2;
              const topY = -winH/2;

              ctx.fillStyle = '#c0c0c0';
              ctx.fillRect(topX, topY, winW, winH);
              
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(topX, topY, winW, 2);
              ctx.fillRect(topX, topY, 2, winH);
              
              ctx.fillStyle = '#404040';
              ctx.fillRect(topX, topY + winH - 2, winW, 2);
              ctx.fillRect(topX + winW - 2, topY, 2, winH);

              ctx.fillStyle = '#000080';
              ctx.fillRect(topX + 4, topY + 4, winW - 8, 25);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 16px monospace';
              ctx.textAlign = 'left';
              ctx.fillText('COLOR_SYS.EXE', topX + 8, topY + 20);
              
              ctx.textAlign = 'center';
              ctx.font = 'bold 20px monospace';
              
              sliceColors.forEach((col, i) => {
                  const btnY = topY + 50 + (i * 45);
                  const isSelected = (i === menuSelectionIndex.current);
                  
                  ctx.fillStyle = isSelected ? '#a0a0a0' : '#c0c0c0';
                  ctx.fillRect(topX + 20, btnY, winW - 40, 35);
                  
                  if (isSelected) {
                      ctx.strokeStyle = '#000000';
                      ctx.setLineDash([2, 2]);
                      ctx.strokeRect(topX + 24, btnY + 4, winW - 48, 27);
                      ctx.setLineDash([]);
                  }
                  
                  ctx.fillStyle = '#000000';
                  ctx.fillText(col.name, 0, btnY + 24);
              });

          } else {
              // STROOP LIST STYLE
              ctx.fillStyle = 'rgba(0,0,0,0.8)';
              ctx.fillRect(-150, -150, 300, 300);
              ctx.strokeStyle = '#ffffff';
              ctx.strokeRect(-150, -150, 300, 300);

              ctx.font = '900 30px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              gameState.current.stroopMenuOptions.forEach((opt, i) => {
                  const yOff = (i - 1.5) * 60;
                  const isSelected = (i === menuSelectionIndex.current);

                  if (isSelected) {
                      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                      ctx.fillRect(-140, yOff - 30, 280, 60);
                      
                      ctx.fillStyle = '#ffffff';
                      ctx.fillText('>', -100, yOff);
                      ctx.fillText('<', 100, yOff);
                  }

                  ctx.fillStyle = opt.ink; 
                  ctx.fillText(opt.text, 0, yOff); 
              });
          }

      } else {
          // --- STANDARD WHEEL RENDER ---
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
              if (d.hueShimmer) {
                   hue = base.h + Math.sin(frame * 0.1 + i) * 20; 
              }
              
              ctx.fillStyle = `hsl(${hue}, ${base.s}%, ${base.l}%)`;
              
              let alpha = 0.2;
              if (activeSlice === i) alpha = 1.0;
              if (d.spotlight && activeSlice !== i) alpha = 0.05;
              
              ctx.globalAlpha = alpha;
              if (alpha === 1.0) {
                 ctx.shadowBlur = 30;
                 ctx.shadowColor = ctx.fillStyle;
              } else {
                 ctx.shadowBlur = 0;
              }
              ctx.fill();
          }

          const drawAng = rotationAngle.current - gameState.current.wheelRotationOffset;
          const tipX = Math.cos(drawAng) * (radius + 20);
          const tipY = Math.sin(drawAng) * (radius + 20);
          
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = isDarkMode ? '#ffffff' : '#1e293b';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.stroke();
          
          if (d.ghostCursor) {
              const ghostAng = drawAng + Math.PI + Math.sin(frame * 0.1);
              const gX = Math.cos(ghostAng) * (radius + 20);
              const gY = Math.sin(ghostAng) * (radius + 20);
              
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(gX, gY);
              ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(30,41,59,0.3)';
              ctx.lineWidth = 4;
              ctx.setLineDash([10, 10]); 
              ctx.stroke();
              ctx.setLineDash([]);
          }
          
          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = isDarkMode ? '#0f172a' : '#f1f5f9'; 
          ctx.fill();
      }

      ctx.restore(); 

      // --- 9. Obscuring Hand ---
      if (d.handObstruct) {
          ctx.font = '150px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👈', finalWx + 100 + gameState.current.handPosition.x, finalWy + gameState.current.handPosition.y);
      }

      // --- 10. Spotlight Overlay ---
      if (d.spotlight) {
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
          ctx.beginPath();
          ctx.rect(0, 0, width, height);
          
          const grad = ctx.createRadialGradient(finalWx, finalWy, radius * 0.5, finalWx, finalWy, radius * 1.5);
          grad.addColorStop(0, 'rgba(0,0,0,0)'); 
          grad.addColorStop(1, 'rgba(0,0,0,0.98)'); 
          
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
        
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Side Ad Banner */}
        {d.sideAd && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-96 bg-yellow-200 border-l-4 border-yellow-500 flex flex-col items-center justify-center p-2 text-center animate-pulse z-20">
                <div className="text-4xl mb-2">💰</div>
                <div className="font-black text-red-600 text-xl leading-tight">WIN BIG!</div>
                <div className="text-xs mt-2 text-slate-700">CLICK HERE FOR FREE PRIZES</div>
                <div className="mt-4 text-3xl">🎰</div>
            </div>
        )}

        <div className="relative z-10 h-full flex flex-col justify-between p-8 pointer-events-none">
            
            {/* Header */}
            <div className="text-center">
                <div className={`text-2xl font-black drop-shadow-lg tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    ROUND {round}/3
                </div>
                <div className={`text-sm font-bold tracking-[0.3em] mt-2 opacity-50 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {d.reverseControls ? "CONTROLS REVERSED!" : (d.retroMenu ? "USE ARROW KEYS" : "IGNORE THE INK")}
                </div>
            </div>

            {/* Center Word - Orbiting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div ref={textRef} className="flex flex-col items-center justify-center transition-transform duration-75 will-change-transform">
                    {!message && (
                        <h1 
                            className="text-5xl md:text-7xl font-black drop-shadow-2xl"
                            style={{ 
                                color: currentInk,
                                textShadow: isDarkMode ? '0 0 20px rgba(0,0,0,0.5)' : '0 0 20px rgba(255,255,255,0.8)'
                            }}
                        >
                            {currentWord}
                        </h1>
                    )}
                    {message && (
                        <h1 className={`text-7xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {message}
                        </h1>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pb-8">
                <div className={`text-7xl font-mono font-bold mb-4 ${isDarkMode ? 'text-white/30' : 'text-slate-900/30'}`}>
                    {timer.toFixed(1)}
                </div>
                <div className={`flex justify-center gap-8 text-xs font-bold tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>[←] LEFT</span>
                    <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>[SPACE] SELECT</span>
                    <span>[→] RIGHT</span>
                </div>
                
                {/* INVERTED WARNING */}
                {d.inverted && (
                    <div className="mt-4 text-lg font-black text-red-500 animate-pulse uppercase tracking-widest drop-shadow-lg">
                        ⚠️ INVERTED COLORS! ⚠️
                    </div>
                )}
            </div>
        </div>

        {/* MOCK POPUP AD */}
        {adActive && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto animate-in fade-in zoom-in duration-200">
                <div className="bg-white p-8 max-w-md text-center border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] rotate-2">
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