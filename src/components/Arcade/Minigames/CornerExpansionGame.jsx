import React, { useEffect, useRef } from 'react';

const CornerExpansionGame = ({ onComplete, difficulty = 1, round = 1 }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const flashHistory = useRef([]);
  const isEnded = useRef(false);

  // Input State
  const keys = useRef({
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, a: false, s: false, d: false
  });

  const duration = 4500 + (difficulty * 200);

  // Safe zone speed scaling
  let safeZoneSpeed = 3;
  if (round < 5) safeZoneSpeed = 3.2;
  else if (round < 10) safeZoneSpeed = 4;
  else if (round < 15) safeZoneSpeed = 5;
  else if (round < 25) safeZoneSpeed = 6;
  else if (round < 35) safeZoneSpeed = 7;
  else if (round >= 45) safeZoneSpeed = 8;
  else safeZoneSpeed = 7;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // =========================
    // STAGES / TIMING (CLEAR)
    // =========================
    const SAFE_ZONE_START = 2000;     // safe zone becomes active + drawn + starts moving
    const PRE_CAP_START = 1750;       // gentle “don’t overshoot” blending shortly before safe zone appears
    const CLOSE_IN_START = SAFE_ZONE_START; // ✅ all corners start closing in together
    const CLOSE_IN_TIME = 1200;       // time to fully “lock” to the safe zone boundary
    const SAFE_GAP = 10;              // buffer so danger zones never enter safe zone
    const RADIUS_SMOOTH = 0.22;       // smoothing for stable visuals

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const smoothstep01 = (t) => t * t * (3 - 2 * t);

    // Reset
    startTimeRef.current = Date.now();
    isEnded.current = false;

    let width = window.innerWidth;
    let height = window.innerHeight;

    let player = { x: width / 2, y: height / 2, radius: 8, speed: 10 };

    // Safe zone initial offset
    const offsetAngle = Math.random() * Math.PI * 2;
    const offsetDist = Math.min(width, height) * 0.25;
    let safeZone = {
      x: width / 2 + Math.cos(offsetAngle) * offsetDist,
      y: height / 2 + Math.sin(offsetAngle) * offsetDist,
      radius: 100,
      angle: Math.random() * Math.PI * 2,
      speed: 2
    };

    // Corner factory: each corner keeps a smoothed render radius (r)
    const createCorner = (id, x, y, color) => ({
      id,
      color,
      x,
      y,
      speed: 0.005 + Math.random() * 0.005,
      offset: Math.random() * Math.PI * 2,

      flashIntensity: 0,
      flashDecay: 0.1,
      remainingFlashes: 0,

      r: 0,
      rInit: false,
    });

    const corners = [
      createCorner('TL', 0, 0, '#06b6d4'),
      createCorner('TR', width, 0, '#a855f7'),
      createCorner('BL', 0, height, '#ec4899'),
      createCorner('BR', width, height, '#10b981')
    ];

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleKeyDown = (e) => {
      if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    // Max radius that stays OUTSIDE safe zone (with gap)
    const capRadiusToSafeZone = (cornerX, cornerY) => {
      const dx = safeZone.x - cornerX;
      const dy = safeZone.y - cornerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return Math.max(0, dist - safeZone.radius - SAFE_GAP);
    };

    const endGame = (win) => {
      if (isEnded.current) return;
      isEnded.current = true;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
      onComplete(win, win ? 20 : undefined);
    };

    const animate = () => {
      if (isEnded.current) return;

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = elapsed / duration;

      if (progress >= 1) {
        endGame(true);
        return;
      }

      // =========================
      // STAGE FLAGS
      // =========================
      const safeZoneActive = elapsed >= SAFE_ZONE_START;

      // gentle pre-cap blend (to avoid a pop right when safe zone appears)
      const preCapBlend = smoothstep01(
        clamp01((elapsed - PRE_CAP_START) / (SAFE_ZONE_START - PRE_CAP_START))
      );

      // ✅ global close-in blend (all corners together)
      const closeInBlend = safeZoneActive
        ? smoothstep01(clamp01((elapsed - CLOSE_IN_START) / CLOSE_IN_TIME))
        : 0;

      // =========================
      // LOGIC: flash throttling
      // =========================
      flashHistory.current = flashHistory.current.filter(t => now - t < 500);

      // =========================
      // LOGIC: safe zone movement
      // =========================
      if (safeZoneActive) {
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

      // =========================
      // LOGIC: player movement
      // =========================
      if (keys.current.ArrowUp || keys.current.w) player.y -= player.speed;
      if (keys.current.ArrowDown || keys.current.s) player.y += player.speed;
      if (keys.current.ArrowLeft || keys.current.a) player.x -= player.speed;
      if (keys.current.ArrowRight || keys.current.d) player.x += player.speed;

      player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

      // =========================
      // RENDER: background
      // =========================
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // =========================
      // RENDER: danger spheres
      // =========================
      let collision = false;
      ctx.globalCompositeOperation = 'screen';

      corners.forEach(corner => {
        // pin corners to edges
        if (corner.id === 'TR' || corner.id === 'BR') corner.x = width;
        if (corner.id === 'BL' || corner.id === 'BR') corner.y = height;

        // 1) raw “breathing” radius
        const baseGrowth = Math.max(width, height) * (0.25 + (progress * 0.35));
        const pulse = Math.sin(elapsed * corner.speed + corner.offset);
        const breathingAmount = 80 + (progress * 70);
        const rawRadius = Math.max(0, baseGrowth + (pulse * breathingAmount));

        // 2) target cap (only meaningful once we start caring about safe zone)
        const cap = capRadiusToSafeZone(corner.x, corner.y);

        // 3) desired radius by stage
        let desiredRadius = rawRadius;

        // Pre-cap (just before safe zone appears): gently prevent overshoot WITHOUT changing normal motion much
        if (!safeZoneActive && preCapBlend > 0) {
          if (desiredRadius > cap) {
            desiredRadius = desiredRadius + (cap - desiredRadius) * preCapBlend;
          }
        }

        // After safe zone active: ✅ ALWAYS close in together (blend toward cap regardless of pulse)
        if (safeZoneActive) {
          desiredRadius = desiredRadius + (cap - desiredRadius) * closeInBlend;
          // Hard guarantee: never exceed cap once safe zone is active
          if (desiredRadius > cap) desiredRadius = cap;
        }

        // 4) smooth the rendered radius (stable visuals)
        if (!corner.rInit) {
          corner.r = desiredRadius;
          corner.rInit = true;
        } else {
          corner.r = corner.r + (desiredRadius - corner.r) * RADIUS_SMOOTH;

          // Hard guarantee post-safe-zone: never render inside safe zone
          if (safeZoneActive && corner.r > cap) corner.r = cap;
        }

        // Flash logic
        if (corner.flashIntensity > 0) {
          corner.flashIntensity -= corner.flashDecay;
          if (corner.flashIntensity <= 0 && corner.remainingFlashes > 0) {
            corner.flashIntensity = 1.0;
            corner.remainingFlashes--;
          }
        }

        if (Math.random() < 0.05 && flashHistory.current.length < 4 && corner.flashIntensity <= 0) {
          const typeRoll = Math.random();
          if (typeRoll < 0.6) {
            corner.flashIntensity = 1.0; corner.flashDecay = 0.1; corner.remainingFlashes = 0;
          } else if (typeRoll < 0.9) {
            corner.flashIntensity = 1.0; corner.flashDecay = 0.2; corner.remainingFlashes = 2;
          } else {
            corner.flashIntensity = 1.5; corner.flashDecay = 0.02; corner.remainingFlashes = 0;
          }
          flashHistory.current.push(now);
        }

        // Draw sphere
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, corner.r, 0, Math.PI * 2);
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

        // Collision check
        const dx = player.x - corner.x;
        const dy = player.y - corner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < corner.r - 10) collision = true;
      });

      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      if (collision) {
        endGame(false);
        return;
      }

      // =========================
      // RENDER: safe zone
      // =========================
      if (safeZoneActive) {
        ctx.beginPath();
        ctx.arc(safeZone.x, safeZone.y, safeZone.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // =========================
      // RENDER: player + HUD
      // =========================
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffff';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = '700 24px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText("AVOID THE ZONES", width / 2, height / 2 - 40);

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
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
      isEnded.current = true;
    };
  }, [difficulty, round, safeZoneSpeed, duration]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default CornerExpansionGame;