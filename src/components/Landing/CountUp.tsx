import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  start?: number;
}

export function CountUp({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
  start = 0
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (hasAnimated || !countRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = Date.now();
          const startValue = start;
          const endValue = end;
          let animationFrameId: number;

          const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = startValue + (endValue - startValue) * easeOutQuart;

            setCount(currentCount);

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(animate);
            } else {
              setCount(endValue);
            }
          };

          animationFrameId = requestAnimationFrame(animate);

          // Cleanup function
          return () => {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
          };
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    i