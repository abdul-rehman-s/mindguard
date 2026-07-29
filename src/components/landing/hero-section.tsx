'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useInView,
} from 'framer-motion';
import {
  ArrowRight,
  Target,
  Timer,
  Brain,
  Sparkles,
  Flame,
  Zap,
  CheckCircle2,
  CircleDot,
  TrendingUp,
  Star,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MindGuardHeroLogo } from '@/components/branding/mindguard-logo';
import { AuthExperience } from '@/components/auth/auth-experience';

/* ─── Premium ease curves ─── */
const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ─── AI Coach Messages ─── */
const coachMessages = [
  { text: 'Your focus peaks at 9–11am. Start your mission then.' },
  { text: '3-day streak! You\'re 40% more productive when consistent.' },
  { text: 'Try a 45-min session today — it matches your best blocks.' },
  { text: 'You\'ve been in deep work for 32 min. Keep going.' },
];

/* ─── Rotating Mission Texts ─── */
const missionTexts = [
  'Ship dashboard redesign',
  'Write launch announcement',
  'Review Q3 roadmap',
  'Prepare investor update',
  'Design onboarding flow',
];

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── BREATHING ORB — The central emerald light source ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function BreathingOrb({ size = 'large' }: { size?: 'large' | 'small' }) {
  const sizes = {
    large: { outer: 600, mid: 400, inner: 160 },
    small: { outer: 300, mid: 200, inner: 80 },
  };
  const s = sizes[size];

  return (
    <div className="relative flex items-center justify-center" style={{ width: s.outer, height: s.outer }}>
      {/* Outer glow — the ambient light */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s.outer,
          height: s.outer,
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.015) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Mid glow — the core warmth */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s.mid,
          height: s.mid,
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(20,184,166,0.03) 50%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.85, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />

      {/* Inner core — the pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s.inner,
          height: s.inner,
          background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, rgba(16,185,129,0.06) 50%, transparent 70%)',
          filter: 'blur(1px)',
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Light rays */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s.outer * 1.2,
          height: s.outer * 1.2,
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.02) 30deg, transparent 60deg, rgba(20,184,166,0.015) 120deg, transparent 150deg, rgba(16,185,129,0.02) 240deg, transparent 270deg, rgba(20,184,166,0.015) 330deg, transparent 360deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── FLOATING GLASS CARD — Parallax-aware card ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function FloatingCard({
  children,
  className,
  delay = 0,
  mouseX,
  mouseY,
  parallaxFactor = 0.02,
  floatDuration = 6,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  parallaxFactor?: number;
  floatDuration?: number;
}) {
  const x = useSpring(useTransform(mouseX, (v: number) => v * parallaxFactor), {
    stiffness: 80,
    damping: 20,
  });
  const y = useSpring(useTransform(mouseY, (v: number) => v * parallaxFactor), {
    stiffness: 80,
    damping: 20,
  });

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: [0, -6, 0],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 1, ease: APPLE_EASE, delay },
        y: { duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 },
        scale: { duration: 1, ease: APPLE_EASE, delay },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── CIRCULAR TIMER RING — Animated SVG timer ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function CircularTimerRing({
  progress,
  minutes,
  seconds,
}: {
  progress: number;
  minutes: number;
  seconds: number;
}) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="url(#heroTimerGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="url(#heroTimerGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          opacity={0.12}
          filter="blur(4px)"
          style={{ pointerEvents: 'none' }}
        />
        <defs>
          <linearGradient id="heroTimerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold tabular-nums text-zinc-100">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">deep focus</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── HERO PRODUCT VISUALIZATION — Living product cards ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function HeroProductVisualization() {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [coachIndex, setCoachIndex] = useState(0);
  const [missionIndex, setMissionIndex] = useState(0);
  const [achievementVisible, setAchievementVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev >= 2700) {
          setMissionComplete(true);
          return 2700;
        }
        return prev + 3;
      });
    }, 100);
    const streakInterval = setInterval(() => {
      setStreakCount((prev) => {
        if (prev >= 12) return 12;
        return prev + 1;
      });
    }, 800);
    const coachInterval = setInterval(() => {
      setCoachIndex((prev) => (prev + 1) % coachMessages.length);
    }, 4000);
    const missionInterval = setInterval(() => {
      setMissionIndex((prev) => (prev + 1) % missionTexts.length);
    }, 6000);
    const achievementTimeout = setTimeout(() => {
      setAchievementVisible(true);
    }, 3500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(streakInterval);
      clearInterval(coachInterval);
      clearInterval(missionInterval);
      clearTimeout(achievementTimeout);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) * 0.1);
      mouseY.set((e.clientY - centerY) * 0.1);
    },
    [mouseX, mouseY],
  );

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const progressPercent = (timerSeconds / 2700) * 100;

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {/* Ambient glow behind */}
      <div className="pointer-events-none absolute inset-0 -m-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-teal-500/[0.04] blur-[100px]" />
      </div>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {/* ── Timer Card (large, prominent) ── */}
        <FloatingCard mouseX={mouseX} mouseY={mouseY} parallaxFactor={0.015} delay={0.2} className="sm:col-span-2" floatDuration={8}>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-zinc-300">MindGuard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-zinc-700/60" />
                <div className="h-2 w-2 rounded-full bg-zinc-700/60" />
                <div className="h-2 w-2 rounded-full bg-zinc-700/60" />
              </div>
            </div>
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
              <CircularTimerRing progress={progressPercent} minutes={minutes} seconds={seconds} />
              <div className="flex-1 space-y-4 w-full">
                {/* Mission */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/20">
                        <Target className="h-3 w-3 text-emerald-400" />
                      </div>
                      <span className="text-xs font-medium text-zinc-400">Today&apos;s Mission</span>
                    </div>
                    {missionComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <CircleDot className="h-4 w-4 text-zinc-600" />
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={missionIndex}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3, ease: APPLE_EASE }}
                      className="text-sm text-zinc-200 font-medium"
                    >
                      {missionComplete ? `${missionTexts[0]} ✦` : missionTexts[missionIndex]}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-xs text-zinc-500 mt-1">
                    {missionComplete ? 'Mission complete — 45 min deep work' : 'Focus session active'}
                  </p>
                </div>

                {/* Streak */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-zinc-400">Current Streak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">{streakCount} days</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={i < streakCount ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0.3 }}
                        transition={{ delay: i * 0.04, duration: 0.3, ease: APPLE_EASE }}
                        className={cn(
                          'h-4 w-4 rounded',
                          i < streakCount ? 'bg-emerald-500/25 ring-1 ring-emerald-500/20' : 'bg-zinc-800/50',
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FloatingCard>

        {/* ── AI Coach Message ── */}
        <FloatingCard mouseX={mouseX} mouseY={mouseY} parallaxFactor={0.025} delay={0.4} floatDuration={7}>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06] p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/15">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-zinc-300">AI Coach</span>
              <Badge className="ml-auto bg-emerald-500/[0.08] text-emerald-400 text-[10px] ring-1 ring-emerald-500/15 border-0 px-1.5 py-0 flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </Badge>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={coachIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: APPLE_EASE }}
                className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 p-3"
              >
                <p className="text-xs leading-relaxed text-zinc-300">
                  {coachMessages[coachIndex].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </FloatingCard>

        {/* ── Achievement Unlock ── */}
        <FloatingCard mouseX={mouseX} mouseY={mouseY} parallaxFactor={0.03} delay={0.6} floatDuration={9}>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06] p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 ring-1 ring-amber-500/15">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-zinc-300">Achievements</span>
            </div>
            <AnimatePresence>
              {achievementVisible ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: APPLE_EASE, type: 'spring', stiffness: 200, damping: 15 }}
                  className="rounded-xl bg-gradient-to-br from-amber-500/[0.08] to-amber-600/[0.03] border border-amber-500/15 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-300">Week Warrior Unlocked</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">7 consecutive days of deep work</p>
                </motion.div>
              ) : (
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                  <p className="text-xs text-zinc-500">Keep focusing to unlock...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── HERO SECTION — The cinematic opening ─── */
/* ═══════════════════════════════════════════════════════════════════ */

interface HeroSectionProps {
  onAuthSuccess: () => void;
}

export function HeroSection({ onAuthSuccess }: HeroSectionProps) {
  const [showAuth, setShowAuth] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:py-24 overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl lg:px-8">
        <AnimatePresence mode="wait">
          {!showAuth ? (
            /* ── Default Hero State: Cinematic Opening ── */
            <motion.div
              key="hero-visual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -60, filter: 'blur(12px)' }}
              transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
              className="flex flex-col items-center"
            >
              {/* ── The Breathing Orb — Product emerges from darkness ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: CINEMATIC_EASE, delay: 0.2 }}
                className="relative mb-8 flex items-center justify-center"
              >
                <BreathingOrb size="large" />

                {/* Floating product cards around the orb */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[540px] max-w-full">
                    <HeroProductVisualization />
                  </div>
                </div>
              </motion.div>

              {/* ── The Headline ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: CINEMATIC_EASE, delay: 0.5 }}
                className="text-center max-w-3xl mx-auto"
              >
                {/* Announcement badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: APPLE_EASE, delay: 0.6 }}
                  className="mb-6"
                >
                  <Badge className="cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-2 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/10">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    AI-Powered Attention OS
                  </Badge>
                </motion.div>

                {/* Main headline — dramatic, cinematic */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: CINEMATIC_EASE, delay: 0.7 }}
                  className="mb-6 text-[2.5rem] font-black leading-[1.05] tracking-tight text-zinc-50 sm:text-[3.75rem] lg:text-[5rem]"
                >
                  Your focus deserves{' '}
                  <span className="gradient-text">a coach.</span>
                  <br />
                  <span className="text-zinc-500">Not another app.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: CINEMATIC_EASE, delay: 0.8 }}
                  className="mb-10 text-lg leading-[1.8] text-zinc-400 sm:text-xl max-w-2xl mx-auto"
                >
                  MindGuard learns how you work, what breaks your focus, and when you&apos;re at your best — then coaches you to do more of what works.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: CINEMATIC_EASE, delay: 0.9 }}
                  className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5 justify-center"
                >
                  <Button
                    size="lg"
                    className="cta-primary cursor-pointer group h-14 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => setShowAuth(true)}
                  >
                    Begin your journey
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                  <button
                    type="button"
                    className="cursor-pointer inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors duration-200 py-2"
                    onClick={() => scrollToSection('story-section')}
                  >
                    <Play className="h-3.5 w-3.5" />
                    See how it works
                  </button>
                </motion.div>

                {/* Micro-copy + trust */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: CINEMATIC_EASE, delay: 1.1 }}
                  className="flex items-center gap-3 mt-6 justify-center flex-wrap"
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                    ))}
                    <span className="ml-1 text-xs font-medium text-zinc-400">4.9/5</span>
                  </div>
                  <span className="text-zinc-700">·</span>
                  <span className="text-xs text-zinc-500">10,000+ focused users</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-xs text-zinc-500">Free forever</span>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            /* ── Auth State: The form slides in ── */
            <motion.div
              key="hero-auth"
              initial={{ opacity: 0, x: 60, filter: 'blur(12px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 60, filter: 'blur(12px)' }}
              transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
              className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16 lg:items-center"
            >
              {/* ── Left: Welcome text ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: CINEMATIC_EASE, delay: 0.2 }}
                className="flex-1 text-center lg:text-left lg:max-w-[480px]"
              >
                <MindGuardHeroLogo className="mx-auto lg:mx-0 mb-6" />
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-[3.5rem] leading-[1.05]">
                  Welcome to
                  <br />
                  <span className="gradient-text">MindGuard.</span>
                </h2>
                <p className="mb-8 text-base leading-relaxed text-zinc-400 sm:text-lg">
                  Your focus is about to change forever. Join thousands of professionals who&apos;ve already transformed how they work.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Zap, text: 'Set up in 30 seconds' },
                    { icon: CheckCircle2, text: 'No credit card required' },
                    { icon: Brain, text: 'AI coach learns your patterns' },
                  ].map(({ icon: FeatureIcon, text }) => (
                    <div key={text} className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.08] ring-1 ring-emerald-500/10">
                        <FeatureIcon className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <span className="text-sm text-zinc-300">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── Right: Auth Form ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: CINEMATIC_EASE, delay: 0.3 }}
                className="w-full max-w-[560px] lg:w-[560px]"
              >
                <AuthExperience onSuccess={onAuthSuccess} />
                <div className="relative z-10">
                  <button
                    type="button"
                    className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
                    onClick={() => setShowAuth(false)}
                  >
                    ← Back to exploring
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-zinc-600 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
