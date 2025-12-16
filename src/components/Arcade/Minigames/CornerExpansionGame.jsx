import React, { useEffect, useRef, useState } from 'react';

const CornerExpansionGame = ({ onComplete, difficulty = 1, round = 1 }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const startTimeRef = useRef(Date.now());
  const flashHistory = useRef([]); 
  const isEnded = useRef(false); // FIX: Track ended state to prevent double calls/loops

  // Input State
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false });
  
  const duration = 4500 + (difficulty * 200);

  // Safe Zone Speed
  let safeZoneSpeed = 4; 
  if (round >= 45) safeZoneSpeed = 8;
  else if (round >= 35) safeZoneSpeed = 7;
  else if (round >= 25) safeZoneSpeed = 6;
  else if (round >= 15) safeZoneSpeed = 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    startTimeRef.current = Date.now();

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    let player = { x: width/2, y: height/2, radius: 8, speed: 10 };

    const offsetAngle = Math.random() * Math.PI * 2;
    const offsetDist = Math.min(width, height) * 0.25;
    let safeZone = { 
      x: width/2 + Math.cos(offsetAngle) * offsetDist, 
      y: height/2 + Math.sin(offsetAngle) * offsetDist, 
      radius: 100,
      angle: Math.random() * Math.PI * 2,
      speed: 2
    };

    const corners = [
        { id: 'TL', color: '#06b6d4', x: 0, y: 0, speed: 0.005 + Math.random() * 0.005, offset: Math.random() * Math.PI * 2, flashIntensity: 0, flashDecay: 0.1, remainingFlashes: 0 },         
        { id: 'TR', color: '#a855f7', x: width, y: 0, speed: 0.005 + Math.random() * 0.005, offset: Math.random() * Math.PI * 2, flashIntensity: 0, flashDecay: 0.1, remainingFlashes: 0 },      
        { id: 'BL', color: '#ec4899', x: 0, y: height, speed: 0.005 + Math.random() * 0.005, offset: Math.random() * Math.PI * 2, flashIntensity: 0, flashDecay: 0.1, remainingFlashes: 0 },    
        { id: 'BR', color: '#10b981', x: width, y: height, speed: 0.005 + Math.random() * 0.005, offset: Math.random() * Math.PI * 2, flashIntensity: 0, flashDecay: 0.1, remainingFlashes: 0 } 
    ];

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    const handleKeyDown = (e) => { if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = true; };
    const handleKeyUp = (e) => { if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false; };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    const animate = () => {
      if (isEnded.current) return; // STOP LOOP if ended

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = elapsed / duration;

      if (progress >= 1) {
          isEnded.current = true;
          onComplete(true, 20); 
          return;
      }

      // --- LOGIC ---
      flashHistory.current = flashHistory.current.filter(t => now - t < 500);

      if (elapsed > 2000) {
        safeZone.x += Math.cos(safeZone.angle) * safeZoneSpeed;
        safeZone.y += Math.sin(safeZone.angle) * safeZoneSpeed;
        
        if (safeZone.x - safeZone.radius < 0 || safeZone.x + safeZone.radius > width) {
          safeZone.angle = Math.PI - safeZone.angle + (Math.random() - 0.5) * 0.5;
          safeZone.x = Math.max(safeZone.radius, Math.min(width - safeZone.radius, safeZone.x));
        }
        if (safeZone.y - safeZone.radius < 0 || safeZone.y + safeZone.radius > height) {
          safeZone.angle = -safeZone.angle + (Math.random() - 0.5) * 0.5;
          safeZone.y = Math.max(safeZone.radius, Math.min(height - safeZone.radius, safeZone.y));
        }
        if (Math.random() < 0.02) safeZone.angle += (Math.random() - 0.5) * 0.3;
      }

      if (keys.current.ArrowUp || keys.current.w) player.y -= player.speed;
      if (keys.current.ArrowDown || keys.current.s) player.y += player.speed;
      if (keys.current.ArrowLeft || keys.current.a) player.x -= player.speed;
      if (keys.current.ArrowRight || keys.current.d) player.x += player.speed;
      
      player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

      // --- RENDER ---
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#020617'; 
      ctx.fillRect(0, 0, width, height);

      let collision = false;
      ctx.globalCompositeOperation = 'screen'; 
      
      corners.forEach(corner => {
        if (corner.id === 'TR' || corner.id === 'BR') corner.x = width;
        if (corner.id === 'BL' || corner.id === 'BR') corner.y = height;

        const baseGrowth = Math.max(width, height) * (0.25 + (progress * 0.35));
        const pulse = Math.sin(elapsed * corner.speed + corner.offset); 
        const breathingAmount = 80 + (progress * 70); 
        let currentRadius = Math.max(0, baseGrowth + (pulse * breathingAmount));

        if (elapsed > 2000) {
          const dxToSafe = safeZone.x - corner.x;
          const dyToSafe = safeZone.y - corner.y;
          const distToSafe = Math.sqrt(dxToSafe * dxToSafe + dyToSafe * dyToSafe);
          const targetRadius = distToSafe - safeZone.radius;
          const easeProgress = Math.min(1, (elapsed - 2000) / 1000);
          const easedProgress = easeProgress * easeProgress * (3 - 2 * easeProgress);
          currentRadius = currentRadius + (targetRadius - currentRadius) * easedProgress;
        }

        // Flash Logic
        if (corner.flashIntensity > 0) {
            corner.flashIntensity -= corner.flashDecay; 
            if (corner.flashIntensity <= 0 && corner.remainingFlashes > 0) {
                corner.flashIntensity = 1.0;
                corner.remainingFlashes--;
            }
        }

        if (Math.random() < 0.05 && flashHistory.current.length < 4 && corner.flashIntensity <= 0) {
            const typeRoll = Math.random();
            if (typeRoll < 0.6) { corner.flashIntensity = 1.0; corner.flashDecay = 0.1; corner.remainingFlashes = 0; } 
            else if (typeRoll < 0.9) { corner.flashIntensity = 1.0; corner.flashDecay = 0.2; corner.remainingFlashes = 2; } 
            else { corner.flashIntensity = 1.5; corner.flashDecay = 0.02; corner.remainingFlashes = 0; }
            flashHistory.current.push(now);
        }

        ctx.beginPath();
        ctx.arc(corner.x, corner.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = corner.color;
        ctx.globalAlpha = 0.6;
        ctx.shadowBlur = 50;
        ctx.shadowColor = corner.color;
        ctx.fill();

        if (corner.flashIntensity > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = Math.min(1.0, corner.flashIntensity); 
            ctx.shadowBlur = 60 + (corner.flashIntensity * 20);
            ctx.shadowColor = '#ffffff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        const dx = player.x - corner.x;
        const dy = player.y - corner.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < currentRadius - 10 || dist < 100) { // 100 is safeZoneMin
            collision = true;
        }
      });
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;

      if (collision) {
          isEnded.current = true;
          onComplete(false);
          return;
      }

      if (elapsed > 2000) {
        ctx.beginPath();
        ctx.arc(safeZone.x, safeZone.y, safeZone.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
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
      ctx.fillText("AVOID THE ZONES", width/2, height/2 - 40);

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
      isEnded.current = true; // Ensure loop stops on unmount
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default CornerExpansionGame;