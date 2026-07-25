'use client';

import { useEffect } from 'react';
import {
  useMotionValue,
  useSpring,
  useTransform,
  motion,
} from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, {
    duration: 1000,
    bounce: 0,
    stiffness: 80,
    damping: 20,
  });
  const display = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    motionVal.set(value);
  }, [motionVal, value]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}
