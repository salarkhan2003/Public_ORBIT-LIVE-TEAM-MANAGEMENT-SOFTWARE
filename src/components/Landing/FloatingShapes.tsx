import { useEffect, useRef, useState } from 'react';

interface FloatingShapesProps {
  shapeCount?: number;
  color?: string;
  className?: string;
}

export function FloatingShapes({
  shapeCount = 8,
  color = '#4F46E5',
  className = ''
}: FloatingShapesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();

    const container = containerRef.current;
    if (!container) return;

    // Clear existing shapes
    container.innerHTML = '';

    // Reduce shape count on mobile
    const adjustedCount = isMobile ? Math.floor(shapeCount / 2) : shapeCount;

    // Create shapes
    for (let i = 0; i < adjustedCount; i++) {
      const shape = document.createElement('div');
      const size = Math.random() * 100 + 50;
      const isCircle = Math.random() > 0.5;

      shape.style.position = 'absolute';
      shape.style.width = `${size}px`;
      shape.style.height = `${size}px`;
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`;
      shape.style.background = `linear-gradient(135deg, ${color}33, ${color}11)`;
      shape.style.borderRadius = isCircle ? '50%' : `${Math.random() * 30}%`;
      shape.style.filter = 'blur(40px)';
      shape.style.opacity = isMobile ? '0.3' : '0.4';
      shape.style.animation = `floatShape ${20 + Math.random() * 10}s ease-in-out infinite`;
      shape.style.animationDelay = `${Math.random() * 5}s`;
      shape.style.willChange = 'transform';

      container.appendChild(shape);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatShape {
        0%, 100% {
          transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
        }
        25% {
          transform: translate3d(30px, -30px, 0) rotate(90deg) scale(1.1);
        }
        50% {
          transform: translate3d(-20px, 20px, 0) rotate(180deg) scale(0.9);
        }
        75% {
          transform: translate3d(40px, 10px, 0) rotate(270deg) scale(1.05);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [shapeCount, color, isMobile]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    />
  );
}
