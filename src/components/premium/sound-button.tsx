'use client';

import { useCallback, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { playTap } from '@/lib/sounds';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  sound?: boolean;
}

export function PremiumButton({ children, sound = true, onClick, className = '', ...props }: PremiumButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (sound) playTap();
    onClick?.(e);
  }, [onClick, sound]);

  return (
    <motion.button
      ref={btnRef}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={handleClick}
      className={`transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
