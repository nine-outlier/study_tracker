import React, { useEffect, useRef, useState } from 'react';

const MashChaseGame = ({ onComplete, difficulty = 1 }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const startTimeRef = useRef(Date.now());
  const lastFrameTimeRef = useRef(Date.now()); 
  const frameRef = useRef(0);
  
  // --- Game State Refs ---
  const keys = useRef({});
  const dashIntensity = useRef(0); 
  const playerHueRef = useRef(0);
  const enemiesRef = useRef([]); 
  const playerRef = useRef({});
  const transitioningRef = useRef(false); 
  const activeEnemyColorsRef = useRef([]); 
  const clydeTargetCornerRef = useRef({ x: 0, y: 0 }); 
  const spawnTimeRef = useRef(0); 
  
  // Pause State
  const isRoundStartRef = useRef(false);

  // --- UI State ---
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(5); 

  // --- Configuration ---
  const safeDifficulty = Number.isFinite(difficulty) ? difficulty : 1;
  const baseSpeedMultiplier = 5.7; 

  const dashPowerAdd = 8 + (safeDifficulty * 0.5) + (round * 2.0); 
  const dashMaxSpeed = 25 + (safeDifficulty * 1.0) + (round * 4.0); 
  const roundDuration = 4000 + (safeDifficulty * 200); 
  
  // --- ROUND SCALING LOGIC ---
  let calculatedRounds = 1;
  if (safeDifficulty >= 15) {
      calculatedRounds = 3 + Math.floor((safeDifficulty - 15) / 10);
  }
  const maxRounds = Math.min(5, calculatedRounds); 
  
  // --- SPEED SCALING LOGIC (Based on Max Rounds) ---
  let speedScale = 1.0;
  if (maxRounds === 1) speedScale = 0.8;      // 20% slower
  else if (maxRounds === 2) speedScale = 0.9; // 10% slower
  else if (maxRounds === 3) speedScale = 0.95; // 5% slower
  else if (maxRounds === 4) speedScale = 1.0; // Normal
  else if (maxRounds === 5) speedScale = 1.05; // 5% faster

  const BORDER_SIZE = 10; 

  // --- Styles ---
  const enemyStyles = {
      'BLINKY': { color: '#ff0000', shape: 'triangle', glow: '#ff5555' }, 
      'PINKY':  { color: '#ff00ff', shape: 'square', glow: '#ff99ff' },   
      'INKY':   { color: '#0099ff', shape: 'diamond', glow: '#55ffff' },  
      'CLYDE':  { color: '#00ff00', shape: 'hexagon', glow: '#88ff88' }   
  };

  const playerColor = '#ffffff'; 
  const bgParticlesRef = useRef([]);

  // --- Initialization Logic ---
  const initRound = (r) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Reset Player
      playerRef.current = { 
          x: w / 2, 
          y: h / 2, 
          radius: 15, 
          baseSpeed: 3, 
          currentSpeed: 3,
          vx: 0, 
          vy: 0,
          trail: [], 
          dashSparkles: [], 
          visOffset: { x: 0, y: 0 } 
      };

      // --- ENEMY MANAGEMENT ---
      if (r === 1) {
          enemiesRef.current = [createEnemy(w, h, 'BLINKY')];
      } else {
          // Reset positions of existing
          enemiesRef.current.forEach(enemy => {
              const spawn = getSpawnPoint(w, h);
              enemy.x = spawn.x;
              enemy.y = spawn.y;
              enemy.trail = []; 
          });

          // Add new enemy
          const types = ['BLINKY', 'PINKY', 'INKY', 'CLYDE'];
          const existingTypes = enemiesRef.current.map(e => e.type);
          let availableTypes = types.filter(t => !existingTypes.includes(t));
          if (availableTypes.length === 0) availableTypes = types; 

          const newType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
          enemiesRef.current.push(createEnemy(w, h, newType));
      }
      
      activeEnemyColorsRef.current = enemiesRef.current.map(e => enemyStyles[e.type].color);
      
      // Init Particles
      if (bgParticlesRef.current.length === 0 || bgParticlesRef.current.length > 25) {
          bgParticlesRef.current = Array.from({ length: 25 }, () => ({
              x: Math.random() * w,
              y: Math.random() * h,
              speed: 0.5 + Math.random() * 2,
              size: 1 + Math.random(),
              opacity: 0.05 + Math.random() * 0.1, 
              color: null 
          }));
      }

      setRound(r);
      
      // --- PAUSE STATE ---
      isRoundStartRef.current = true;
      setMessage('Get Ready.');
      dashIntensity.current = 0;
      transitioningRef.current = false; 

      // Unlock after delay
      setTimeout(() => {
          isRoundStartRef.current = false;
          startTimeRef.current = Date.now();
          lastFrameTimeRef.current = Date.now();
          spawnTimeRef.current = Date.now(); 
          setMessage(''); 
      }, 1500);
  };

  const getSpawnPoint = (w, h) => {
      const side = Math.floor(Math.random() * 4); 
      const buffer = 100; 
      let x, y;
      switch(side) {
          case 0: x = Math.random() * w; y = -buffer; break;
          case 1: x = w + buffer; y = Math.random() * h; break;
          case 2: x = Math.random() * w; y = h + buffer; break;
          case 3: x = -buffer; y = Math.random() * h; break;
          default: x = -buffer; y = -buffer;
      }
      return { x, y };
  };

  const createEnemy = (w, h, forceType = null) => {
        const pos = getSpawnPoint(w, h);
        let type = forceType;
        if (!type) {
            const rand = Math.random();
            if (rand < 0.4) type = 'BLINKY';
            else if (rand < 0.7) type = 'PINKY';
            else if (rand < 0.9) type = 'INKY';
            else type = 'CLYDE';
        }

        return {
            x: pos.x,
            y: pos.y,
            type,
            radius: 20 + Math.random() * 5,
            speed: getSpeedForType(type, safeDifficulty),
            trail: [],
            angle: 0, 
            targetX: pos.x,
            targetY: pos.y,
            isScared: false, 
            scareDuration: 0 
        };
  };

  const getSpeedForType = (type, diff) => {
      // Apply speedScale to the calculated base
      const base = (baseSpeedMultiplier + (diff * 0.5)) * speedScale; 
      
      switch (type) {
          case 'BLINKY': return base * 1.15; 
          case 'PINKY': return base * 1.05;  
          case 'INKY': return base * 0.95;   
          case 'CLYDE': return base * 1.25;  
          default: return base;
      }
  };

  // --- Setup ---
  useEffect(() => {
      initRound(1);
  }, []);

  // --- Controls ---
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (isRoundStartRef.current) return; 

        keys.current[e.key] = true;
        if (e.key === ' ' || e.code === 'Space') {
            const current = dashIntensity.current || 0;
            dashIntensity.current = Math.min(current + dashPowerAdd, dashMaxSpeed); 
        }
    };
    
    const handleKeyUp = (e) => {
        keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [round, safeDifficulty, dashPowerAdd, dashMaxSpeed]); 

  // --- Animation Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const bgParticles = bgParticlesRef.current; 

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const drawShape = (ctx, x, y, radius, type, angle) => {
        ctx.beginPath();
        if (type === 'triangle') {
            for (let i = 0; i < 3; i++) {
                const a = angle + (i * 2 * Math.PI / 3) - (Math.PI / 2);
                const px = x + Math.cos(a) * radius * 1.2;
                const py = y + Math.sin(a) * radius * 1.2;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
        } else if (type === 'square') {
            ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
        } else if (type === 'diamond') {
            ctx.moveTo(x, y - radius * 1.3);
            ctx.lineTo(x + radius * 1.3, y);
            ctx.lineTo(x, y + radius * 1.3);
            ctx.lineTo(x - radius * 1.3, y);
        } else if (type === 'hexagon') {
            for (let i = 0; i < 6; i++) {
                const a = angle + (i * 2 * Math.PI / 6);
                const px = x + Math.cos(a) * radius;
                const py = y + Math.sin(a) * radius;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
        } else {
            ctx.arc(x, y, radius, 0, Math.PI * 2);
        }
        ctx.closePath();
    };

    const animate = () => {
      frameRef.current++;
      const now = Date.now();
      const dt = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // -- CLEAR --
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)'; 
      ctx.fillRect(0, 0, width, height);

      // -- BACKGROUND PARTICLES --
      const colorPool = activeEnemyColorsRef.current;
      if (colorPool.length > 0) {
          bgParticles.forEach(p => {
              if (!isRoundStartRef.current) p.y += p.speed; 
              if(p.y > height) {
                  p.y = -5;
                  p.x = Math.random() * width;
                  p.color = colorPool[Math.floor(Math.random() * colorPool.length)]; 
              }
              if (!p.color) {
                  p.color = colorPool[Math.floor(Math.random() * colorPool.length)];
              }
              
              ctx.fillStyle = p.color; 
              ctx.globalAlpha = p.opacity;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
              ctx.fill();
          });
      }
      ctx.globalAlpha = 1.0;

      // -- BORDER --
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0000';
      const lavaHue = (Math.sin(frameRef.current * 0.05) * 10) + 10; 
      ctx.fillStyle = `hsl(${lavaHue}, 100%, 50%)`;
      ctx.fillRect(0, 0, width, BORDER_SIZE);
      ctx.fillRect(0, height - BORDER_SIZE, width, BORDER_SIZE);
      ctx.fillRect(0, BORDER_SIZE, BORDER_SIZE, height - 2 * BORDER_SIZE);
      ctx.fillRect(width - BORDER_SIZE, BORDER_SIZE, BORDER_SIZE, height - 2 * BORDER_SIZE);
      ctx.shadowBlur = 0;

      // ==========================================
      // ACTIVE GAME LOGIC
      // ==========================================
      
      const player = playerRef.current;
      let isDashing = dashIntensity.current > 5; 
      let isSuperDash = dashIntensity.current > (dashMaxSpeed * 0.7); 

      if (!isRoundStartRef.current && !message) {
          
          let elapsed = now - startTimeRef.current;
          
          // Timer Slowdown
          let timeScale = 1.0;
          if (isDashing) timeScale = 0.80;
          const effectiveDt = dt * timeScale;
          const timeSaved = dt - effectiveDt;
          startTimeRef.current += timeSaved; 
          elapsed = now - startTimeRef.current;
          
          let remaining = Math.max(0, roundDuration - elapsed);
          if (frameRef.current % 10 === 0) setTimer(remaining / 1000);

          // Round Complete
          if (remaining <= 0) {
              if (round < maxRounds) {
                  if (!transitioningRef.current) {
                      transitioningRef.current = true;
                      setMessage('SURVIVED!');
                      setTimeout(() => initRound(round + 1), 1000);
                  }
              } else {
                  onComplete(true, 40);
                  return;
              }
          }

          // Physics
          if (isNaN(dashIntensity.current)) dashIntensity.current = 0;
          dashIntensity.current *= 0.92; 
          if (dashIntensity.current < 0.1) dashIntensity.current = 0;
          player.currentSpeed = player.baseSpeed + dashIntensity.current;

          let dx = 0, dy = 0;
          const isMovingInput = (keys.current.ArrowUp || keys.current.w || keys.current.ArrowDown || keys.current.s || keys.current.ArrowLeft || keys.current.a || keys.current.ArrowRight || keys.current.d);

          if (keys.current.ArrowUp || keys.current.w) dy -= 1;
          if (keys.current.ArrowDown || keys.current.s) dy += 1;
          if (keys.current.ArrowLeft || keys.current.a) dx -= 1;
          if (keys.current.ArrowRight || keys.current.d) dx += 1;

          if (isMovingInput) {
              const length = Math.sqrt(dx*dx + dy*dy);
              if (length > 0) {
                  player.vx = (dx / length) * player.currentSpeed;
                  player.vy = (dy / length) * player.currentSpeed;
              } else {
                  player.vx *= 0.95; player.vy *= 0.95;
              }
          } else {
              player.vx *= 0.95; player.vy *= 0.95;
              if (Math.abs(player.vx) < 0.1) player.vx = 0;
              if (Math.abs(player.vy) < 0.1) player.vy = 0;
          }
          
          player.x += player.vx;
          player.y += player.vy;
          if (isNaN(player.x)) player.x = width / 2;
          if (isNaN(player.y)) player.y = height / 2;

          player.visOffset.x = Math.sin(frameRef.current * 0.05) * 2; 
          player.visOffset.y = Math.cos(frameRef.current * 0.07) * 2; 
          
          player.trail.push({ x: player.x, y: player.y, ox: player.visOffset.x, oy: player.visOffset.y });
          if (player.trail.length > 10) player.trail.shift(); 

          // Boundary Check
          if (player.x < BORDER_SIZE || player.x > width - BORDER_SIZE || 
              player.y < BORDER_SIZE || player.y > height - BORDER_SIZE) 
          {
              onComplete(false);
              return;
          }
          
          player.x = Math.max(player.radius + BORDER_SIZE, Math.min(width - player.radius - BORDER_SIZE, player.x));
          player.y = Math.max(player.radius + BORDER_SIZE, Math.min(height - player.radius - BORDER_SIZE, player.y));

          // Enemy AI
          const blinky = enemiesRef.current.find(e => e.type === 'BLINKY');
          const timeSinceSpawn = now - spawnTimeRef.current;
          const initialSlowdownFactor = timeSinceSpawn < 500 ? 0.80 : 1.0; 

          enemiesRef.current.forEach(enemy => {
              let targetX = player.x;
              let targetY = player.y;
              let effectiveSpeed = enemy.speed * initialSlowdownFactor; 

              if (enemy.type === 'PINKY') {
                  const stepsAhead = 40; 
                  targetX = player.x + (player.vx / player.currentSpeed * enemy.speed * stepsAhead);
                  targetY = player.y + (player.vy / player.currentSpeed * enemy.speed * stepsAhead);
                  targetX = Math.max(0, Math.min(width, targetX));
                  targetY = Math.max(0, Math.min(height, targetY));
              } 
              else if (enemy.type === 'INKY') {
                  if (blinky) {
                      const blinkyX = blinky.x;
                      const blinkyY = blinky.y;
                      const pincerX = player.x - blinkyX;
                      const pincerY = player.y - blinkyY;
                      targetX = player.x + pincerX;
                      targetY = player.y + pincerY;
                  } else {
                      targetX = player.x - (player.vx * 20);
                      targetY = player.y - (player.vy * 20);
                  }
              }
              else if (enemy.type === 'CLYDE') {
                  const distToPlayer = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));
                  if (distToPlayer < 250) {
                      if (!enemy.isScared) {
                           enemy.isScared = true;
                           const corners = [{x: 0, y: 0}, {x: width, y: 0}, {x: 0, y: height}, {x: width, y: height}];
                           clydeTargetCornerRef.current = corners[Math.floor(Math.random() * 4)];
                           enemy.scareDuration = frameRef.current + 300; 
                      }
                      targetX = clydeTargetCornerRef.current.x; 
                      targetY = clydeTargetCornerRef.current.y;
                  } else if (distToPlayer > 350) {
                      enemy.isScared = false;
                      enemy.scareDuration = 0;
                  }
              }

              const ex = targetX - enemy.x;
              const ey = targetY - enemy.y;
              const dist = Math.sqrt(ex*ex + ey*ey);
              
              if (dist > 0) {
                  enemy.x += (ex / dist) * effectiveSpeed; 
                  enemy.y += (ey / dist) * effectiveSpeed;
              }

              enemy.angle += 0.05; 
              enemy.trail.push({ x: enemy.x, y: enemy.y });
              if (enemy.trail.length > 10) enemy.trail.shift();

              const trueDx = player.x - enemy.x;
              const trueDy = player.y - enemy.y;
              const trueDist = Math.sqrt(trueDx*trueDx + trueDy*trueDy);

              if (trueDist < player.radius + enemy.radius - 5) { 
                  onComplete(false);
                  return;
              }
          });
          
          // Dash Particles
          if (isDashing) {
              playerHueRef.current = (playerHueRef.current + 20) % 360;
              if(isNaN(playerHueRef.current)) playerHueRef.current = 0;
              
              const angle = Math.random() * Math.PI * 2;
              const speed = 1 + Math.random() * 0.5; 
              const startX = player.x; 
              const startY = player.y;

              player.dashSparkles.push({
                  x: startX, y: startY, 
                  vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                  life: 20, maxLife: 20, radius: 1 + Math.random() * 0.5, 
                  color: isSuperDash ? '#ffffff' : `hsl(${Math.floor(playerHueRef.current + Math.random() * 60)}, 100%, 85%)`
              });
          }
      } 
      
      // ---------------------------------------------
      // RENDER
      // ---------------------------------------------
      
      enemiesRef.current.forEach(enemy => {
          const style = enemyStyles[enemy.type];
          enemy.trail.forEach((pos, i) => {
              const size = (i / enemy.trail.length) * enemy.radius;
              ctx.globalAlpha = (i / enemy.trail.length) * 0.5;
              ctx.fillStyle = style.color; 
              drawShape(ctx, pos.x, pos.y, size, style.shape, enemy.angle - (i * 0.1));
              ctx.fill();
          });
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = style.color; 
          ctx.shadowBlur = 20;
          ctx.shadowColor = style.glow; 
          drawShape(ctx, enemy.x, enemy.y, enemy.radius, style.shape, enemy.angle);
          ctx.fill();
          ctx.shadowBlur = 0;
      });

      const drawX = playerRef.current.x + playerRef.current.visOffset.x;
      const drawY = playerRef.current.y + playerRef.current.visOffset.y;

      if (playerRef.current.trail.length > 1) {
          ctx.fillStyle = playerColor; 
          playerRef.current.trail.forEach((pos, i) => {
              const alpha = (i / playerRef.current.trail.length);
              ctx.globalAlpha = 0.3 * alpha; 
              ctx.beginPath();
              ctx.arc(pos.x + pos.ox, pos.y + pos.oy, playerRef.current.radius * 0.8 * alpha, 0, Math.PI * 2);
              ctx.fill();
          });
          ctx.globalAlpha = 1.0;
      }

      if (isDashing && !isRoundStartRef.current) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = isSuperDash ? '#ffffff' : `hsl(${playerHueRef.current}, 100%, 70%)`;
          const offsetMult = isSuperDash ? 3 : 2;
          ctx.beginPath();
          ctx.arc(drawX - (playerRef.current.vx * offsetMult), drawY - (playerRef.current.vy * offsetMult), playerRef.current.radius * 0.9, 0, Math.PI*2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      }
      
      playerRef.current.dashSparkles = playerRef.current.dashSparkles.filter(p => p.life > 0);
      ctx.globalCompositeOperation = 'lighter';
      playerRef.current.dashSparkles.forEach(p => {
          if (!isRoundStartRef.current) {
              p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95; p.life--;
          }
          const alpha = p.life / p.maxLife;
          ctx.fillStyle = p.color; 
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 20 * alpha; 
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
          ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over'; 
      ctx.shadowBlur = 0; 

      ctx.beginPath();
      ctx.arc(drawX, drawY, playerRef.current.radius, 0, Math.PI * 2);
      ctx.fillStyle = isSuperDash ? '#ffffff' : playerColor; 
      
      const dashGlow = Math.max(0, dashIntensity.current * 4); 
      ctx.shadowBlur = 20 + dashGlow;
      ctx.shadowColor = isDashing ? (isSuperDash ? '#ffffff' : `hsl(${playerHueRef.current}, 100%, 70%)`) : '#ffffff';
      ctx.fill();
      
      if (isSuperDash) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 + (Math.random() * 3);
          ctx.beginPath();
          ctx.arc(drawX, drawY, playerRef.current.radius + 8 + (Math.random() * 5), 0, Math.PI * 2);
          ctx.stroke();
      }
      ctx.shadowBlur = 0;
      
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [round, dashMaxSpeed, message]);

  const isDashingActive = dashIntensity.current > 5;
  const timerFillWidth = (timer / (roundDuration/1000)) * 100;

  const barContainerClasses = `w-full h-4 bg-slate-800 rounded-full overflow-hidden border ${isDashingActive ? 'border-red-500 shadow-xl time-bar-burn' : 'border-slate-700'}`;
  
  const getBarFillStyle = () => {
      const fillPercent = Math.min(100, timerFillWidth);
      const baseColor = isDashingActive ? '#ef4444' : '#ffffff';
      return {
          width: `${fillPercent}%`,
          backgroundColor: baseColor,
          transition: 'width 0.1s linear, background-color 1s'
      };
  };

  return (
    <div className="absolute inset-0 w-full h-full">
        <style>{`
          @keyframes time-bar-glow {
            0% { box-shadow: 0 0 5px rgba(255, 68, 68, 0.4); }
            50% { box-shadow: 0 0 15px rgba(255, 68, 68, 0.9); }
            100% { box-shadow: 0 0 5px rgba(255, 68, 68, 0.4); }
          }
          .time-bar-burn {
            animation: time-bar-glow 1s ease-in-out infinite;
          }
        `}</style>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        
        {/* UI Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
            <div className="text-center">
                <h2 className="text-3xl font-black text-white drop-shadow-md tracking-widest">
                    ROUND {round}/{maxRounds}
                </h2>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                {message ? (
                    <h1 className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-bounce">
                        {message}
                    </h1>
                ) : (
                    <h1 className="text-4xl font-black text-white/20">
                        {isRoundStartRef.current ? '' : 'MASH [SPACE]'}
                    </h1>
                )}
            </div>

            <div className="text-center">
                <div className="text-6xl font-mono font-bold text-white/30 mb-2">
                    {timer.toFixed(1)}
                </div>
                <div className={barContainerClasses}>
                    <div 
                        className="h-full"
                        style={getBarFillStyle()}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default MashChaseGame;