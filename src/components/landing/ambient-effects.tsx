'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* ─── Premium ease curves ─── */
const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── PARTICLE FIELD — Canvas-based ambient particles ─── */
/* ═══════════════════════════════════════════════════════════════════ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min(60, Math.floor((width * height) / 25000));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
        life: Math.random() * 1000,
        maxLife: 1000 + Math.random() * 2000,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach((p) => {
        p.life += 1;
        if (p.life > p.maxLife) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.life = 0;
        }

        // Subtle mouse influence
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200 * 0.01;
          p.vx += dx * force * 0.01;
          p.vy += dy * force * 0.01;
        }

        // Dampen velocity
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Life-based opacity breathing
        const lifeRatio = p.life / p.maxLife;
        const breathe = Math.sin(lifeRatio * Math.PI);
        const alpha = p.opacity * breathe;

        if (alpha > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── AMBIENT ORBS — Floating emerald glows ─── */
/* ═══════════════════════════════════════════════════════════════════ */

const orbs = [
  { size: 900, opacity: 0.04, x: '-10%', y: '-5%', delay: 0, duration: 14 },
  { size: 700, opacity: 0.03, x: '60%', y: '10%', delay: 3, duration: 18 },
  { size: 500, opacity: 0.025, x: '25%', y: '60%', delay: 6, duration: 16 },
  { size: 600, opacity: 0.02, x: '70%', y: '50%', delay: 9, duration: 20 },
];

export function AmbientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, rgba(16,185,129,${orb.opacity}) 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.04, 1],
            x: [0, 15, -10, 0],
            y: [0, -10, 15, 0],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── CURSOR GLOW — Mouse-following emerald glow ─── */
/* ═══════════════════════════════════════════════════════════════════ */

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04] transition-opacity duration-700"
      style={{
        background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── BACKGROUND GRADIENT — Animated shifting gradient ─── */
/* ═══════════════════════════════════════════════════════════════════ */

export function BackgroundGradient() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.4)_70%)]" />

      {/* Animated gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.05) 0%, transparent 50%)',
            'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.03) 0%, transparent 50%)',
            'radial-gradient(ellipse at 70% 30%, rgba(20,184,166,0.04) 0%, transparent 50%)',
            'radial-gradient(ellipse at 40% 50%, rgba(16,185,129,0.05) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── MOUSE PARALLAX — Wrapper for parallax elements ─── */
/* ═══════════════════════════════════════════════════════════════════ */

export function MouseParallax({
  children,
  factor = 0.02,
  className,
}: {
  children: React.ReactNode;
  factor?: number;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) * factor);
    mouseY.set((e.clientY - centerY) * factor);
  }, [factor, mouseX, mouseY]);

  useEffect(() => {
    const unsubscribeX = mouseX.on('change', (v) => x.set(v));
    const unsubscribeY = mouseY.on('change', (v) => y.set(v));
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, x, y]);

  return (
    <motion.div
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      className={className}
    >
      {children}
    </motion.div>
  );
}
