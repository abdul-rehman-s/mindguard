'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { useAppStore } from '@/stores/app-store';
import { registerSchema, loginSchema } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { staggerContainer as sharedStaggerContainer, staggerItem as sharedStaggerItem, fadeInUp as sharedFadeInUp, EASE, scaleIn as sharedScaleIn } from '@/lib/animations';
import type { SafeUser } from '@/stores/app-store';

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
];

const socialProof = [
  { icon: Users, value: '2,000+', label: 'Active Users' },
  { icon: Clock, value: '500+', label: 'Hours Tracked' },
  { icon: Zap, value: '98%', label: 'Satisfaction' },
];

const howItWorks = [
  {
    icon: Target,
    step: '01',
    title: 'Set Your Mission',
    description:
      'Define a single, clear mission for your focus session. Clarity drives deep work.',
  },
  {
    icon: Timer,
    step: '02',
    title: 'Start Deep Focus',
    description:
      'Activate the timer and enter your flow state. Every second is tracked and saved automatically.',
  },
  {
    icon: BookOpen,
    step: '03',
    title: 'Reflect & Improve',
    description:
      'Review your session with guided reflection questions. Build awareness and compound growth.',
  },
];

const testimonials = [
  {
    quote:
      'MindGuard completely transformed how I work. I went from constantly distracted to hitting 4+ hours of deep work daily. The mission system is genius.',
    name: 'Sarah Chen',
    role: 'Software Engineer',
  },
  {
    quote:
      'The daily reflection feature alone is worth it. I now understand my focus patterns and have eliminated my biggest productivity killers.',
    name: 'Marcus Rivera',
    role: 'Product Designer',
  },
  {
    quote:
      "As a founder, my attention is my most valuable asset. MindGuard protects it like nothing else I've tried. Simple, powerful, essential.",
    name: 'Emily Nakamura',
    role: 'Startup Founder',
  },
];

/* ─── Animation variants ─── */

// Using shared animation variants from @/lib/animations where possible
// Landing page uses custom hero variants for unique stagger timing
const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.2 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const sectionFade = sharedFadeInUp;
const staggerContainer = sharedStaggerContainer;
const staggerItem = sharedStaggerItem;
const scaleIn = sharedScaleIn;

/* ─── Floating particles config ─── */

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  top: `${8 + (i * 7.5) % 84}%`,
  left: `${5 + (i * 9.2) % 88}%`,
  size: i % 3 === 0 ? 2 : 1,
  delay: `${i * 0.6}s`,
  duration: `${3.5 + (i % 5) * 0.8}s`,
}));

/* ═══════════════════════════════════════════════════════════════════ */

