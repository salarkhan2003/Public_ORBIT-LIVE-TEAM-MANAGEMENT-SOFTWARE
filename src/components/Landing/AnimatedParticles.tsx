import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface AnimatedParticlesProps {
  particleCount?: number;
  color?: string;
  className?: string;
}

export function AnimatedParticles({
  particleCount = 25, // Reduced from 50
  color = '#4F46E5',
  className = ''
}: AnimatedParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerf, setIsLowPerf] = useState(false);

  useEffect(() => {
    // Detect mobile device and performance
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check for low performance device
    const checkPerformance = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isLowEnd = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      setIsLowPerf(isLowEnd);
    };

    checkMobile();
    checkPerformance();
    window.addEventListener('resize', checkMobile, { passive: true });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true // Better performance
    });
    if (!ctx) return;

    // Adjust particle count based on device
    const adjustedCount = isMobile ? Math.floor(particleCount / 4) : isLowPerf ? Math.floor(particleCount / 2) : particleCount;

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < adjustedCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3, // Reduced speed
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.2,
        });
      }
    };

    let frameCount = 0;
    const animate = (currentTime: number) => {
      // Throttle to 30 FPS on mobile for better performance
      const targetFPS = isMobile || isLowPerf ? 30 : 60;
      const fpsInterval = 1000 / targetFPS;

      if (currentTime - lastFrameTimeRef.current < fpsInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTimeRef.current = currentTime;
      frameCount++;

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.offsetWidth;
        if (particle.x > canvas.offsetWidth) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.offsetHeight;
        if (particle.y > canvas.offsetHeight) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Draw connections less frequently and only on desktop
        if (!isMobile && !isLowPerf && frameCount % 2 === 0) {
          particlesRef.current.slice(i + 1).forEach((otherParticle) => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) { // Reduced from 120
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              const opacity = (1 - distance / 100) * 0.1;
              ctx.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    const resizeHandler = () => requestAnimationFrame(resizeCanvas);
    window.addEventListener('resize', resizeHandler, { passive: true });
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('resize', checkMobile);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, color, isMobile, isLowPerf]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity: isMobile ? 0.3 : 0.5 }}
    />
  );
}
