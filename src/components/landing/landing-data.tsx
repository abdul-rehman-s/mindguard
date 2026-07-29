'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Target,
  Timer,
  BookOpen,
  Sparkles,
  Activity,
  BarChart3,
  Flame,
  TrendingUp,
  CheckCircle2,
  CircleDot,
  Star,
  Zap,
  Brain,
  Trophy,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/animations';

/* ─── Premium ease curves ─── */
const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const SMOOTH_EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

/* ─── Outcome-based Features ─── */
/* Never describe features. Describe outcomes. */

export const features = [
  {
    icon: Target,
    title: 'Never wonder what to focus on next.',
    description: 'One clear mission each day. No decision fatigue. No endless to-do lists. Just the thing that matters most — right now.',
    outcome: 'Clarity on demand',
  },
  {
    icon: Timer,
    title: 'Enter flow state on command.',
    description: 'Precision-engineered deep work sessions that adapt to your rhythm. Start a session, disappear into focus, emerge with results.',
    outcome: 'Flow, not friction',
  },
  {
    icon: BookOpen,
    title: 'End each day knowing exactly what you accomplished.',
    description: 'Structured reflection that turns vague feelings into clear insights. Understand your patterns. Compound your improvement.',
    outcome: 'Progress you can see',
  },
  {
    icon: Sparkles,
    title: 'Never wonder what to do next.',
    description: 'An AI coach that notices your patterns before you do. "Your best focus window is 9–11am on Tuesdays." That specific.',
    outcome: 'Intelligence that acts',
  },
  {
    icon: Activity,
    title: 'See exactly where your time goes.',
    description: 'Automatic tracking that reveals the truth about your day. No manual logging. No guessing. Just clarity.',
    outcome: 'Awareness without effort',
  },
  {
    icon: BarChart3,
    title: 'Know your peak performance windows.',
    description: 'Detailed analytics that map your energy, focus, and output. Stop fighting your biology. Work with it.',
    outcome: 'Data-driven mastery',
  },
];

export const testimonials = [
  {
    quote: 'I went from 2 hours of scattered work to 5+ hours of genuine deep work daily. The mission system completely changed how I approach my mornings.',
    name: 'Sarah Chen',
    role: 'Senior Engineer at Stripe',
    avatar: 'SC',
    rating: 4.5,
    metric: '2h → 5h deep work',
  },
  {
    quote: 'The daily reflection feature is genuinely useful — not just feel-good. I identified that my 3pm slump was actually caused by email checking habits.',
    name: 'Marcus Rivera',
    role: 'Product Designer, Remote',
    avatar: 'MR',
    rating: 4,
    metric: 'Eliminated 3pm slump',
  },
  {
    quote: "As a founder juggling 10 things, MindGuard's single-mission approach forced me to prioritize. Revenue went up 23% in Q1 just from being more intentional.",
    name: 'Emily Nakamura',
    role: 'CEO at Runway Labs',
    avatar: 'EN',
    rating: 5,
    metric: '+23% revenue in Q1',
  },
  {
    quote: 'I was skeptical about yet another productivity app. But the streak system actually works — 47 straight days of deep work sessions now.',
    name: 'James Park',
    role: 'Data Scientist at Meta',
    avatar: 'JP',
    rating: 4.5,
    metric: '47-day streak',
  },
  {
    quote: 'The AI coach nudges are surprisingly specific and actionable. It noticed I focus better in 45-min blocks and adjusted my recommendations accordingly.',
    name: 'Aisha Patel',
    role: 'PM at Linear',
    avatar: 'AP',
    rating: 4,
    metric: 'Optimized focus blocks',
  },
  {
    quote: 'Finally a focus tool that doesn\'t try to gamify everything. It respects that deep work is serious work — the minimal design helps me stay in flow.',
    name: 'David Okonkwo',
    role: 'Freelance Writer, 15yrs',
    avatar: 'DO',
    rating: 4.5,
    metric: '3x writing output',
  },
];

export const faqItems = [
  {
    question: 'Is MindGuard really free?',
    answer: 'Yes — the Free tier gives you unlimited focus sessions, the mission system, daily reflection, basic analytics, and streak tracking. No credit card required, no trial expiration.',
  },
  {
    question: 'Is my data private and secure?',
    answer: 'Absolutely. MindGuard uses local-first storage — your focus data lives on your device first, then syncs encrypted. We never track or sell your data, and are fully GDPR compliant.',
  },
  {
    question: 'Does MindGuard have a desktop app?',
    answer: 'Yes — available as a native desktop app for macOS, Windows, and Linux, alongside the web version. The desktop app offers distraction-free focus with system-level integration.',
  },
  {
    question: 'How does the AI Coach work?',
    answer: 'It analyzes your focus patterns — when you work best, what breaks your flow, and how your sessions trend. It gives specific, actionable nudges like "Your best focus window is 9-11am on Tuesdays."',
  },
  {
    question: 'What makes MindGuard different?',
    answer: 'Most focus apps are just timers with gamification. MindGuard is an Attention Operating System — it combines mission clarity, deep focus timing, daily reflection, and AI coaching into one cohesive workflow.',
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes — Pro and Team plans include full data export in CSV and JSON formats. Export all session history, analytics, and reflection notes at any time. Your data is never locked in.',
  },
];

