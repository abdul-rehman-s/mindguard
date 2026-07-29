'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Target,
  Timer,
  Brain,
  Sparkles,
  Activity,
  CheckCircle2,
  ArrowRight,
  Sunrise,
  Moon,
  Shield,
  EyeOff,
  Globe,
  Lock,
  Cpu,
  Quote,
  Star,
  Flame,
  TrendingUp,
  Zap,
  Trophy,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { features, testimonials, faqItems } from './landing-data';

/* ─── Premium ease curves ─── */
const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── SCROLL REVEAL — Premium scroll-triggered animation ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const directionMap = {
    up: { y: 48 },
    down: { y: -48 },
    left: { x: 48 },
    right: { x: -48 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: 'blur(8px)', ...directionMap[direction] }}
      animate={
        isInView
          ? { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }
          : { opacity: 0, filter: 'blur(8px)', ...directionMap[direction] }
      }
      transition={{ duration: 0.9, ease: APPLE_EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── STORY BEAT — A single narrative moment ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function StoryBeat({
  line,
  subline,
  visualization,
  align = 'center',
  delay = 0,
}: {
  line: string;
  subline?: string;
  visualization?: React.ReactNode;
  align?: 'center' | 'left' | 'right';
  delay?: number;
}) {
  return (
    <ScrollReveal delay={delay} className="flex flex-col items-center">
      <div
        className={cn(
          'max-w-3xl',
          align === 'center' && 'text-center',
          align === 'left' && 'text-left',
          align === 'right' && 'text-right',
        )}
      >
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-100 leading-[1.2]">
          {line}
        </h3>
        {subline && (
          <p className="mt-3 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {subline}
          </p>
        )}
        {visualization && <div className="mt-8">{visualization}</div>}
      </div>
    </ScrollReveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── MINI VISUALIZATION: Animated focus timer ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function MiniTimerVisualization() {
  const circumference = 2 * Math.PI * 36;
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-6 inline-flex items-center gap-6">
      <div className="relative flex items-center justify-center">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
          <motion.circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="url(#miniTimerGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * 0.25 }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
          />
          <defs>
            <linearGradient id="miniTimerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-sm font-bold tabular-nums text-zinc-100">34:12</span>
          <span className="text-[8px] text-zinc-500 uppercase tracking-widest">focus</span>
        </div>
      </div>
      <div className="text-left">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs text-zinc-400">Today&apos;s Mission</span>
        </div>
        <p className="text-sm font-medium text-zinc-200">Ship dashboard redesign</p>
        <p className="text-xs text-zinc-500 mt-0.5">34 min deep work</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── MINI VISUALIZATION: AI Coach message ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function MiniCoachVisualization() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-5 inline-flex flex-col gap-3 max-w-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/15">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <span className="text-xs font-medium text-zinc-300">AI Coach</span>
        <Badge className="ml-auto bg-emerald-500/[0.08] text-emerald-400 text-[10px] ring-1 ring-emerald-500/15 border-0 px-1.5 py-0">
          <span className="relative flex h-1.5 w-1.5 mr-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live
        </Badge>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 p-3"
      >
        <p className="text-xs leading-relaxed text-zinc-300">
          Your best focus window is 9–11am on Tuesdays. I&apos;ve adjusted your mission schedule accordingly.
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── MINI VISUALIZATION: Reflection card ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function MiniReflectionVisualization() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-5 inline-flex flex-col gap-3 max-w-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/15">
          <Brain className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <span className="text-xs font-medium text-zinc-300">Daily Reflection</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs text-zinc-300">Completed 3 focus sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs text-zinc-300">4h 15m of deep work</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs text-zinc-300">23% more productive than yesterday</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── STAR RATING ─── */
/* ═══════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── TESTIMONIAL CAROUSEL ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to active card
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
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="snap-center shrink-0 w-[320px] sm:w-[350px]"
          >
            <Card className="glass-card relative cursor-default flex h-full flex-col overflow-hidden border-zinc-800/30 p-6 backdrop-blur-sm">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/[0.05] blur-[40px]" />
              <Quote className="mb-3 h-5 w-5 text-emerald-500/20" />
              <StarRating rating={t.rating} />
              <Badge className="mt-3 bg-emerald-500/[0.08] text-emerald-400 text-[10px] ring-1 ring-emerald-500/15 border-emerald-500/20 px-2 py-0.5 font-medium w-fit">
                {t.metric}
              </Badge>
              <p className="mt-4 mb-5 flex-1 text-sm leading-relaxed text-zinc-300">
                &ldquo;{t.quote}&rdquo;
              </p>
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── SECURITY FEATURES ─── */
/* ═══════════════════════════════════════════════════════════════════ */

const securityFeatures = [
  { icon: Lock, title: 'Local-first Storage', description: 'Your data lives on your device first. Sync only when you choose it.' },
  { icon: Shield, title: 'End-to-end Encryption', description: 'All data syncs encrypted. We can\'t read your focus data — ever.' },
  { icon: EyeOff, title: 'No Tracking', description: 'Zero analytics tracking, zero ads, zero third-party data sharing.' },
  { icon: Globe, title: 'GDPR Compliant', description: 'Full compliance with EU data protection. Data portability and deletion on request.' },
];

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── PRICING TIERS ─── */
/* ═══════════════════════════════════════════════════════════════════ */

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
    description: 'AI Coach, advanced analytics, and custom focus durations.',
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

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── STORY SECTION — The emotional narrative ─── */
/* ═══════════════════════════════════════════════════════════════════ */

export function StorySection() {
  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="relative">
      {/* ═══ 1. THE STORY — Emotional Narrative ═══ */}
      <section id="story-section" className="px-4 py-24 sm:px-6 lg:py-36">
        <div className="mx-auto max-w-5xl lg:px-8 space-y-28 lg:space-y-40">
          {/* Opening beat */}
          <ScrollReveal>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/30" />
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-500/40 font-medium">Imagine</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/30" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold tracking-tight text-zinc-100 leading-[1.15]">
                Opening your laptop...
              </h2>
              <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                and already knowing exactly what deserves your attention.
              </p>
            </div>
          </ScrollReveal>

          {/* Beat 1: The Mission */}
          <StoryBeat
            line="One mission. Not ten. Not a to-do list."
            subline="Every morning, MindGuard helps you identify the single thing that would make today a win. Then it protects that focus with everything it has."
            visualization={<MiniTimerVisualization />}
          />

          {/* Beat 2: The Coach */}
          <StoryBeat
            line="An AI coach that notices things before you do."
            subline="It learns your patterns. Your best focus windows. What breaks your flow. Then it gives you specific, actionable guidance — not generic advice."
            visualization={<MiniCoachVisualization />}
          />

          {/* Beat 3: The Reflection */}
          <StoryBeat
            line="Finishing work without wondering where the day went."
            subline="Structured reflection built into the flow. Not optional — automatic and effortless. You see patterns, celebrate wins, and compound your improvement."
            visualization={<MiniReflectionVisualization />}
          />

          {/* Closing beat */}
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold tracking-tight text-zinc-100 leading-[1.15]">
                Imagine feeling calm...
              </h2>
              <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                because your system remembers everything.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 inline-flex items-center gap-2 text-emerald-400"
              >
                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-emerald-500/40 to-emerald-500/10" />
                <span className="text-sm font-medium">This is MindGuard.</span>
                <div className="h-1 w-8 rounded-full bg-gradient-to-l from-emerald-500/40 to-emerald-500/10" />
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 2. THE DIFFERENCE — Philosophy ═══ */}
      <section className="px-4 py-24 sm:px-6 lg:py-36">
        <div className="mx-auto max-w-7xl lg:px-8">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20 lg:items-center">
            {/* ── Left: Philosophy ── */}
            <ScrollReveal className="flex-1 text-center lg:text-left lg:max-w-[540px]">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/30" />
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-500/40 font-medium">The Difference</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/30" />
              </div>
              <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-[3rem] leading-[1.1]">
                Other apps give you{' '}
                <span className="gradient-text">more tools.</span>
                <br />
                We give you{' '}
                <span className="text-zinc-200">more focus.</span>
              </h2>
              <p className="mb-8 text-base leading-relaxed text-zinc-400 sm:text-lg">
                Most productivity apps add features. More integrations. More dashboards. More things to check. MindGuard does the opposite — it removes everything that doesn&apos;t serve your focus.
              </p>
              <div className="space-y-5">
                {[
                  { label: 'One mission, not a to-do list', desc: 'Force prioritization through constraint' },
                  { label: 'AI that coaches, not just tracks', desc: 'Get specific, actionable guidance' },
                  { label: 'Reflection built into the flow', desc: 'Not optional — automatic and effortless' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 justify-center lg:justify-start">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/15 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-zinc-200">{item.label}</span>
                      <span className="text-xs text-zinc-500 ml-2">— {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* ── Right: Comparison visual ── */}
            <ScrollReveal delay={0.2} direction="right" className="w-full max-w-md lg:max-w-[440px] lg:w-[440px]">
              <div className="space-y-4">
                {/* Other apps */}
                <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06] p-5 opacity-60">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-red-500/50" />
                    <span className="text-xs font-medium text-zinc-500">Typical Productivity App</span>
                  </div>
                  <div className="space-y-2">
                    {['10 to-do lists', '5 integrations', '3 dashboards', '12 notifications/hr', 'Inbox zero anxiety'].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-zinc-600">
                        <span className="text-red-500/40">✕</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MindGuard */}
                <div className="glass-card-active rounded-2xl overflow-hidden border border-emerald-500/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400">MindGuard</span>
                  </div>
                  <div className="space-y-2">
                    {['One mission', 'AI coaching', 'Deep focus timer', 'Automatic reflection', 'Zero distractions'].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. OUTCOMES — What changes ═══ */}
      <section id="features-section" className="px-4 py-24 sm:px-6 lg:py-36">
        <div className="mx-auto max-w-7xl lg:px-8">
          <ScrollReveal className="mb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/30" />
              <span className="text-xs uppercase tracking-[0.25em] text-emerald-500/40 font-medium">What Changes</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/30" />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-[3.5rem] leading-[1.1]">
              These aren&apos;t features.
              <br />
              <span className="gradient-text">They&apos;re outcomes.</span>
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Every element of MindGuard is designed to produce a specific result in your work life.
            </p>
          </ScrollReveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={i * 0.05}>
                  <Card className="glass-card lift-hover group relative h-full cursor-default overflow-hidden border-zinc-800/30 p-6 backdrop-blur-sm transition-all duration-300 sm:p-7">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/10 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/10 group-hover:scale-105">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="relative mb-2 text-base font-bold tracking-tight text-zinc-100 leading-snug">
                        {feature.title}
                      </h3>
                      <p className="relative text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                        {feature.description}
                      </p>
                      <div className="mt-4 pt-3 border-t border-zinc-800/30">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500/60 group-hover:text-emerald-400/80 transition-colors duration-300">
                          {feature.outcome}
                        </span>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 4. VOICES — Testimonials ═══ */}
      <section className="px-4 py-24 sm:px-6 lg:py-36">
        <div className="mx-auto max-w-7xl lg:px-8">
          <ScrollReveal className="mb-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/30" />
              <span className="text-xs uppercase tracking-[0.25em] text-emerald-500/40 font-medium">Voices</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/30" />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-[3.5rem] leading-[1.1]">
              Real results from{' '}
              <span className="gradient-text">deep workers</span>
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Not just feel-good quotes — measurable results from real professionals.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <TestimonialCarousel />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 5. PRICING ═══ */}
      <section id="pricing-section" className="px-4 py-24 sm:px-6 lg:py-36">
        <div className="mx-auto max-w-6xl lg:px-8">
          <ScrollReveal className="mb-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/30" />
              <span className="text-xs uppercase tracking-[0.25em] text-emerald-500/40 font-medium">Investment</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/30" />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl lg:text-[3.5rem] leading-[1.1]">
              Start free,{' '}
              <span className="gradient-text">grow with us</span>
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              No credit card required. No trial expiration. The Free tier is genuinely free — forever.
            </p>
          </ScrollReveal>

          <div className="grid gap-5 md:grid-cols-3">
            {pricingTiers.map((tier, i) => (
              <ScrollReveal key={tier.name} delay={i * 0.08}>
                <Card
                  className={cn(
                    'relative overflow-hidden h-full backdrop-blur-sm transition-all duration-300',
                    tier.highlighted
                      ? 'glass-card-active lift-hover border-emerald-500/20 ring-1 ring-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/10'
                      : 'glass-card lift-hover border-zinc-800/30',
                  )}
                >
                  {tier.highlighted && (
                    <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                  )}
                  {tier.badge && (
                    <div className="absolute right-4 top-4">
                      <Badge className="bg-emerald-500/[0.12] text-emerald-400 text-[10px] ring-1 ring-emerald-500/20 border-emerald-500/20 px-2 py-0.5 font-semibold">
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  <div className="p-6 sm:p-7">
                    <h3 className="text-lg font-bold text-zinc-100 mb-1">{tier.name}</h3>
                    <div className="mb-4 flex items-baseline gap-1">
                      <span
                        className={cn(
                          'text-3xl font-extrabold',
                          tier.highlighted ? 'text-emerald-400' : 'text-zinc-100',
                        )}
                      >
                        {tier.price}
                      </span>
                      <span className="text-sm text-zinc-500">{tier.period}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-6">{tier.description}</p>
                    <ul className="space-y-2.5 mb-8">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400/70 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        'w-full rounded-xl h-11 text-sm font-semibold transition-all duration-300 cursor-pointer',
                        tier.highlighted
                          ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/30 shadow-none hover:bg-zinc-800/70 hover:text-zinc-200 hover:scale-[1.01] active:scale-[0.99]',
                      )}
                      onClick={() => scrollToSection('hero-auth-trigger')}
                    >
                      {tier.cta}
                      {tier.highlighted && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. PRIVACY ═══ */}
      <section className="px-4 py-24 sm:px-6 lg:py-36">
        <div className="mx-auto max-w-6xl lg:px-8">
          <ScrollReveal className="mb-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/30" />
              <span className="text-xs uppercase tracking-[0.25em] text-emerald-500/40 font-medium">Privacy</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/30" />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl leading-[1.1]">
              Your data stays{' '}
              <span className="gradient-text">yours</span>
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Privacy-first principles. Your attention data is personal — we treat it that way.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {securityFeatures.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06, ease: APPLE_EASE }}
                  >
                    <div className="glass-card lift-hover rounded-xl p-5 text-center group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/10 mx-auto mb-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/10 group-hover:scale-105">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100 mb-1">{item.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 7. FAQ ═══ */}
      <section id="faq-section" className="px-4 py-24 sm:px-6 lg:py-36">
        <div className="mx-auto max-w-3xl lg:px-8">
          <ScrollReveal className="mb-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/30" />
              <span className="text-xs uppercase tracking-[0.25em] text-emerald-500/40 font-medium">Questions</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/30" />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl leading-[1.1]">
              Frequently asked{' '}
              <span className="gradient-text">questions</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal>
            <Accordion type="single" collapsible className="glass-card rounded-2xl overflow-hidden border-zinc-800/30">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className={cn('border-zinc-800/30 px-5', i === faqItems.length - 1 && 'border-b-0')}
                >
                  <AccordionTrigger className="text-sm font-semibold text-zinc-200 hover:text-emerald-400 hover:no-underline py-4 cursor-pointer transition-colors duration-200">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-zinc-400 leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
