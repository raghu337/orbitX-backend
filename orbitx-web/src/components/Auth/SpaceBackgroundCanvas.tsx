import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
}

interface Satellite {
  angle: number;
  distanceX: number;
  distanceY: number;
  speed: number;
  size: number;
  pulse: number;
  name: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export const SpaceBackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize Stars
    const starsCount = Math.min(Math.floor((width * height) / 3000), 250);
    const stars: Star[] = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
    }));

    // Initialize Floating Satellites
    const satellites: Satellite[] = [
      { angle: 0, distanceX: width * 0.38, distanceY: height * 0.22, speed: 0.003, size: 8, pulse: 0, name: 'ISRO-CARTOSAT-3' },
      { angle: Math.PI, distanceX: width * 0.42, distanceY: height * 0.28, speed: 0.002, size: 10, pulse: 0, name: 'NASA-ISS-ORBITER' },
    ];

    // Initialize Glowing Particles
    const particlesCount = 45;
    const particleColors = ['#06B6D4', '#7C3AED', '#3B82F6', '#60A5FA'];
    const particles: Particle[] = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2.5 + 1,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let earthRotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Base Background (#0B1020)
      const spaceGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      spaceGradient.addColorStop(0, '#0d152a');
      spaceGradient.addColorStop(0.5, '#0b1020');
      spaceGradient.addColorStop(1, '#05070e');
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic Nebula Swirls
      const nebula1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 20, width * 0.2, height * 0.3, 400);
      nebula1.addColorStop(0, 'rgba(124, 58, 237, 0.18)'); // Purple #7C3AED
      nebula1.addColorStop(0.6, 'rgba(30, 58, 138, 0.08)');  // Deep Blue
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 30, width * 0.8, height * 0.7, 450);
      nebula2.addColorStop(0, 'rgba(6, 182, 212, 0.16)');  // Cyan #06B6D4
      nebula2.addColorStop(0.7, 'rgba(11, 16, 32, 0.05)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // 3. Twinkling Stars
      stars.forEach((star) => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha <= 0.1 || star.alpha >= 0.95) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, star.alpha))})`;
        ctx.shadowBlur = star.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = '#06B6D4';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Earth in Space (Bottom Left Corner)
      const earthCenterX = width < 768 ? width * 0.15 : width * 0.18;
      const earthCenterY = height < 768 ? height * 0.85 : height * 0.82;
      const earthRadius = Math.min(width, height) * 0.18;

      // Earth Atmosphere Outer Glow
      const atmGlow = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius * 0.95,
        earthCenterX,
        earthCenterY,
        earthRadius * 1.3
      );
      atmGlow.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      atmGlow.addColorStop(0.5, 'rgba(30, 58, 138, 0.2)');
      atmGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = atmGlow;
      ctx.fill();

      // Earth Base Sphere
      const earthGradient = ctx.createRadialGradient(
        earthCenterX - earthRadius * 0.3,
        earthCenterY - earthRadius * 0.3,
        earthRadius * 0.1,
        earthCenterX,
        earthCenterY,
        earthRadius
      );
      earthGradient.addColorStop(0, '#1E3A8A');
      earthGradient.addColorStop(0.4, '#0F2B66');
      earthGradient.addColorStop(0.8, '#061333');
      earthGradient.addColorStop(1, '#020714');
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fillStyle = earthGradient;
      ctx.fill();

      // Earth Continents / Texture simulation with subtle moving noise
      earthRotation += 0.002;
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      for (let i = 0; i < 5; i++) {
        const cx = earthCenterX + Math.cos(earthRotation + i * 1.2) * (earthRadius * 0.4);
        const cy = earthCenterY + Math.sin(earthRotation * 0.8 + i * 0.9) * (earthRadius * 0.4);
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Earth Shadow Overlay (Terminator Line)
      const shadowGrad = ctx.createLinearGradient(
        earthCenterX - earthRadius,
        earthCenterY - earthRadius,
        earthCenterX + earthRadius,
        earthCenterY + earthRadius
      );
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(0.6, 'rgba(2, 7, 20, 0.7)');
      shadowGrad.addColorStop(1, 'rgba(2, 7, 20, 0.95)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(earthCenterX - earthRadius, earthCenterY - earthRadius, earthRadius * 2, earthRadius * 2);
      ctx.restore();

      // 5. Floating Satellites & Orbital Paths
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        sat.pulse = (sat.pulse + 0.05) % (Math.PI * 2);

        const satX = earthCenterX + Math.cos(sat.angle) * sat.distanceX;
        const satY = earthCenterY + Math.sin(sat.angle) * sat.distanceY;

        // Draw Elliptical Orbit Path
        ctx.beginPath();
        ctx.ellipse(earthCenterX, earthCenterY, sat.distanceX, sat.distanceY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Radio Waves / Pulse Beacon from Satellite
        const pulseRadius = sat.size + Math.sin(sat.pulse) * 8 + 4;
        ctx.beginPath();
        ctx.arc(satX, satY, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.6 - (pulseRadius / 20) * 0.4})`;
        ctx.stroke();

        // Draw Satellite Body (Futuristic Metallic Hexagon + Solar Arrays)
        ctx.save();
        ctx.translate(satX, satY);
        ctx.rotate(sat.angle + Math.PI / 2);

        // Solar Wings
        ctx.fillStyle = '#06B6D4';
        ctx.fillRect(-sat.size * 1.6, -2, sat.size * 1.1, 4);
        ctx.fillRect(sat.size * 0.5, -2, sat.size * 1.1, 4);

        // Satellite Main Core
        ctx.fillStyle = '#E2E8F0';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#06B6D4';
        ctx.fillRect(-sat.size * 0.4, -sat.size * 0.4, sat.size * 0.8, sat.size * 0.8);

        // Sensor Eye LED
        ctx.fillStyle = '#7C3AED';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 6. Floating Soft Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
