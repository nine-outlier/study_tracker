import React, { useEffect, useRef } from 'react';

const ProjectileDodgeGame = ({ onComplete, difficulty = 1 }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  // Game State Refs (Persist across renders)
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

  // Keep latest callback current without triggering effects
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
      onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Input State
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false });

  // Ability State
  const abilityRef = useRef({
      charging: false,
      chargeStart: 0,
      hasUsed: false,
      shards: [],
      pulseAnim: 0,
      pulsePower: 0
  });

  // Constants
  const FULL_CHARGE_TIME = 1000;
  
  // Difficulty Config
  // REBALANCE: Start easier, ramp up during the round.
  
  // Base Speed: Starts slow (3) + small scaling per difficulty
  const baseSpeed = 2 + (difficulty * 0.5);
  
  // Base Spawn Rate: Starts infrequent (900ms) - gets faster with difficulty
  const baseSpawnRate = Math.max(250, 900 - (difficulty * 50));
  
  const MAX_BULLETS = 80 + (difficulty * 5); 
  const duration = 7000 + (difficulty * 500);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Initialize Game State ONLY ONCE
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
    
    const releaseShield = () => {
        const now = Date.now();
        const chargeDuration = now - abilityRef.current.chargeStart;
        const linearRatio = Math.min(chargeDuration / FULL_CHARGE_TIME, 1.0);
        const power = Math.pow(linearRatio, 1.5); 

        abilityRef.current.charging = false;
        abilityRef.current.hasUsed = true; 
        
        triggerPulse(power);
    };

    const handleKeyDown = (e) => { 
        if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }

        if (keys.current.hasOwnProperty(e.key)) { keys.current[e.key] = true; }
        
        if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat && !abilityRef.current.charging && !abilityRef.current.hasUsed) {
            abilityRef.current.charging = true;
            abilityRef.current.chargeStart = Date.now();
        }
    };

    const handleKeyUp = (e) => { 
        if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false; 
        
        if ((e.code === 'Space' || e.code === 'Enter') && abilityRef.current.charging) {
            releaseShield();
        }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    const createBreakEffect = (power) => {
        const particleCount = 12 + Math.floor(power * 12);
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
                vx: Math.cos(angle) * (2 + Math.random() * 4 * (0.5 + power)), 
                vy: Math.sin(angle) * (2 + Math.random() * 4 * (0.5 + power)),
                alpha: 1.0,
                size: 2 + Math.random() * 3,
                hue: hue 
            });
        }
    };

    const triggerPulse = (power) => {
        abilityRef.current.pulseAnim = 1.0; 
        abilityRef.current.pulsePower = power; 
        createBreakEffect(power);

        const pulseRange = 140 + (power * 100); 
        const player = gameStateRef.current.player;

        gameStateRef.current.bullets.forEach(b => {
            const dx = b.x - player.x;
            const dy = b.y - player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < pulseRange) {
                const pushAngle = Math.atan2(dy, dx);
                const deflectionStrength = 3 + (power * 16); 
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

      // Knockback Physics
      player.x += player.kx;
      player.y += player.ky;
      player.kx *= 0.9;
      player.ky *= 0.9;
      
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
          const p = abilityRef.current.pulsePower;
          const maxRadius = 160 + (p * 120);
          const currentRadius = maxRadius * (1 - abilityRef.current.pulseAnim) + player.radius;
          const rainbowHue = (now / 2) % 360;
          
          ctx.beginPath();
          ctx.arc(player.x, player.y, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${rainbowHue}, 100%, 60%, ${abilityRef.current.pulseAnim})`;
          ctx.lineWidth = (10 + p * 40) * abilityRef.current.pulseAnim;
          ctx.stroke();

          if (abilityRef.current.pulseAnim > 0.2) {
              ctx.beginPath();
              ctx.arc(player.x, player.y, currentRadius * 0.6, 0, Math.PI * 2);
              ctx.strokeStyle = `hsla(${rainbowHue + 30}, 100%, 80%, ${abilityRef.current.pulseAnim * 0.8})`;
              ctx.lineWidth = 2;
              ctx.stroke();
          }
      }

      // --- SPAWN BULLETS (Progressive Difficulty) ---
      // Ramping: Speed increases, Spawn Interval decreases as round progresses
      const currentSpeed = baseSpeed + (progress * 4); // Speed ramps up +4 over duration
      const currentSpawnRate = baseSpawnRate * (1 - (progress * 0.6)); // Rate accelerates to 40% of base interval

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
          
          if (dist < player.radius + 6) { 
              if (abilityRef.current.charging) {
                  // SHIELD BREAK EVENT
                  abilityRef.current.charging = false;
                  abilityRef.current.hasUsed = true; 
                  
                  const chargeTime = now - abilityRef.current.chargeStart;
                  const linearRatio = Math.min(chargeTime / FULL_CHARGE_TIME, 1.0);
                  const power = Math.pow(linearRatio, 1.5); 

                  const maxKnockback = 25;
                  const minKnockback = 5;
                  const force = maxKnockback - (power * (maxKnockback - minKnockback));

                  const angle = Math.atan2(player.y - b.y, player.x - b.x);
                  player.kx = Math.cos(angle) * force;
                  player.ky = Math.sin(angle) * force;

                  createBreakEffect(power);

                  bullets.splice(i, 1);
                  continue; 
              } else {
                  if (onCompleteRef.current) onCompleteRef.current(false); 
                  return;
              }
          }

          if (b.x < -50 || b.x > width + 50 || b.y < -50 || b.y > height + 50) {
              bullets.splice(i, 1);
          }
      }

      ctx.shadowBlur = 0;

      // --- DRAW SHIELD ---
      if (abilityRef.current.charging) {
          const chargeTime = now - abilityRef.current.chargeStart;
          const chargeRatio = Math.min(chargeTime / FULL_CHARGE_TIME, 1.0);
          const visualPower = Math.pow(chargeRatio, 1.5);
          
          const shieldRadius = player.radius;
          const rainbowHue = (now / 5) % 360;
          const rainbowColor = `hsl(${rainbowHue}, 100%, 60%)`;

          ctx.beginPath();
          ctx.arc(player.x, player.y, shieldRadius, 0, Math.PI * 2);
          ctx.strokeStyle = rainbowColor; 
          ctx.lineWidth = 2 + visualPower * 1.5; 
          ctx.setLineDash([]);
          ctx.stroke();
      }

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
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, height - 5, width * (1 - progress), 5);
      
      if (abilityRef.current.charging) {
          const chargeTime = now - abilityRef.current.chargeStart;
          const chargePct = Math.min(chargeTime / FULL_CHARGE_TIME, 1.0);
          const rainbowHue = (now / 5) % 360;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(player.x - 20, player.y - 35, 40, 4);
          
          ctx.fillStyle = `hsl(${rainbowHue}, 100%, 60%)`; 
          ctx.fillRect(player.x - 20, player.y - 35, 40 * chargePct, 4);
          
      } else if (!abilityRef.current.hasUsed) {
          ctx.textAlign = "center";
          const rainbowHue = (now / 5) % 360;
          ctx.fillStyle = `hsl(${rainbowHue}, 100%, 60%)`;
          ctx.font = '10px monospace';
          ctx.fillText('[SPACE]', player.x, player.y - 35);
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