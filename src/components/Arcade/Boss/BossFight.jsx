import React, { useEffect, useRef, useState } from 'react';

const BossFight = ({ onComplete, difficulty }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  // Boss Stats
  const maxHp = 100 + (difficulty * 50);
  const [bossHp, setBossHp] = useState(maxHp);
  
  // Game Constants
  const PLAYER_SPEED = 5;
  const BULLET_SPEED = 4;
  const BOSS_PATTERN_INTERVAL = 2000; // Change attack pattern every 2s

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Entities
    let player = { x: width / 2, y: height - 100, radius: 10, color: '#38bdf8' };
    let boss = { x: width / 2, y: 100, radius: 40, angle: 0, color: '#ef4444' };
    let bullets = []; // Enemy bullets
    let shots = [];   // Player shots
    let lastShotTime = 0;
    let lastPatternTime = 0;
    
    // Input State
    const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false, " ": false };

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    const handleKeyDown = (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; };
    const handleKeyUp = (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    const spawnPattern = (time) => {
        // 1. Radial Burst
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (time * 0.001);
            bullets.push({
                x: boss.x, y: boss.y,
                vx: Math.cos(angle) * BULLET_SPEED,
                vy: Math.sin(angle) * BULLET_SPEED,
                radius: 6, color: '#facc15' // Yellow
            });
        }
        
        // 2. Targeted Shot
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const angle = Math.atan2(dy, dx);
        bullets.push({
            x: boss.x, y: boss.y,
            vx: Math.cos(angle) * (BULLET_SPEED * 1.5),
            vy: Math.sin(angle) * (BULLET_SPEED * 1.5),
            radius: 8, color: '#ef4444' // Red
        });
    };

    const animate = (time) => {
      // --- LOGIC ---
      
      // 1. Move Player
      if (keys.ArrowUp || keys.w) player.y -= PLAYER_SPEED;
      if (keys.ArrowDown || keys.s) player.y += PLAYER_SPEED;
      if (keys.ArrowLeft || keys.a) player.x -= PLAYER_SPEED;
      if (keys.ArrowRight || keys.d) player.x += PLAYER_SPEED;
      
      // Clamp Player
      player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

      // 2. Boss Logic (Hover)
      boss.x = (width / 2) + Math.sin(time * 0.002) * 150;
      boss.y = 100 + Math.cos(time * 0.003) * 30;
      boss.angle += 0.02;

      // 3. Spawn Bullets (Pattern)
      if (time - lastPatternTime > Math.max(500, BOSS_PATTERN_INTERVAL - difficulty * 50)) {
          spawnPattern(time);
          lastPatternTime = time;
      }

      // 4. Auto-Fire Player Shots
      if (time - lastShotTime > 150) { // Fire every 150ms
          shots.push({
              x: player.x, y: player.y - 10,
              vx: 0, vy: -10,
              radius: 4, color: '#60a5fa'
          });
          lastShotTime = time;
      }

      // --- UPDATE & COLLISION ---
      
      // Update Player Shots
      for (let i = shots.length - 1; i >= 0; i--) {
          let s = shots[i];
          s.x += s.vx;
          s.y += s.vy;
          
          // Hit Boss?
          const dx = s.x - boss.x;
          const dy = s.y - boss.y;
          if (Math.sqrt(dx*dx + dy*dy) < boss.radius + s.radius) {
              setBossHp(prev => {
                  const newHp = prev - 5; // 5 Dmg per shot
                  if (newHp <= 0) {
                      onComplete(true, 100); // Victory! Big points
                      cancelAnimationFrame(requestRef.current);
                  }
                  return newHp;
              });
              shots.splice(i, 1);
              continue;
          }
          
          // Off screen?
          if (s.y < 0) shots.splice(i, 1);
      }

      // Update Enemy Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
          let b = bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          
          // Hit Player?
          const dx = b.x - player.x;
          const dy = b.y - player.y;
          if (Math.sqrt(dx*dx + dy*dy) < player.radius + b.radius) {
              onComplete(false); // Death
              return;
          }

          if (b.x < 0 || b.x > width || b.y > height) bullets.splice(i, 1);
      }

      // --- RENDER ---
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)'; // Trail effect
      ctx.fillRect(0, 0, width, height);

      // Draw Boss
      ctx.save();
      ctx.translate(boss.x, boss.y);
      ctx.rotate(boss.angle);
      ctx.fillStyle = boss.color;
      ctx.shadowBlur = 30;
      ctx.shadowColor = boss.color;
      ctx.beginPath();
      // Draw Polygon (Hexagon)
      for (let i = 0; i < 6; i++) {
          ctx.lineTo(boss.radius * Math.cos(i * Math.PI / 3), boss.radius * Math.sin(i * Math.PI / 3));
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Draw Player
      ctx.fillStyle = player.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Bullets
      bullets.forEach(b => {
          ctx.fillStyle = b.color;
          ctx.shadowBlur = 5;
          ctx.shadowColor = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
      });

      // Draw Shots
      ctx.fillStyle = '#60a5fa';
      ctx.shadowColor = '#60a5fa';
      shots.forEach(s => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();
      });

      requestRef.current = requestAnimationFrame(() => animate(Date.now()));
    };

    requestRef.current = requestAnimationFrame(() => animate(Date.now()));

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(requestRef.current);
    };
  }, [difficulty]); // Re-init if diff changes, though usually boss fight is one scene

  return (
    <>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {/* Boss HP Bar UI overlay */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
            <div 
                className="h-full bg-red-500 transition-all duration-75 ease-linear"
                style={{ width: `${(bossHp / maxHp) * 100}%` }}
            />
        </div>
    </>
  );
};

export default BossFight;