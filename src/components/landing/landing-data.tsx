'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/animations';

/* ─── Data ─── */

export const features = [
  {
    icon: Target,
    title: 'Mission System',
    description: 'One clear mission at a time. Channel your focus into what truly moves the needle.',
  },
  {
    icon: Timer,
    title: 'Deep Focus Timer',
    description: 'Precision-engineered for deep work. Track every minute of flow and build unbreakable habits.',
  },
  {
    icon: BookOpen,
    title: 'Daily Reflection',
    description: 'End each day with intention. Understand your patterns, celebrate wins, compound improvement.',
  },
  {
    icon: Sparkles,
    title: 'AI Coach',
    description: 'Personalized insights that understand your patterns. Actionable advice right when you need it.',
  },
  {
    icon: Activity,
    title: 'Activity Tracker',
    description: 'Automatic tracking of focus sessions and distractions. See exactly where your time goes.',
  },
  {
    icon: BarChart3,
    title: 'Session Analytics',
    description: 'Detailed analytics for every session. Visualize progress and identify peak performance windows.',
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

/* ─── Animation Variants ─── */

export const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const heroItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
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

/* ─── Scroll-triggered animation wrapper ─── */

export function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], delay }}
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

/* ─── Interactive Demo Component ─── */

export function InteractiveDemo() {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

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
    return () => { clearInterval(timerInterval); clearInterval(streakInterval); };
  }, []);

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const progressPercent = (timerSeconds / 2700) * 100;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30" />
          <span className="text-xs font-medium text-zinc-300">MindGuard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-zinc-600" />
          <div className="h-2 w-2 rounded-full bg-zinc-600" />
          <div className="h-2 w-2 rounded-full bg-zinc-600" />
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">
        {/* Timer card */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/20">
                <Timer className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-zinc-300">Deep Focus</span>
            </div>
            <Badge className="bg-emerald-500/[0.08] text-emerald-400 text-[10px] ring-1 ring-emerald-500/15 border-emerald-500/20 px-2 py-0.5">
              {missionComplete ? 'Complete' : 'In Progress'}
            </Badge>
          </div>
          <div className="text-center mb-3">
            <span className="text-3xl font-bold tabular-nums text-zinc-100">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-zinc-500 ml-2">/ 45:00</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Mission card */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-zinc-300">Today&apos;s Mission</span>
            </div>
            {missionComplete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <CircleDot className="h-4 w-4 text-zinc-600" />
            )}
          </div>
          <p className="text-sm text-zinc-200 font-medium">
            {missionComplete ? 'Ship dashboard redesign ✦' : 'Ship dashboard redesign'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {missionComplete ? 'Mission complete — 45 min deep work' : 'Focus session active'}
          </p>
        </div>

        {/* Streak card */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-zinc-300">Current Streak</span>
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
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={cn(
                  'h-5 w-5 rounded-md',
                  i < streakCount ? 'bg-emerald-500/30 ring-1 ring-emerald-500/20' : 'bg-zinc-800/50'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
