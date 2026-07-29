'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Target,
  Timer,
  BookOpen,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Quote,
  Users,
  Clock,
  Zap,
  Sparkles,
  ChevronRight,
  BarChart3,
  Activity,
  Star,
  CheckCircle2,
  Lock,
  Globe,
  Monitor,
  Smartphone,
  Laptop,
  ChevronDown,
  Flame,
  TrendingUp,
  CircleCheck,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useAppStore } from '@/stores/app-store';
import { registerSchema, loginSchema } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { staggerContainer as sharedStaggerContainer, staggerItem as sharedStaggerItem, fadeInUp as sharedFadeInUp, EASE, scaleIn as sharedScaleIn } from '@/lib/animations';
import { MindGuardHeroLogo, MindGuardLogo } from '@/components/branding/mindguard-logo';

/* ─── Data ─── */

const features = [
  {
    icon: Target,
    title: 'Mission System',
    description:
      'Define one clear mission at a time. Channel your cognitive resources into what truly moves the needle — no more scattered focus.',
  },
  {
    icon: Timer,
    title: 'Deep Focus Timer',
    description:
      'Precision-engineered timer for deep work sessions. Track every minute of flow state and build an unbreakable focus habit.',
  },
  {
    icon: BookOpen,
    title: 'Daily Reflection',
    description:
      'End each day with intentional reflection. Understand your patterns, celebrate wins, and compound improvement over time.',
  },
  {
    icon: Sparkles,
    title: 'AI Coach',
    description:
      'Personalized AI-driven insights that understand your work patterns. Get actionable advice right when you need it to optimize your focus.',
  },
  {
    icon: Activity,
    title: 'Activity Tracker',
    description:
      'Automatic tracking of your focus sessions and distractions. See exactly where your time goes — no manual logging required.',
  },
  {
    icon: BarChart3,
    title: 'Session Analytics',
    description:
      'Detailed analytics for every focus session. Visualize your progress, identify peak performance windows, and measure real improvement.',
  },
];

const testimonials = [
  {
    quote:
      'I went from 2 hours of scattered work to 5+ hours of genuine deep work daily. The mission system completely changed how I approach my mornings.',
    name: 'Sarah Chen',
    role: 'Senior Engineer at Stripe',
    avatar: 'SC',
    rating: 4.5,
    metric: '2h → 5h deep work',
  },
  {
    quote:
      'The daily reflection feature is genuinely useful — not just feel-good. I identified that my 3pm slump was actually caused by email checking habits.',
    name: 'Marcus Rivera',
    role: 'Product Designer, Remote',
    avatar: 'MR',
    rating: 4,
    metric: 'Eliminated 3pm slump',
  },
  {
    quote:
      "As a founder juggling 10 things, MindGuard's single-mission approach forced me to prioritize. Revenue went up 23% in Q1 just from being more intentional.",
    name: 'Emily Nakamura',
    role: 'CEO at Runway Labs',
    avatar: 'EN',
    rating: 5,
    metric: '+23% revenue in Q1',
  },
  {
    quote:
      'I was skeptical about yet another productivity app. But the streak system actually works — 47 straight days of deep work sessions now.',
    name: 'James Park',
    role: 'Data Scientist at Meta',
    avatar: 'JP',
    rating: 4.5,
    metric: '47-day streak',
  },
  {
    quote:
      'The AI coach nudges are surprisingly specific and actionable. It noticed I focus better in 45-min blocks and adjusted my recommendations accordingly.',
    name: 'Aisha Patel',
    role: 'PM at Linear',
    avatar: 'AP',
    rating: 4,
    metric: 'Optimized focus blocks',
  },
  {
    quote:
      'Finally a focus tool that doesn\'t try to gamify everything. It respects that deep work is serious work — the minimal design helps me stay in flow.',
    name: 'David Okonkwo',
    role: 'Freelance Writer, 15yrs',
    avatar: 'DO',
    rating: 4.5,
    metric: '3x writing output',
  },
];

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to get started with deep work.',
    features: [
      'Unlimited focus sessions',
      'Mission system',
      'Daily reflection',
      'Basic analytics',
      'Streak tracking',
      'Desktop & web access',
    ],
    cta: 'Get Started Free',
    highlighted: true,
    badge: null,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'AI Coach, unlimited sessions, and advanced analytics.',
    features: [
      'Everything in Free',
      'AI-powered coaching',
      'Advanced session analytics',
      'Focus pattern insights',
      'Priority support',
      'Custom focus durations',
      'Export & integrations',
    ],
    cta: 'Start Pro Trial',
    highlighted: false,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    price: 'Contact',
    period: 'us',
    description: 'Team missions, shared analytics, and admin dashboard.',
    features: [
      'Everything in Pro',
      'Team mission boards',
      'Shared team analytics',
      'Admin dashboard',
      'Team streak leaderboard',
      'SSO & team management',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
    badge: null,
  },
];