/* ─── How It Works Steps ─── */
export const howItWorks = [
  {
    step: '01',
    title: 'Set your mission',
    description: 'One clear goal for the day. Not ten. One. The thing that would make today a win.',
    icon: Target,
  },
  {
    step: '02',
    title: 'Enter deep focus',
    description: 'Start a session, silence the noise, and disappear into the work. The timer tracks everything — you just focus.',
    icon: Timer,
  },
  {
    step: '03',
    title: 'Reflect & compound',
    description: 'End each session with a moment of reflection. See patterns, celebrate wins, and get smarter about tomorrow.',
    icon: Brain,
  },
];

/* ─── Animation Variants ─── */

export const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

export const heroItem = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: APPLE_EASE },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: EASE },
  },
};

/* ─── Scroll-triggered animation wrapper (Premium) ─── */

export function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 32, filter: 'blur(6px)' }}
      transition={{ duration: 0.7, ease: APPLE_EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Star rating renderer ─── */

export function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
      ))}
      {hasHalf && (
        <div className="relative h-3.5 w-3.5">
          <Star className="absolute h-3.5 w-3.5 text-zinc-600" />
          <div className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
          </div>
        </div>
      )}
      {Array.from({ length: 5 - fullStars - (hasHalf ? 1 : 0) }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-zinc-700" />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── PREMIUM PRODUCT SHOWCASE (Hero Interactive Demo) ─── */
/* ═══════════════════════════════════════════════════════════════════ */

/* ─── AI Coach Messages ─── */
const coachMessages = [
  { text: 'Your focus peaks at 9–11am. Start your mission then.', icon: Brain },
  { text: '3-day streak! You\'re 40% more productive when consistent.', icon: Flame },
  { text: 'Try a 45-min session today — it matches your best blocks.', icon: Zap },
  { text: 'You\'ve been in deep work for 32 min. Keep going.', icon: Timer },
];

/* ─── Rotating Mission Texts ─── */
const missionTexts = [
  'Ship dashboard redesign',
  'Write launch announcement',
  'Review Q3 roadmap',
  'Prepare investor update',
  'Design onboarding flow',
];

/* ─── Floating Glass Widget ─── */
function FloatingWidget({
  children,
  className,
  delay = 0,
  mouseX,
  mouseY,
  parallaxFactor = 0.02,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  parallaxFactor?: number;
}) {
  const x = useSpring(useTransform(mouseX, (v: number) => v * parallaxFactor), { stiffness: 80, damping: 20 });
  const y = useSpring(useTransform(mouseY, (v: number) => v * parallaxFactor), { stiffness: 80, damping: 20 });

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: APPLE_EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Circular Timer Ring ─── */
function CircularTimerRing({ progress, minutes, seconds }: { progress: number; minutes: number; seconds: number }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="4"
        />
        {/* Progress ring */}
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="url(#timerGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Glow ring */}
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="url(#timerGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          opacity={0.15}
          filter="blur(4px)"
          style={{ pointerEvents: 'none' }}
        />
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tabular-nums text-zinc-100">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">deep focus</span>
      </div>
    </div>
  );
}

/* ─── Main Product Showcase ─── */
export function ProductShowcase() {
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
      setTimerSeconds(prev => {
        if (prev >= 2700) { setMissionComplete(true); return 2700; }
        return prev + 3;
      });
    }, 100);
    const streakInterval = setInterval(() => {
      setStreakCount(prev => { if (prev >= 12) return 12; return prev + 1; });
    }, 800);
    const coachInterval = setInterval(() => {
      setCoachIndex(prev => (prev + 1) % coachMessages.length);
    }, 4000);
    const missionInterval = setInterval(() => {
      setMissionIndex(prev => (prev + 1) % missionTexts.length);
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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) * 0.1);
    mouseY.set((e.clientY - centerY) * 0.1);
  }, [mouseX, mouseY]);

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const progressPercent = (timerSeconds / 2700) * 100;

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {/* Ambient glow behind the entire showcase */}
      <div className="pointer-events-none absolute inset-0 -m-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-teal-500/[0.04] blur-[100px]" />
      </div>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {/* ── Timer Card (large, prominent) ── */}
        <FloatingWidget
          mouseX={mouseX} mouseY={mouseY}
          parallaxFactor={0.015}
          delay={0.1}
          className="sm:col-span-2"
        >
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
              {/* Circular timer */}
              <CircularTimerRing progress={progressPercent} minutes={minutes} seconds={seconds} />

              {/* Mission + streak info */}
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
                          i < streakCount ? 'bg-emerald-500/25 ring-1 ring-emerald-500/20' : 'bg-zinc-800/50'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FloatingWidget>

        {/* ── AI Coach Message ── */}
        <FloatingWidget
          mouseX={mouseX} mouseY={mouseY}
          parallaxFactor={0.025}
          delay={0.3}
        >
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
        </FloatingWidget>

        {/* ── Achievement Unlock ── */}
        <FloatingWidget
          mouseX={mouseX} mouseY={mouseY}
          parallaxFactor={0.03}
          delay={0.5}
        >
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06] p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 ring-1 ring-amber-500/15">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
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
        </FloatingWidget>
      </div>
    </div>
  );
}
