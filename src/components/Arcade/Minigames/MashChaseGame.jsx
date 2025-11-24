    import React, { useEffect, useRef } from 'react';

    const MashChaseGame = ({ onComplete, difficulty }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const startTimeRef = useRef(Date.now());
    
    // Input State
    const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false });

    const duration = 5000 + (difficulty * 250); 

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        // Player
        let player = { x: width / 2, y: height / 2, radius: 15, speed: 9 };
        
        // Background "Rain"
        const bgParticles = Array.from({ length: 50 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 0.5 + Math.random() * 2,
            size: 1 + Math.random(),
            opacity: 0.1 + Math.random() * 0.3
        }));

        // Enemy
        let enemy = {
            x: Math.random() < 0.5 ? -50 : width + 50,
            y: Math.random() * height,
            radius: 25,
            trail: []
        };
        
        const baseSpeed = 4 + (difficulty * 0.6); 

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

        const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = elapsed / duration;

        if (progress >= 1) {
            onComplete(true, 10);
            return;
        }

        ctx.fillStyle = 'rgba(2, 6, 23, 0.4)'; 
        ctx.fillRect(0, 0, width, height);

        // Background Rain
        ctx.fillStyle = '#94a3b8';
        bgParticles.forEach(p => {
            p.y += p.speed;
            if(p.y > height) p.y = -5;
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
        
        // --- PLAYER MOVEMENT ---
        if (keys.current.ArrowUp || keys.current.w) player.y -= player.speed;
        if (keys.current.ArrowDown || keys.current.s) player.y += player.speed;
        if (keys.current.ArrowLeft || keys.current.a) player.x -= player.speed;
        if (keys.current.ArrowRight || keys.current.d) player.x += player.speed;
        
        // Clamp
        player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

        // --- ENEMY LOGIC ---
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 0) {
            enemy.x += (dx / dist) * baseSpeed;
            enemy.y += (dy / dist) * baseSpeed;
        }

        enemy.trail.push({ x: enemy.x, y: enemy.y });
        if (enemy.trail.length > 20) enemy.trail.shift();

        // Collision
        if (dist < player.radius + enemy.radius) { 
            onComplete(false);
            return;
        }

        // Draw Enemy
        enemy.trail.forEach((pos, i) => {
            const size = (i / enemy.trail.length) * enemy.radius;
            const alpha = i / enemy.trail.length;
            ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.5})`; 
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI*2);
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444'; 
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ef4444';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Text
        ctx.font = '700 24px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText("RUN!", width/2, 100);

        // Timer
        const barWidth = width * (1 - progress);
        ctx.fillStyle = '#38bdf8';
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
    }, [difficulty]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
    };

    export default MashChaseGame;