const roadmapItems = [
  { quarter: 'Q3 2025', title: 'Mobile App', description: 'iOS & Android companion for on-the-go focus tracking', icon: Smartphone, status: 'in-progress' },
  { quarter: 'Q4 2025', title: 'Team Features', description: 'Shared missions, team analytics, collaborative focus', icon: Users, status: 'planned' },
  { quarter: 'Q1 2026', title: 'Calendar Sync', description: 'Google Calendar & Outlook integration for smart scheduling', icon: Clock, status: 'planned' },
  { quarter: 'Q2 2026', title: 'AI Coaching Advanced', description: 'Predictive focus coaching, pattern detection, smart nudges', icon: Sparkles, status: 'planned' },
];

const faqItems = [
  {
    question: 'Is MindGuard really free?',
    answer: 'Yes — the Free tier gives you unlimited focus sessions, the mission system, daily reflection, basic analytics, streak tracking, and access on both desktop and web. No credit card required, no trial expiration, no feature gating on core productivity tools.',
  },
  {
    question: 'Is my data private and secure?',
    answer: 'Absolutely. MindGuard uses local-first storage — your focus data lives on your device first, then syncs encrypted to our servers. We use end-to-end encryption, never track or sell your data, and are fully GDPR compliant. Your attention data stays yours.',
  },
  {
    question: 'Does MindGuard have a desktop app?',
    answer: 'Yes — MindGuard is available as a native desktop app for macOS, Windows, and Linux, alongside the web version. The desktop app offers a distraction-free experience with system-level focus mode integration.',
  },
  {
    question: 'How does the AI Coach work?',
    answer: 'The AI Coach analyzes your focus patterns — when you work best, what breaks your flow, and how your sessions trend over time. It gives you specific, actionable nudges (not generic advice) like "Your best focus window is 9-11am on Tuesdays" or "Try 45-minute blocks instead of 25."',
  },
  {
    question: 'Can I use MindGuard with my team?',
    answer: 'The Team plan includes shared mission boards, team analytics, streak leaderboards (optional), and an admin dashboard. It\'s designed for teams that value deep work culture — not surveillance. Team members control their own data visibility.',
  },
  {
    question: 'What\'s the difference between MindGuard and other focus apps?',
    answer: 'Most focus apps are just timers with gamification. MindGuard is an Attention Operating System — it combines mission clarity, deep focus timing, daily reflection, and AI coaching into one cohesive workflow. It\'s built for people who take their focus seriously.',
  },
  {
    question: 'Will MindGuard be open source?',
    answer: 'We\'re exploring open-sourcing parts of MindGuard in the future — particularly the core focus timer and local storage layer. Our commitment to privacy and local-first architecture aligns with open source values. Stay tuned for updates on our roadmap.',
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes — Pro and Team plans include full data export in CSV and JSON formats. You can export all your session history, analytics, reflection notes, and streak data at any time. We believe in data portability — your data should never be locked in.',
  },
];

const securityFeatures = [
  { icon: Lock, title: 'Local-first Storage', description: 'Your data lives on your device first. Sync only happens when you choose it.' },
  { icon: Shield, title: 'End-to-end Encryption', description: 'All data syncs encrypted. We can\'t read your focus data — ever.' },
  { icon: EyeOff, title: 'No Tracking', description: 'Zero analytics tracking, zero ads, zero third-party data sharing.' },
  { icon: Globe, title: 'GDPR Compliant', description: 'Full compliance with EU data protection. Data portability and deletion on request.' },
];

/* ─── Animation variants ─── */

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const sectionFade = sharedFadeInUp;
const staggerContainer = sharedStaggerContainer;
const staggerItem = sharedStaggerItem;
const scaleIn = sharedScaleIn;

/* ─── Scroll-triggered animation wrapper ─── */

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: EASE as unknown as number[] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Ambient orb config ─── */

