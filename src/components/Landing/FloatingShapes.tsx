import { useEffect, useRef, useState } from 'react';

interface FloatingShapesProps {
  shapeCount?: number;
  color?: string;
  className?: string;
}

export function FloatingShapes({
  shapeCount = 5, // Reduced from 8
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

    // Create shapes with better performance
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < adjustedCount; i++) {
      const shape = document.createElement('div');
      const size = Math.random() * 80 + 40; // Slightly smaller
      const isCircle = Math.random() > 0.5;

      shape.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: linear-gradient(135deg, ${color}22, ${color}08);
        border-radius: ${isCircle ? '50%' : `${Math.random() * 30}%`};
        filter: blur(30px);
        opacity: ${isMobile ? '0.2' : '0.3'};
        animation: floatShape${i} ${20 + Math.random() * 10}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
        will-change: transform;
        transform: translate3d(0, 0, 0);
      `;

      fragment.appendChild(shape);
    }

    container.appendChild(fragment);

    // Add optimized animation keyframes - create once
    if (!document.getElementById('floating-shapes-styles')) {
      const style = document.createElement('style');
      style.id = 'floating-shapes-styles';
      let keyframes = '';

      for (let i = 0; i < adjustedCount; i++) {
        const x1 = (Math.random() - 0.5) * 50;
        const y1 = (Math.random() - 0.5) * 50;
        const x2 = (Math.random() - 0.5) * 50;
        const y2 = (Math.random() - 0.5) * 50;

        keyframes += `
          @keyframes floatShape${i} {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            33% {
              transform: translate3d(${x1}px, ${y1}px, 0) scale(1.05);
            }
            66% {
              transform: translate3d(${x2}px, ${y2}px, 0) scale(0.95);
            }
          }
        `;
      }

      style.textContent = keyframes;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById('floating-shapes-styles');
      if (existingStyle && container.children.length === 0) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [shapeCount, color, isMobile]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ contain: 'layout style paint' }}
    />
  );
}