export function LandingPage() {
  const setView = useAppStore(s => s.setView);
  const setUser = useAppStore(s => s.setUser);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
  });

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

      const user: SafeUser = {
        id: 'temp',
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
      };
      setUser(user);
      setView('dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToAuth = () =>
    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToFeatures = () =>
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* ═══ Background Effects ═══ */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle grid overlay */}
        <div className="app-grid-bg absolute inset-0 opacity-50" />

        {/* Large floating gradient orbs */}
        <div className="animate-float absolute -left-40 -top-20 h-[700px] w-[700px] rounded-full bg-emerald-500/[0.07] blur-[180px]" />
        <div
          className="animate-float absolute -right-48 top-[20%] h-[550px] w-[550px] rounded-full bg-teal-500/[0.05] blur-[150px]"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="animate-float absolute bottom-[15%] left-[30%] h-[420px] w-[420px] rounded-full bg-emerald-400/[0.04] blur-[120px]"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="animate-float absolute right-[20%] bottom-[5%] h-[300px] w-[300px] rounded-full bg-teal-400/[0.03] blur-[100px]"
          style={{ animationDelay: '3s' }}
        />

        {/* Subtle particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="animate-breathe absolute rounded-full bg-emerald-400/25"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* ═══ Content ═══ */}
      <div className="relative z-10">
        {/* ═════════════════ NAVIGATION ═════════════════ */}
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        >
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-100">
              MindGuard
            </span>
          </motion.div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-zinc-400 hover:text-zinc-200"
              onClick={scrollToFeatures}
              aria-label="View features section"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-zinc-400 hover:text-zinc-200"
              onClick={scrollToAuth}
              aria-label="Go to sign in section"
            >
              Sign In
            </Button>
          </div>
        </motion.nav>

        {/* ═════════════════ 1. HERO SECTION ═════════════════ */}
        <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-5 py-28 text-center sm:px-8 lg:py-36">
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-5xl"
          >
            {/* Badge */}
            <motion.div variants={heroItem} className="mb-8">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-zinc-800/60 bg-zinc-900/50 px-5 py-2 text-sm font-medium text-zinc-400 backdrop-blur-md ring-1 ring-inset ring-white/[0.03]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Attention Operating System
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={heroItem}
              className="mb-7 text-5xl font-extrabold leading-[1.06] tracking-tight text-zinc-50 sm:text-7xl lg:text-8xl"
            >
              Protect Your{' '}
              <br className="hidden sm:block" />
              Attention.{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">Build Your Future.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={heroItem}
              className="mx-auto mb-14 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl lg:text-[1.35rem]"
            >
              MindGuard AI is your premium Attention Operating System. Stay
              focused, track progress, and build better habits — one mission at
              a time.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={heroItem}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                size="lg"
                className={cn(
                  'btn-glow group relative h-14 w-full rounded-xl bg-emerald-500 px-10 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30 sm:w-auto',
                )}
                onClick={scrollToAuth}
              >
                Get Started Free
                <ArrowRight className="ml-2.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-14 w-full text-zinc-400 transition-colors hover:text-zinc-200 sm:w-auto"
                onClick={scrollToFeatures}
              >
                Learn More
                <ChevronRight className="ml-1 h-4 w-4 opacity-50" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* ═════════════════ 2. SOCIAL PROOF BAR ═════════════════ */}
        <section className="relative border-y border-zinc-800/30 bg-zinc-900/20 backdrop-blur-sm">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="mx-auto flex max-w-5xl flex-col items-center gap-8 py-10 sm:flex-row sm:justify-around sm:gap-6 sm:py-12"
          >
            {socialProof.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  variants={staggerItem}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/5 ring-1 ring-emerald-500/10">
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
                      {item.value}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                      {item.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ═════════════════ 3. FEATURES SECTION ═════════════════ */}
        <section id="features-section" className="px-5 py-28 sm:px-8 lg:py-36">
          <div className="mx-auto max-w-7xl lg:px-10">
            {/* Section header */}
            <motion.div
              variants={sectionFade}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-20 text-center"
            >
              <motion.span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                <Target className="h-3.5 w-3.5" />
                Features
              </motion.span>
              <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl">
                Everything you need to{' '}
                <span className="gradient-text">stay focused</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
                A complete system designed for deep work and intentional living.
                Every feature exists to protect and amplify your attention.
              </p>
            </motion.div>

            {/* Feature cards — 3-column on lg */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={scaleIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: i * 0.18 }}
                  >
                    <Card className="card-glow group relative h-full overflow-hidden border-zinc-800/40 bg-zinc-900/25 p-7 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 sm:p-8">
                      {/* Numbered badge */}
                      <span className="absolute right-5 top-5 font-mono text-xs font-bold text-zinc-700 transition-colors group-hover:text-zinc-600">
                        0{i + 1}
                      </span>

                      {/* Icon */}
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/10">
                        <Icon className="h-6 w-6 text-emerald-400" />
                      </div>

                      {/* Text */}
                      <h3 className="mb-3 text-xl font-bold tracking-tight text-zinc-100">
                        {feature.title}
                      </h3>
                      <p className="text-[0.9375rem] leading-relaxed text-zinc-400">
                        {feature.description}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═════════════════ 4. HOW IT WORKS ═════════════════ */}
        <section className="border-t border-zinc-800/30 bg-zinc-900/10 px-5 py-28 sm:px-8 lg:py-36">
          <div className="mx-auto max-w-7xl lg:px-10">
            {/* Section header */}
            <motion.div
              variants={sectionFade}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-20 text-center"
            >
              <motion.span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                <Timer className="h-3.5 w-3.5" />
                How It Works
              </motion.span>
              <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl">
                Three steps to{' '}
                <span className="gradient-text">deep focus</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
                A simple, powerful workflow that turns intention into action.
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              {/* Connecting line — desktop only */}
              <div className="absolute left-[16.67%] right-[16.67%] top-[3.75rem] hidden h-px bg-gradient-to-r from-zinc-800/80 via-zinc-700/40 to-zinc-800/80 lg:block" />

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {howItWorks.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.step}
                      variants={staggerItem}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ duration: 0.55, delay: i * 0.2 }}
                    >
                      <Card className="card-glow relative border-zinc-800/40 bg-zinc-900/25 p-8 text-center backdrop-blur-sm">
                        {/* Step icon */}
                        <div className="relative z-10 mx-auto mb-6 flex h-[3.5rem] w-[3.5rem] items-center justify-center rounded-full border border-zinc-700/40 bg-zinc-900 shadow-lg shadow-black/20 ring-1 ring-inset ring-white/[0.03]">
                          <Icon className="h-6 w-6 text-emerald-400" />
                        </div>

                        {/* Step number */}
                        <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-emerald-500/60">
                          Step {step.step}
                        </p>

                        {/* Text */}
                        <h3 className="mb-3 text-xl font-bold tracking-tight text-zinc-100">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-400">
                          {step.description}
                        </p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════ 5. TESTIMONIALS ═════════════════ */}
        <section className="border-t border-zinc-800/30 px-5 py-28 sm:px-8 lg:py-36">
          <div className="mx-auto max-w-7xl lg:px-10">
            {/* Section header */}
            <motion.div
              variants={sectionFade}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-20 text-center"
            >
              <motion.span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                <Quote className="h-3.5 w-3.5" />
                Testimonials
              </motion.span>
              <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl">
                Loved by{' '}
                <span className="gradient-text">deep workers</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
                Join thousands who have reclaimed their attention and transformed
                their productivity.
              </p>
            </motion.div>

            {/* Testimonial cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.18 }}
                >
                  <Card className="card-glow flex h-full flex-col border-zinc-800/40 bg-zinc-900/25 p-7 backdrop-blur-sm sm:p-8">
                    {/* Quote icon */}
                    <Quote className="mb-5 h-9 w-9 text-emerald-500/20" />

                    {/* Quote text */}
                    <p className="mb-8 flex-1 text-[0.9375rem] leading-relaxed text-zinc-300">
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 border-t border-zinc-800/40 pt-5">
                      {/* Avatar placeholder */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/10">
                        <span className="text-sm font-semibold text-emerald-400">
                          {t.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">
                          {t.name}
                        </p>
                        <p className="text-xs text-zinc-500">{t.role}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════ 6. FINAL CTA ═════════════════ */}
        <section className="px-5 py-28 sm:px-8 lg:py-36">
          <div className="mx-auto max-w-6xl lg:px-10">
            <motion.div
              variants={sectionFade}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="relative overflow-hidden rounded-3xl border border-zinc-800/40 bg-gradient-to-br from-emerald-950/50 via-zinc-900/70 to-teal-950/40 px-6 py-16 text-center backdrop-blur-md sm:px-12 sm:py-20 lg:px-20 lg:py-24"
            >
              {/* Decorative glows inside the CTA card */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full bg-teal-500/[0.06] blur-[80px]" />

              <div className="relative z-10">
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
                  Start Protecting Your{' '}
                  <br className="hidden sm:block" />
                  <span className="gradient-text">Attention</span> Today
                </h2>
                <p className="mx-auto mb-10 max-w-xl text-lg text-zinc-400">
                  Join thousands of focused professionals. Your attention is your
                  most valuable asset — start treating it that way.
                </p>
                <Button
                  size="lg"
                  className={cn(
                    'btn-glow group h-14 rounded-xl bg-emerald-500 px-10 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30',
                  )}
                  onClick={scrollToAuth}
                >
                  Get Started Free
                  <ArrowRight className="ml-2.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═════════════════ 7. AUTH SECTION ═════════════════ */}
        <section id="auth-section" className="border-t border-zinc-800/30 px-5 py-28 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-md"
          >
            <div className="mb-10 text-center">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={isSignUp ? 'sign-up-title' : 'sign-in-title'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mb-2 text-3xl font-extrabold tracking-tight text-zinc-100"
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

            <Card className="glass border-zinc-800/50">
              <CardContent className="p-6 sm:p-7">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <AnimatePresence mode="wait">
                    {isSignUp && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Label
                          htmlFor="name"
                          className="mb-1.5 text-xs font-medium text-zinc-400"
                        >
                          Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                          required={isSignUp}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <Label
                      htmlFor="email"
                      className="mb-1.5 text-xs font-medium text-zinc-400"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="password"
                      className="mb-1.5 text-xs font-medium text-zinc-400"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={
                          isSignUp ? 'Min. 8 characters' : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'
                        }
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="border-zinc-800 bg-zinc-800/50 pr-10 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
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
                      'btn-glow mt-1 h-12 w-full rounded-xl bg-emerald-500 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/25',
                      loading && 'opacity-70',
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isSignUp ? 'Creating account...' : 'Signing in...'}
                      </>
                    ) : isSignUp ? (
                      'Create Account'
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <p className="text-center text-sm text-zinc-500">
                    {isSignUp
                      ? 'Already have an account?'
                      : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                      }}
                      className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* ═════════════════ 8. FOOTER ═════════════════ */}
        <footer className="border-t border-zinc-800/30 px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl lg:px-10">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand column */}
              <div className="lg:col-span-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/10">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-lg font-semibold tracking-tight text-zinc-100">
                    MindGuard
                  </span>
                </div>
                <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
                  Your premium Attention Operating System. Protect what matters
                  most — your focus, your time, your future.
                </p>
              </div>

              {/* Product links */}
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Product
                </h4>
                <ul className="space-y-3">
                  {['Features', 'Pricing', 'Changelog'].map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                        onClick={scrollToFeatures}
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company links */}
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Company
                </h4>
                <ul className="space-y-3">
                  {['About', 'Blog', 'Contact'].map((link) => (
                    <li key={link}>
                      <span className="cursor-default text-sm text-zinc-500">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal links */}
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Legal
                </h4>
                <ul className="space-y-3">
                  {['Privacy', 'Terms'].map((link) => (
                    <li key={link}>
                      <span className="cursor-default text-sm text-zinc-500">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-14 border-t border-zinc-800/30 pt-8">
              <p className="text-center text-xs text-zinc-600">
                &copy; {new Date().getFullYear()} MindGuard AI. Protect your
                attention.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
