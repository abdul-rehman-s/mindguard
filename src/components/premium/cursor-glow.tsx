'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const CURSOR_SIZE = 16;
const GLOW_SIZE = 32;

export function CursorGlow() {
  const [visible, setVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [isDesktopPointer, setIsDesktopPointer] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const glowX = useMotionValue(-100);
  const glowY = useMotionValue(-100);
  const clickScale = useMotionValue(1);

  const springConfig = { damping: 28, stiffness: 400, mass: 0.5 };
  const cursorSpringX = useSpring(cursorX, springConfig);
  const cursorSpringY = useSpring(cursorY, springConfig);
  const glowSpringX = useSpring(glowX, { damping: 20, stiffness: 250, mass: 0.8 });
  const glowSpringY = useSpring(glowY, { damping: 20, stiffness: 250, mass: 0.8 });
  const scaleSpring = useSpring(clickScale, { damping: 20, stiffness: 500 });

  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Listen for prefers-reduced-motion changes
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);

    // Listen for desktop pointer changes
    const pointerMq = window.matchMedia('(pointer: fine)');
    const onPointerChange = (e: MediaQueryListEvent) => setIsDesktopPointer(e.matches);
    pointerMq.addEventListener('change', onPointerChange);

    // Touch devices and reduced motion users should not see cursor glow
    if (!isDesktopPointer || reducedMotion) return;

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleDown = () => {
      clickScale.set(0.85);
      setTimeout(() => clickScale.set(1), 100);
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, a, [role="button"], input, select, textarea, [tabindex], label, .cursor-pointer');
      setIsPointer(!!isClickable);
    };

    const animateGlow = () => {
      glowX.set(posRef.current.x);
      glowY.set(posRef.current.y);
      rafRef.current = requestAnimationFrame(animateGlow);
    };
    rafRef.current = requestAnimationFrame(animateGlow);

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mousedown', handleDown, { passive: true });
    document.addEventListener('mouseover', handleOver, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
      mq.removeEventListener('change', onChange);
      pointerMq.removeEventListener('change', onPointerChange);
    };
  }, [cursorX, cursorY, glowX, glowY, clickScale, visible, isDesktopPointer, reducedMotion]);

  // Don't render on touch devices or when reduced motion is preferred
  if (!isDesktopPointer || reducedMotion) return null;

  return (
    <>
      {/* Only hide default cursor on desktop pointer devices, restore for accessibility */}
      <style>{`
        @media (pointer: fine) and (not (prefers-reduced-motion: reduce)) {
          * { cursor: none !important; }
        }
        @media (pointer: coarse) { * { cursor: auto !important; } }
        @media (prefers-reduced-motion: reduce) { * { cursor: auto !important; } }
      `}</style>

      <AnimatePresence>
        {visible && (
          <>
            <motion.div
              className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
              style={{
                x: glowSpringX,
                y: glowSpringY,
                width: GLOW_SIZE,
                height: GLOW_SIZE,
                translateX: '-50%',
                translateY: '-50%',
              }}
              animate={{
                scale: isPointer ? 1.5 : 1,
                opacity: isPointer ? 0.15 : 0.08,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              aria-hidden="true"
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, transparent 70%)',
                  filter: 'blur(4px)',
                }}
              />
            </motion.div>

            <motion.div
              className="pointer-events-none fixed top-0 left-0 z-[10000]"
              style={{
                x: cursorSpringX,
                y: cursorSpringY,
                translateX: '-50%',
                translateY: '-50%',
                scale: scaleSpring,
              }}
              animate={{
                width: isPointer ? CURSOR_SIZE * 1.4 : CURSOR_SIZE,
                height: isPointer ? CURSOR_SIZE * 1.4 : CURSOR_SIZE,
                opacity: 1,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              aria-hidden="true"
            >
              <div
                className="h-full w-full rounded-full border border-white/60 transition-colors duration-150"
                style={{
                  background: isPointer
                    ? 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.08) 100%)'
                    : 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(1px)',
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
