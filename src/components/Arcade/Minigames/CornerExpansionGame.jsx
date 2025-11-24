import React, { useEffect, useRef, useState } from 'react';

const CornerExpansionGame = ({ onComplete, difficulty }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const startTimeRef = useRef(Date.now());
  
  // Input State
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false });
  
  // Difficulty Logic
  const maxExpansion = 0.4 + (Math.min(difficulty, 20) * 0.02); 
  const duration = 5000;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Player
    let player = { x: width/2, y: height/2, radius: 8, speed: 10 };

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    const handleKeyDown = (e) => {
       if (keys.current.hasOwnProperty(e.key)) {
           keys.current[e.key] = true;
       }
    };
    
    const handleKeyUp = (e) => {
       if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false;
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    const corners = [
        { color: '#06b6d4', x: 0, y: 0 },         
        { color: '#a855f7', x: width, y: 0 },     
        { color: '#ec4899', x: 0, y: height },    
        { color: '#10b981', x: width, y: height } 
    ];

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = elapsed / duration;

      if (progress >= 1) {
          onComplete(true, 20); 
          return;
      }

      // --- PLAYER MOVEMENT ---
      if (keys.current.ArrowUp || keys.current.w) player.y -= player.speed;
      if (keys.current.ArrowDown || keys.current.s) player.y += player.speed;
      if (keys.current.ArrowLeft || keys.current.a) player.x -= player.speed;
      if (keys.current.ArrowRight || keys.current.d) player.x += player.speed;
      
      player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#020617'; 
      ctx.fillRect(0, 0, width, height);

      const freq = 0.002 + (progress * 0.004);
      const pulse = Math.abs(Math.sin(elapsed * freq));
      const baseRadius = Math.max(width, height) * (0.2 + (progress * 0.3));
      const currentRadius = baseRadius + (pulse * 100);

      let collision = false;
      ctx.globalCompositeOperation = 'screen'; 
      
      corners.forEach(corner => {
        if (corner.x > 1) corner.x = width;
        if (corner.y > 1) corner.y = height;

        ctx.beginPath();
        ctx.arc(corner.x, corner.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = corner.color;
        ctx.globalAlpha = 0.6;
        ctx.shadowBlur = 50;
        ctx.shadowColor = corner.color;
        ctx.fill();

        const dx = player.x - corner.x;
        const dy = player.y - corner.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < currentRadius - 10) {
            collision = true;
        }
      });
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;

      if (collision) {
          onComplete(false);
          return;
      }

      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffff';
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.font = '700 24px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText("STAY SAFE", width/2, height/2 - 40);

      const barWidth = width * (1 - progress);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, height - 6, barWidth, 6);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
  );
};

export default CornerExpansionGame;