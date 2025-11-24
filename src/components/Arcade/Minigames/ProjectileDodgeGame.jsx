import React, { useEffect, useRef } from 'react';

const ProjectileDodgeGame = ({ onComplete, difficulty }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const startTimeRef = useRef(Date.now());
  
  // Input State
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false });

  const duration = 6000 + (difficulty * 500);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    let player = { x: width / 2, y: height / 2, radius: 10, speed: 6 };

    // Bullets
    let bullets = [];
    const bulletSpeed = 4 + (difficulty * 0.5);
    const spawnRate = Math.max(100, 500 - (difficulty * 30)); 
    let lastSpawn = 0;

    const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
    
    const handleKeyDown = (e) => { if (keys.current.hasOwnProperty(e.key)) { keys.current[e.key] = true; } };
    const handleKeyUp = (e) => { if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = elapsed / duration;

      if (progress >= 1) {
          onComplete(true, 15);
          return;
      }

      // --- PLAYER MOVEMENT ---
      if (keys.current.ArrowUp || keys.current.w) player.y -= player.speed;
      if (keys.current.ArrowDown || keys.current.s) player.y += player.speed;
      if (keys.current.ArrowLeft || keys.current.a) player.x -= player.speed;
      if (keys.current.ArrowRight || keys.current.d) player.x += player.speed;
      
      player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, width, height);

      if (now - lastSpawn > spawnRate) {
          const side = Math.floor(Math.random() * 4); 
          let bx, by, vx, vy;
          
          if (side === 0) { bx = Math.random() * width; by = -10; }
          else if (side === 1) { bx = width + 10; by = Math.random() * height; }
          else if (side === 2) { bx = Math.random() * width; by = height + 10; }
          else { bx = -10; by = Math.random() * height; }

          const angle = Math.atan2(player.y - by, player.x - bx);
          vx = Math.cos(angle) * bulletSpeed;
          vy = Math.sin(angle) * bulletSpeed;

          bullets.push({ x: bx, y: by, vx, vy });
          lastSpawn = now;
      }

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
              onComplete(false);
              return;
          }

          if (b.x < -50 || b.x > width + 50 || b.y < -50 || b.y > height + 50) {
              bullets.splice(i, 1);
          }
      }
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, height - 5, width * (1 - progress), 5);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [difficulty]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default ProjectileDodgeGame;