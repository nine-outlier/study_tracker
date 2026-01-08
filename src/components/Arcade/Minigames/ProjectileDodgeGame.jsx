import React, { useEffect, useRef } from 'react';

const ProjectileDodgeGame = ({ onComplete, difficulty = 1 }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  // Game State Refs
  const gameStateRef = useRef({
      player: { 
          x: 0, 
          y: 0, 
          radius: 10, 
          speed: 6, 
          trail: [],
          kx: 0, 
          ky: 0 
      },
      bullets: [],
      lastBulletSpawn: 0,
      startTime: Date.now(),
      initialized: false
  });

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
      onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Input State
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false });

  // Ability State
  const abilityRef = useRef({
      hasUsed: false,
      shards: [],
      pulseAnim: 0,
  });

  // Difficulty Config
  const baseSpeed = 2 + (difficulty * 0.5);
  const baseSpawnRate = Math.max(250, 900 - (difficulty * 50));
  const MAX_BULLETS = 80 + (difficulty * 5); 
  const duration = 7000 + (difficulty * 500);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Initialize Game State
    if (!gameStateRef.current.initialized) {
        gameStateRef.current.player.x = window.innerWidth / 2;
        gameStateRef.current.player.y = window.innerHeight / 2;
        gameStateRef.current.startTime = Date.now();
        gameStateRef.current.initialized = true;
    }

    const handleResize = () => { 
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight; 
    };
    
    const triggerAbility = () => {
        if (abilityRef.current.hasUsed) return;
        
        abilityRef.current.hasUsed = true;
        
        // Full power immediately
        triggerPulse();
    };

    const handleKeyDown = (e) => { 
        if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }

        if (keys.current.hasOwnProperty(e.key)) { keys.current[e.key] = true; }
        
        // Instant trigger on press
        if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
            triggerAbility();
        }
    };

    const handleKeyUp = (e) => { 
        if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false; 
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    const createBreakEffect = () => {
        const particleCount = 24; // Max particles
        const player = gameStateRef.current.player;
        const shieldRadius = player.radius; 

        for(let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const sx = player.x + Math.cos(angle) * shieldRadius;
            const sy = player.y + Math.sin(angle) * shieldRadius;
            const hue = (angle / (Math.PI * 2)) * 360;
            
            abilityRef.current.shards.push({
                x: sx,
                y: sy,
                vx: Math.cos(angle) * (4 + Math.random() * 6), // Faster shard particles
                vy: Math.sin(angle) * (4 + Math.random() * 6),
                alpha: 1.0,
                size: 2 + Math.random() * 3,
                hue: hue 
            });
        }
    };

    const triggerPulse = () => {
        abilityRef.current.pulseAnim = 1.0; 
        createBreakEffect();

        // Large range for full blast
        const pulseRange = 300; 
        const player = gameStateRef.current.player;

        gameStateRef.current.bullets.forEach(b => {
            const dx = b.x - player.x;
            const dy = b.y - player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < pulseRange) {
                const pushAngle = Math.atan2(dy, dx);
                
                // FORCE: Always high deflection (30) to send them flying far
                const deflectionStrength = 30; 
                
                b.vx += Math.cos(pushAngle) * deflectionStrength;
                b.vy += Math.sin(pushAngle) * deflectionStrength;
            }
        });
    };

    const animate = () => {
      const now = Date.now();
      const elapsed = now - gameStateRef.current.startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
          if (onCompleteRef.current) onCompleteRef.current(true, 25);
          return;
      }

      const { player, bullets } = gameStateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // --- PLAYER MOVEMENT ---
      let dx = 0;
      let dy = 0;
      if (keys.current.ArrowUp || keys.current.w) dy -= 1;
      if (keys.current.ArrowDown || keys.current.s) dy += 1;
      if (keys.current.ArrowLeft || keys.current.a) dx -= 1;
      if (keys.current.ArrowRight || keys.current.d) dx += 1;

      if (dx !== 0 || dy !== 0) {
          const length = Math.sqrt(dx*dx + dy*dy);
          player.x += (dx / length) * player.speed;
          player.y += (dy / length) * player.speed;
      }

      // Boundaries
      player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

      // Trail
      player.trail.push({ x: player.x, y: player.y });
      if (player.trail.length > 10) player.trail.shift();

      // Clear & Draw BG
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, width, height);

      // --- SHATTER ANIMATION ---
      if (abilityRef.current.shards.length > 0) {
          for (let i = abilityRef.current.shards.length - 1; i >= 0; i--) {
              let s = abilityRef.current.shards[i];
              s.x += s.vx;
              s.y += s.vy;
              s.alpha -= 0.03;
              if (s.alpha <= 0) {
                  abilityRef.current.shards.splice(i, 1);
              } else {
                  ctx.globalAlpha = s.alpha;
                  ctx.fillStyle = `hsl(${s.hue}, 100%, 70%)`; 
                  ctx.beginPath();
                  ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.globalAlpha = 1.0;
              }
          }
      }

      // --- PULSE VISUAL ---
      if (abilityRef.current.pulseAnim > 0) {
          abilityRef.current.pulseAnim -= 0.04;
          
          // Max Radius fixed to high value
          const maxRadius = 350;
          const currentRadius = maxRadius * (1 - abilityRef.current.pulseAnim) + player.radius;
          const rainbowHue = (now / 2) % 360;
          
          ctx.beginPath();
          ctx.arc(player.x, player.y, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${rainbowHue}, 100%, 60%, ${abilityRef.current.pulseAnim})`;
          ctx.lineWidth = 50 * abilityRef.current.pulseAnim; // Thicker ring
          ctx.stroke();

          if (abilityRef.current.pulseAnim > 0.2) {
              ctx.beginPath();
              ctx.arc(player.x, player.y, currentRadius * 0.6, 0, Math.PI * 2);
              ctx.strokeStyle = `hsla(${rainbowHue + 30}, 100%, 80%, ${abilityRef.current.pulseAnim * 0.8})`;
              ctx.lineWidth = 2;
              ctx.stroke();
          }
      }

      // --- SPAWN BULLETS ---
      const currentSpeed = baseSpeed + (progress * 4);
      const currentSpawnRate = baseSpawnRate * (1 - (progress * 0.6));

      if (now - gameStateRef.current.lastBulletSpawn > currentSpawnRate && bullets.length < MAX_BULLETS) {
          const side = Math.floor(Math.random() * 4); 
          let bx, by, vx, vy;
          
          if (side === 0) { bx = Math.random() * width; by = -10; }      
          else if (side === 1) { bx = width + 10; by = Math.random() * height; } 
          else if (side === 2) { bx = Math.random() * width; by = height + 10; } 
          else { bx = -10; by = Math.random() * height; }              

          const angle = Math.atan2(player.y - by, player.x - bx);
          vx = Math.cos(angle) * currentSpeed;
          vy = Math.sin(angle) * currentSpeed;

          bullets.push({ x: bx, y: by, vx, vy });
          gameStateRef.current.lastBulletSpawn = now;
      }

      // --- UPDATE BULLETS ---
      ctx.fillStyle = '#f472b6'; 
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f472b6';
      
      for (let i = bullets.length - 1; i >= 0; i--) {
          let b = bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          ctx.beginPath();
          ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
          ctx.fill();

          const dist = Math.sqrt(Math.pow(b.x - player.x, 2) + Math.pow(b.y - player.y, 2));
          
          // Collision Check - No Shield Mechanic to save you now, just death
          if (dist < player.radius + 6) { 
              if (onCompleteRef.current) onCompleteRef.current(false); 
              return;
          }

          // Cleanup out of bounds
          if (b.x < -100 || b.x > width + 100 || b.y < -100 || b.y > height + 100) {
              bullets.splice(i, 1);
          }
      }

      ctx.shadowBlur = 0;

      // --- DRAW PLAYER ---
      if (player.trail.length > 1) {
          player.trail.forEach((pos, i) => {
              const alpha = (i / player.trail.length);
              ctx.globalAlpha = 0.3 * alpha;
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, player.radius * 0.8 * alpha, 0, Math.PI * 2);
              ctx.fillStyle = '#38bdf8'; 
              ctx.fill();
          });
          ctx.globalAlpha = 1.0;
      }

      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; 
      ctx.shadowBlur = 20;       
      ctx.shadowColor = '#38bdf8'; 
      ctx.fill();
      ctx.shadowBlur = 0; 

      // --- HUD ---
      // Progress Bar
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, height - 5, width * (1 - progress), 5);
      
      // Ability Indicator
      if (!abilityRef.current.hasUsed) {
          ctx.textAlign = "center";
          const rainbowHue = (now / 5) % 360;
          ctx.fillStyle = `hsl(${rainbowHue}, 100%, 60%)`;
          ctx.font = '10px monospace';
          ctx.fillText('[SPACE] BLAST', player.x, player.y - 25);
          
          // Draw a small "Ready" ring around player
          ctx.strokeStyle = `hsl(${rainbowHue}, 100%, 60%)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(player.x, player.y, player.radius + 5, 0, Math.PI*2);
          ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [difficulty, duration]); 

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default ProjectileDodgeGame;