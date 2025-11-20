import React from 'react';
import type { HTMLMotionProps, Variants } from 'framer-motion';

type MotionComponentProps = HTMLMotionProps<keyof JSX.IntrinsicElements> & {
  children?: React.ReactNode;
  variants?: Variants;
  initial?: string | boolean | Variants;
  animate?: string | string[] | Variants;
  exit?: string | Variants;
  whileHover?: Variants | (() => Variants);
  whileTap?: Variants | (() => Variants);
  custom?: any;
};

const createMotionComponent = (tag: keyof JSX.IntrinsicElements) => {
  return React.forwardRef<HTMLElement, MotionComponentProps>(({ children, ...props }, ref) => {
    return React.createElement(tag, { ref, ...props }, children);
  });
};

export const motion = {
  div: createMotionComponent('div'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  p: createMotionComponent('p'),
  span: createMotionComponent('span'),
  button: createMotionComponent('button'),
  section: createMotionComponent('section'),
  // Add other motion components as needed
};

export const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const motionValue = <T,>(initial: T) => ({
  get: () => initial,
  set: (value: T) => { initial = value; },
  onChange: (callback: (latest: T) => void) => {
    // Simple mock for onChange
    return () => {};
  },
  getVelocity: () => 0,
  isAnimating: () => false,
  on: () => () => {},
  stop: () => {},
  updateAndNotify: (v: T) => { initial = v; },
});

export const useAnimation = () => ({
  start: async (): Promise<any> => {},
  set: (v: any) => {},
  startInView: async () => {},
  stop: () => {},
});

export const useInView = () => [false, false] as const;

export const useScroll = () => ({
  scrollX: motionValue(0),
  scrollY: motionValue(0),
  scrollXProgress: motionValue(0),
  scrollYProgress: motionValue(0),
});

export const useTransform = <T,>(value: any, input: any, output: any): T => {
  return output[0];
};

export const spring = (value: any, config?: any) => value;

export const animate = async (from: any, to: any, options?: any) => {
  return new Promise((resolve) => {
    if (typeof to === 'function') {
      to(from);
    }
    resolve();
  });
};

export default {
  motion,
  AnimatePresence,
  motionValue,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
  spring,
  animate,
};