const ambientOrbs = [
  { size: 800, color: 'emerald', opacity: 0.06, x: '-15%', y: '-10%', delay: '0s' },
  { size: 600, color: 'teal', opacity: 0.04, x: '55%', y: '5%', delay: '2s' },
  { size: 400, color: 'emerald', opacity: 0.03, x: '20%', y: '55%', delay: '4s' },
];

/* ─── Star rating renderer ─── */

function StarRating({ rating }: { rating: number }) {
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

function InteractiveDemo() {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    // Simulate timer running
    const timerInterval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev >= 2700) { // 45 minutes
          setMissionComplete(true);
          return 2700;
        }
        return prev + 3;
      });
    }, 100);

    // Simulate streak growing
    const streakInterval = setInterval(() => {
      setStreakCount(prev => {
        if (prev >= 12) return 12;
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(timerInterval);
      clearInterval(streakInterval);
    };
  }, []);

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const progressPercent = (timerSeconds / 2700) * 100;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Top bar */}
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

      {/* Dashboard content */}
      <div className="p-4 sm:p-6 space-y-4">
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

          {/* Timer display */}
          <div className="text-center mb-3">
            <span className="text-3xl font-bold tabular-nums text-zinc-100">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-zinc-500 ml-2">/ 45:00</span>
          </div>

          {/* Progress bar */}
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
              <span className="text-xs font-medium text-zinc-300">Today's Mission</span>
            </div>
            {missionComplete ? (
              <CircleCheck className="h-4 w-4 text-emerald-400" />
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

          {/* Streak dots visualization */}
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={i < streakCount ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0.3 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={cn(
                  'h-5 w-5 rounded-md',
                  i < streakCount
                    ? 'bg-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'bg-zinc-800/50'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Platform Mockup Component ─── */

function PlatformMockup({ type }: { type: 'desktop' | 'web' }) {
  const isDesktop = type === 'desktop';

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        {isDesktop ? (
          <>
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-[10px] text-zinc-500 ml-2">MindGuard — Desktop</span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <Lock className="h-2.5 w-2.5 text-emerald-500/50" />
              <span className="text-[10px] text-zinc-500">app.mindguard.ai</span>
            </div>
          </>
        )}
      </div>

      {/* Mockup content */}
      <div className="p-4 space-y-3">
        {/* Sidebar hint */}
        <div className="flex gap-3">
          <div className="w-16 space-y-2 rounded-lg bg-white/[0.02] border border-white/[0.04] p-2">
            <div className="h-3 w-3 rounded bg-emerald-500/20 mx-auto" />
            <div className="h-2 w-8 rounded bg-zinc-700/30 mx-auto" />
            <div className="h-3 w-3 rounded bg-zinc-700/30 mx-auto mt-3" />
            <div className="h-2 w-6 rounded bg-zinc-700/30 mx-auto" />
            <div className="h-3 w-3 rounded bg-zinc-700/30 mx-auto mt-3" />
            <div className="h-2 w-8 rounded bg-zinc-700/30 mx-auto" />
          </div>

          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-emerald-500/20" />
                <span className="text-xs font-medium text-zinc-300">
                  {isDesktop ? 'Good morning, Sarah' : 'Dashboard'}
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="h-5 w-14 rounded-md bg-white/[0.04] border border-white/[0.06]" />
                <div className="h-5 w-5 rounded-md bg-white/[0.04] border border-white/[0.06]" />
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Focus', value: '4.5h', color: 'emerald' },
                { label: 'Streak', value: '12d', color: 'emerald' },
                { label: 'Mission', value: '3/5', color: 'zinc' },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                  <span className="text-[10px] text-zinc-500">{stat.label}</span>
                  <span className={cn(
                    'text-xs font-bold block',
                    stat.color === 'emerald' ? 'text-emerald-400' : 'text-zinc-300'
                  )}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Focus chart placeholder */}
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
              <span className="text-[10px] text-zinc-500 mb-2 block">Focus Hours This Week</span>
              <div className="flex items-end gap-1 h-12">
                {[3, 5, 4, 6, 2, 5, 4].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500/30 to-emerald-500/10" style={{ height: `${h * 16}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Testimonial Carousel ─── */

function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.getBoundingClientRect().width || 320;
      scrollRef.current.scrollTo({
        left: activeIndex * (cardWidth + 20),
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  return (
    <div className="relative">
      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="snap-center shrink-0 w-[320px] sm:w-[350px]"
          >
            <Card className="card-glow glass-card relative cursor-default flex h-full flex-col overflow-hidden border-zinc-800/30 p-6 backdrop-blur-sm">
              {/* Subtle glow accent */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/[0.05] blur-[40px]" />

              {/* Quote icon */}
              <Quote className="mb-3 h-5 w-5 text-emerald-500/20" />

              {/* Star rating */}
              <StarRating rating={t.rating} />

              {/* Metric badge */}
              <Badge className="mt-3 bg-emerald-500/[0.08] text-emerald-400 text-[10px] ring-1 ring-emerald-500/15 border-emerald-500/20 px-2 py-0.5 font-medium">
                {t.metric}
              </Badge>

              {/* Quote text */}
              <p className="mt-4 mb-5 flex-1 text-sm leading-relaxed text-zinc-300">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-zinc-800/30 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/10 text-xs font-semibold text-emerald-400">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
              i === activeIndex
                ? 'w-6 bg-emerald-400'
                : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
            )}
            aria-label={`View testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

export function LandingPage() {
  const setView = useAppStore(s => s.setView);
  const setUser = useAppStore(s => s.setUser);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
  });

  /* Track scroll for navbar style */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const validated = registerSchema.parse(formData);
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validated),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Registration failed');
        }
      } else {
        loginSchema.parse(formData);
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      setAuthSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err: unknown) {
      setAuthSuccess(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-zinc-950">
      {/* ═══ Background Layer ═══ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.4)_70%)]" />

        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.08) 0%, transparent 50%)',
              'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.06) 0%, transparent 50%)',
              'radial-gradient(ellipse at 70% 30%, rgba(20,184,166,0.07) 0%, transparent 50%)',
              'radial-gradient(ellipse at 40% 50%, rgba(16,185,129,0.08) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Ambient floating orbs */}
        {ambientOrbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: orb.color === 'emerald'
                ? `rgba(16,185,129,${orb.opacity})`
                : `rgba(20,184,166,${orb.opacity})`,
              filter: 'blur(180px)',
            }}
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* ═══ Content Layer ═══ */}
      <div className="relative z-10 flex flex-1 flex-col">

        {/* ═════════════════ NAVIGATION ═════════════════ */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'sticky top-0 z-50 mx-auto w-full transition-all duration-300',
            scrolled
              ? 'border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl'
              : 'bg-transparent',
          )}
        >
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <MindGuardLogo size="sm" showText={true} />

            {/* Desktop nav links */}
            <div className="hidden items-center gap-1 md:flex">
              {[
                { label: 'Features', id: 'features-section' },
                { label: 'Demo', id: 'demo-section' },
                { label: 'Pricing', id: 'pricing-section' },
                { label: 'FAQ', id: 'faq-section' },
              ].map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200"
                  onClick={() => scrollToSection(link.id)}
                >
                  {link.label}
                </Button>
              ))}
            </div>

            {/* CTA */}
            <Button
              size="sm"
              className="hidden md:flex cursor-pointer rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/25 hover:text-emerald-300 text-sm font-medium border-0 shadow-none transition-all"
              onClick={() => scrollToSection('auth-section')}
            >
              Get Started Free
            </Button>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden cursor-pointer text-zinc-400"
              onClick={() => scrollToSection('auth-section')}
            >
              Sign In
            </Button>
          </div>
        </motion.nav>

        {/* ═════════════════ 1. HERO SECTION ═════════════════ */}
        <section className="relative flex min-h-[88vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:py-20">
          <div className="mx-auto w-full max-w-7xl lg:px-8">
            <motion.div
              variants={heroContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-10 lg:flex-row lg:gap-14 lg:items-start"
            >
              {/* ── Hero Text Column ── */}
              <div className="flex-1 text-center lg:text-left lg:max-w-[540px]">
                {/* Hero Logo */}
                <motion.div variants={heroItem} className="mb-6">
                  <MindGuardHeroLogo className="mx-auto lg:mx-0" />
                </motion.div>

                {/* Announcement badge */}
                <motion.div variants={heroItem} className="mb-5">
                  <Badge
                    className="cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/10 hover:bg-emerald-500/[0.09]"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    AI-Powered Attention OS
                  </Badge>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  variants={heroItem}
                  className="mb-5 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-zinc-50 sm:text-[3.5rem] lg:text-[4rem]"
                >
                  Protect Your{' '}
                  <span className="gradient-text">Attention.</span>
                  <br />
                  <span className="text-zinc-200">Build Your Future.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  variants={heroItem}
                  className="mb-8 text-[1rem] leading-[1.7] text-zinc-400 sm:text-[1.1rem]"
                >
                  MindGuard is your premium Attention Operating System. Stay focused, track progress, and build better habits — one mission at a time.
                </motion.p>

                {/* CTA buttons */}
                <motion.div variants={heroItem} className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="btn-glow cursor-pointer group h-11 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/25"
                    onClick={() => scrollToSection('auth-section')}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="cursor-pointer h-11 rounded-xl border-zinc-800/40 bg-zinc-900/30 px-6 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/40 hover:border-zinc-700/40 shadow-none"
                    onClick={() => scrollToSection('demo-section')}
                  >
                    See It In Action
                  </Button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div variants={heroItem} className="flex items-center gap-4 mt-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
                    ))}
                    <span className="ml-1 text-sm font-medium text-zinc-300">4.9/5</span>
                  </div>
                  <span className="text-zinc-600">·</span>
                  <span className="text-sm text-zinc-500">10,000+ focused users</span>
                </motion.div>
              </div>

              {/* ── Auth Form Column ── */}
              <motion.div
                variants={heroItem}
                className="w-full max-w-[400px] lg:w-[400px]"
                id="auth-section"
              >
                {/* Success animation overlay */}
                <AnimatePresence>
                  {authSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-emerald-500/10 backdrop-blur-xl"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                        <p className="text-lg font-semibold text-emerald-400">Welcome aboard!</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Card className="relative overflow-hidden border-zinc-800/40 bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-black/30 ring-1 ring-inset ring-white/[0.04]">
                  {/* Glow accent at top */}
                  <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

                  <CardContent className="p-6 sm:p-7">
                    {/* Auth toggle header */}
                    <div className="mb-5 text-center">
                      <AnimatePresence mode="wait">
                        <motion.h2
                          key={isSignUp ? 'sign-up-title' : 'sign-in-title'}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="mb-1 text-lg font-bold tracking-tight text-zinc-100"
                        >
                          {isSignUp ? 'Create your account' : 'Welcome back'}
                        </motion.h2>
                      </AnimatePresence>
                      <p className="text-sm text-zinc-500">
                        {isSignUp
                          ? 'Start protecting your attention today.'
                          : 'Sign in to continue your journey.'}
                      </p>
                    </div>

                    {/* Sign Up / Sign In toggle tabs */}
                    <div className="mb-5 flex rounded-xl bg-zinc-800/40 p-1 ring-1 ring-inset ring-white/[0.03]" role="tablist" aria-label="Authentication method">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={!isSignUp}
                        onClick={() => { setIsSignUp(false); setError(''); setAuthSuccess(false); }}
                        className={cn(
                          'cursor-pointer flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                          !isSignUp
                            ? 'bg-emerald-500/15 text-emerald-400 shadow-sm ring-1 ring-emerald-500/20'
                            : 'text-zinc-500 hover:text-zinc-400',
                        )}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isSignUp}
                        onClick={() => { setIsSignUp(true); setError(''); setAuthSuccess(false); }}
                        className={cn(
                          'cursor-pointer flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                          isSignUp
                            ? 'bg-emerald-500/15 text-emerald-400 shadow-sm ring-1 ring-emerald-500/20'
                            : 'text-zinc-500 hover:text-zinc-400',
                        )}
                      >
                        Sign Up
                      </button>
                    </div>

                    {/* Social login buttons */}
                    <div className="mb-4 flex gap-3">
                      <button
                        type="button"
                        className="cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800/40 bg-zinc-800/30 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700/40 hover:bg-zinc-800/50 hover:text-zinc-200 ring-1 ring-inset ring-white/[0.03]"
                        aria-label="Continue with Google"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08 1.92 3.28 4.74 3.28 8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800/40 bg-zinc-800/30 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700/40 hover:bg-zinc-800/50 hover:text-zinc-200 ring-1 ring-inset ring-white/[0.03]"
                        aria-label="Continue with GitHub"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.919.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800/30" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-zinc-900/60 px-3 text-zinc-500 backdrop-blur-sm">or use email</span>
                      </div>
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                      <AnimatePresence mode="wait">
                        {isSignUp && (
                          <motion.div
                            key="name-field"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="name" className="mb-1.5 text-xs font-medium text-zinc-400">
                              Name
                            </Label>
                            <Input
                              id="name"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                              className="border-zinc-800/50 bg-zinc-800/30 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                              required={isSignUp}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <Label htmlFor="email" className="mb-1.5 text-xs font-medium text-zinc-400">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          className="border-zinc-800/50 bg-zinc-800/30 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="mb-1.5 text-xs font-medium text-zinc-400">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={isSignUp ? 'Min. 8 characters' : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                            value={formData.password}
                            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                            className="border-zinc-800/50 bg-zinc-800/30 pr-10 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-400"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-red-400"
                            role="alert"
                            aria-live="polite"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <Button
                        type="submit"
                        disabled={loading}
                        className={cn(
                          'btn-glow cursor-pointer mt-1 h-11 w-full rounded-xl bg-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/25',
                          loading && 'opacity-70',
                        )}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isSignUp ? 'Creating account...' : 'Signing in...'}
                          </>
                        ) : isSignUp ? (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═════════════════ 2. INTERACTIVE DEMO SECTION ═════════════════ */}
        <section id="demo-section" className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-7xl lg:px-8">
            {/* Side-by-side layout: description left, preview window right */}
            <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-14 lg:items-center">
              {/* ── Description Column ── */}
              <AnimatedSection className="flex-1 text-center lg:text-left lg:max-w-[480px]">
                <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                  <Monitor className="h-3.5 w-3.5" />
                  Live Demo
                </Badge>
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-[2.8rem]">
                  See it in{' '}
                  <span className="gradient-text">action</span>
                </h2>
                <p className="mb-6 text-base leading-relaxed text-zinc-400">
                  A live preview of the MindGuard dashboard. Timer running, missions progressing, streaks growing — all real-time animation.
                </p>
                {/* Feature highlights */}
                <div className="space-y-3">
                  {[
                    { icon: Timer, text: 'Real-time focus timer with progress tracking' },
                    { icon: Target, text: 'Mission system keeps you on one clear goal' },
                    { icon: Flame, text: 'Streak visualization builds consistency' },
                  ].map(({ icon: FeatureIcon, text }) => (
                    <div key={text} className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.08] ring-1 ring-emerald-500/10">
                        <FeatureIcon className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <span className="text-sm text-zinc-300">{text}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* ── Side Preview Window ── */}
              <AnimatedSection className="w-full max-w-sm lg:max-w-[420px] lg:w-[420px]">
                <InteractiveDemo />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ═════════════════ 3. FEATURES SECTION ═════════════════ */}
        <section id="features-section" className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-7xl lg:px-8">
            <AnimatedSection className="mb-14 text-center">
              <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                <Target className="h-3.5 w-3.5" />
                Features
              </Badge>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
                Everything you need to{' '}
                <span className="gradient-text">stay focused</span>
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400">
                A complete system designed for deep work and intentional living. Every feature exists to protect and amplify your attention.
              </p>
            </AnimatedSection>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <AnimatedSection key={feature.title}>
                    <motion.div
                      variants={scaleIn}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <Card className="card-glow glass-card lift-hover group relative h-full cursor-default overflow-hidden border-zinc-800/30 p-6 backdrop-blur-sm transition-all duration-300 sm:p-7">
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* Icon */}
                        <div className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/10 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/10 group-hover:scale-105">
                          <Icon className="h-5 w-5 text-emerald-400" />
                        </div>

                        {/* Text */}
                        <h3 className="relative mb-2 text-base font-bold tracking-tight text-zinc-100">
                          {feature.title}
                        </h3>
                        <p className="relative text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300">
                          {feature.description}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═════════════════ 4. DESKTOP + WEB PREVIEW ═════════════════ */}
        <section className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-7xl lg:px-8">
            <AnimatedSection className="mb-14 text-center">
              <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                <Laptop className="h-3.5 w-3.5" />
                Multi-Platform
              </Badge>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
                One system,{' '}
                <span className="gradient-text">every platform</span>
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400">
                Native desktop app for distraction-free focus. Web app for anywhere access. Same data, same experience, synced instantly.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                <PlatformMockup type="desktop" />
                <PlatformMockup type="web" />
              </div>
            </AnimatedSection>

            <AnimatedSection className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                { icon: Monitor, label: 'macOS' },
                { icon: Laptop, label: 'Windows' },
                { icon: Monitor, label: 'Linux' },
                { icon: Globe, label: 'Web' },
              ].map(({ icon: PlatformIcon, label }) => (
                <Badge
                  key={label}
                  className="cursor-default gap-1.5 rounded-full border-zinc-700/30 bg-zinc-900/30 px-3 py-1.5 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.04]"
                >
                  <PlatformIcon className="h-3 w-3" />
                  {label}
                </Badge>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ═════════════════ 5. TESTIMONIALS ═════════════════ */}
        <section id="testimonials-section" className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-7xl lg:px-8">
            <AnimatedSection className="mb-14 text-center">
              <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                <Quote className="h-3.5 w-3.5" />
                Testimonials
              </Badge>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
                Loved by{' '}
                <span className="gradient-text">deep workers</span>
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400">
                Real productivity metrics from real professionals. Not just feel-good quotes — measurable results.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <TestimonialCarousel />
            </AnimatedSection>
          </div>
        </section>

        {/* ═════════════════ 6. PRICING ═════════════════ */}
        <section id="pricing-section" className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl lg:px-8">
            <AnimatedSection className="mb-14 text-center">
              <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                <Zap className="h-3.5 w-3.5" />
                Pricing
              </Badge>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
                Start free,{' '}
                <span className="gradient-text">grow with us</span>
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400">
                No credit card required. No trial expiration. The Free tier is genuinely free — forever.
              </p>
            </AnimatedSection>

            <div className="grid gap-5 md:grid-cols-3">
              {pricingTiers.map((tier, i) => (
                <AnimatedSection key={tier.name}>
                  <motion.div
                    variants={scaleIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <Card className={cn(
                      'relative overflow-hidden h-full backdrop-blur-sm',
                      tier.highlighted
                        ? 'glass-card-active lift-hover border-emerald-500/20 ring-1 ring-emerald-500/10'
                        : 'glass-card lift-hover border-zinc-800/30',
                    )}>
                      {/* Top glow for highlighted */}
                      {tier.highlighted && (
                        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                      )}

                      {/* Badge */}
                      {tier.badge && (
                        <div className="absolute right-4 top-4">
                          <Badge className="bg-emerald-500/[0.12] text-emerald-400 text-[10px] ring-1 ring-emerald-500/20 border-emerald-500/20 px-2 py-0.5 font-semibold">
                            {tier.badge}
                          </Badge>
                        </div>
                      )}

                      <CardContent className="p-6 sm:p-7">
                        {/* Tier name */}
                        <h3 className="text-lg font-bold text-zinc-100 mb-1">{tier.name}</h3>

                        {/* Price */}
                        <div className="mb-4 flex items-baseline gap-1">
                          <span className={cn(
                            'text-3xl font-extrabold',
                            tier.highlighted ? 'text-emerald-400' : 'text-zinc-100'
                          )}>
                            {tier.price}
                          </span>
                          <span className="text-sm text-zinc-500">{tier.period}</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-zinc-400 mb-6">{tier.description}</p>

                        {/* Features */}
                        <ul className="space-y-2.5 mb-8">
                          {tier.features.map(feature => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400/70 shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <Button
                          className={cn(
                            'w-full rounded-xl h-10 text-sm font-semibold transition-all cursor-pointer',
                            tier.highlighted
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-xl'
                              : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/30 shadow-none hover:bg-zinc-800/70 hover:text-zinc-200',
                          )}
                          onClick={() => scrollToSection('auth-section')}
                        >
                          {tier.cta}
                          {tier.highlighted && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════ 7. ROADMAP ═════════════════ */}
        <section className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl lg:px-8">
            <AnimatedSection className="mb-14 text-center">
              <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                <ChevronRight className="h-3.5 w-3.5" />
                Roadmap
              </Badge>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
                What's{' '}
                <span className="gradient-text">coming next</span>
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400">
                We're building the future of attention management. Here's what's on the horizon.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {roadmapItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.quarter}
                      variants={staggerItem}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <div className={cn(
                        'glass-card rounded-xl p-5 lift-hover',
                        item.status === 'in-progress' && 'glass-card-active'
                      )}>
                        {/* Quarter */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={cn(
                            'text-[10px] font-semibold px-2 py-0.5',
                            item.status === 'in-progress'
                              ? 'bg-emerald-500/[0.12] text-emerald-400 ring-1 ring-emerald-500/20 border-emerald-500/20'
                              : 'bg-zinc-800/40 text-zinc-500 ring-1 ring-inset ring-white/[0.04] border-zinc-700/30'
                          )}>
                            {item.quarter}
                          </Badge>
                          {item.status === 'in-progress' && (
                            <span className="text-[10px] text-emerald-400 font-medium">In Progress</span>
                          )}
                        </div>

                        {/* Icon + Title */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            item.status === 'in-progress'
                              ? 'bg-emerald-500/15 ring-1 ring-emerald-500/15'
                              : 'bg-zinc-800/40 ring-1 ring-inset ring-white/[0.04]'
                          )}>
                            <Icon className={cn(
                              'h-4 w-4',
                              item.status === 'in-progress' ? 'text-emerald-400' : 'text-zinc-500'
                            )} />
                          </div>
                          <h3 className="text-sm font-bold text-zinc-100">{item.title}</h3>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ═════════════════ 8. SECURITY ═════════════════ */}
        <section className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl lg:px-8">
            <AnimatedSection className="mb-14 text-center">
              <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                <Shield className="h-3.5 w-3.5" />
                Privacy & Security
              </Badge>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
                Your data stays{' '}
                <span className="gradient-text">yours</span>
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400">
                We built MindGuard on privacy-first principles. Your attention data is personal — we treat it that way.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {securityFeatures.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      variants={staggerItem}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                    >
                      <div className="glass-card rounded-xl p-5 text-center lift-hover">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/10 mx-auto mb-3">
                          <Icon className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-100 mb-1">{item.title}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ═════════════════ 9. FAQ ═════════════════ */}
        <section id="faq-section" className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-3xl lg:px-8">
            <AnimatedSection className="mb-14 text-center">
              <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                <ChevronDown className="h-3.5 w-3.5" />
                FAQ
              </Badge>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
                Frequently asked{' '}
                <span className="gradient-text">questions</span>
              </h2>
            </AnimatedSection>

            <AnimatedSection>
              <Accordion type="single" collapsible className="glass-card rounded-xl overflow-hidden border-zinc-800/30">
                {faqItems.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className={cn(
                      'border-zinc-800/30 px-5',
                      i === faqItems.length - 1 && 'border-b-0'
                    )}
                  >
                    <AccordionTrigger className="text-sm font-semibold text-zinc-200 hover:text-emerald-400 hover:no-underline py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-400 leading-relaxed pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AnimatedSection>
          </div>
        </section>

        {/* ═════════════════ 10. FINAL CTA ═════════════════ */}
        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-5xl lg:px-8">
            <AnimatedSection>
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800/30 bg-gradient-to-br from-emerald-950/40 via-zinc-900/60 to-teal-950/30 px-8 py-16 text-center backdrop-blur-md sm:px-12 sm:py-20 lg:px-16">
                {/* Decorative glows */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[350px] -translate-x-1/2 -translate-y-[30%] rounded-full bg-emerald-500/[0.10] blur-[80px]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-teal-500/[0.05] blur-[60px]" />

                <div className="relative z-10">
                  <MindGuardHeroLogo className="mx-auto mb-6" />
                  <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-[3.25rem]">
                    Start Protecting Your{' '}
                    <span className="gradient-text">Attention</span> Today
                  </h2>
                  <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-zinc-400">
                    Join 10,000+ focused professionals. Free forever. No credit card. Start in 30 seconds.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                    <Button
                      size="lg"
                      className="btn-glow pulse-glow cursor-pointer group h-12 rounded-xl bg-emerald-500 px-8 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30"
                      onClick={() => scrollToSection('auth-section')}
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="cursor-pointer h-12 rounded-xl border-zinc-700/30 bg-zinc-900/40 px-8 text-base font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/40 hover:border-zinc-600/30 shadow-none"
                      onClick={() => scrollToSection('demo-section')}
                    >
                      Watch Demo
                    </Button>
                  </div>
                  <p className="mt-4 text-sm text-zinc-500">
                    Free forever · No credit card required · Set up in 30 seconds
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ═════════════════ 11. FOOTER ═════════════════ */}
        <footer className="mt-auto border-t border-zinc-800/20 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl lg:px-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
              {/* Brand */}
              <MindGuardLogo size="xs" showText={true} />

              {/* Links */}
              <div className="flex items-center gap-5">
                {[
                  { label: 'Features', id: 'features-section' },
                  { label: 'Pricing', id: 'pricing-section' },
                  { label: 'FAQ', id: 'faq-section' },
                  { label: 'Security', id: '' },
                ].map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    className="cursor-pointer text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                    onClick={() => scrollToSection(link.id)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Copyright */}
              <p className="text-xs text-zinc-600">
                &copy; {new Date().getFullYear()} MindGuard AI
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
