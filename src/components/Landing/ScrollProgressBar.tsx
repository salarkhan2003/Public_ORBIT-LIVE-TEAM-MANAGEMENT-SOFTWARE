      style={{
        scaleX,
        opacity: isScrolling ? 1 : 0.7,
        willChange: 'transform'
      }}
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEff