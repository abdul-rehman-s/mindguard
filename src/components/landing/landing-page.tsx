'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Star,
  Target,
  Timer,
  Shield,
  Quote,
  ChevronDown,
  Sparkles,
  Monitor,
  Globe,
  Lock,
  EyeOff,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { MindGuardHeroLogo, MindGuardLogo } from '@/components/branding/mindguard-logo';
import { AuthExperience } from '@/components/auth/auth-experience';
import {
  heroContainer,
  heroItem,
  AnimatedSection,
  StarRating,
  InteractiveDemo,
  features,
  testimonials,
  faqItems,
} from './landing-data';

/* ─── Ambient orbs ─── */
const ambientOrbs = [
  { size: 800, opacity: 0.06, x: '-15%', y: '-10%', delay: '0s' },
  { size: 600, opacity: 0.04, x: '55%', y: '5%', delay: '2s' },
  { size: 400, opacity: 0.03, x: '20%', y: '55%', delay: '4s' },
];

/* ─── Security features ─── */
const securityFeatures = [
  { icon: Lock, title: 'Local-first Storage', description: 'Your data lives on your device first. Sync only when you choose it.' },
  { icon: Shield, title: 'End-to-end Encryption', description: 'All data syncs encrypted. We can\'t read your focus data — ever.' },
  { icon: EyeOff, title: 'No Tracking', description: 'Zero analytics tracking, zero ads, zero third-party data sharing.' },
  { icon: Globe, title: 'GDPR Compliant', description: 'Full compliance with EU data protection. Data portability and deletion on request.' },
];

/* ─── Pricing tiers ─── */
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

/* ─── Testimonial carousel ─── */

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
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            variants={{ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="snap-center shrink-0 w-[320px] sm:w-[350px]"
          >
            <Card className="card-glow glass-card relative cursor-default flex h-full flex-col overflow-hidden border-zinc-800/30 p-6 backdrop-blur-sm">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/[0.05] blur-[40px]" />
              <Quote className="mb-3 h-5 w-5 text-emerald-500/20" />
              <StarRating rating={t.rating} />
              <Badge className="mt-3 bg-emerald-500/[0.08] text-emerald-400 text-[10px] ring-1 ring-emerald-500/15 border-emerald-500/20 px-2 py-0.5 font-medium">
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

      <div className="flex justify-center gap-1.5 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
              i === activeIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
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
  const [scrolled, setScrolled] = useState(false);

  /* Track scroll for navbar style */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleAuthSuccess = () => {
    // Auth success triggers the normal session flow in page.tsx
  };

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-zinc-950">
      {/* ═══ Background Layer ═══ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.4)_70%)]" />

        {/* Animated gradient background — slower, calmer */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.06) 0%, transparent 50%)',
              'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.04) 0%, transparent 50%)',
              'radial-gradient(ellipse at 70% 30%, rgba(20,184,166,0.05) 0%, transparent 50%)',
              'radial-gradient(ellipse at 40% 50%, rgba(16,185,129,0.06) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        {/* Ambient floating orbs — slower, more meditative */}
        {ambientOrbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `rgba(16,185,129,${orb.opacity})`,
              filter: 'blur(180px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.03, 1] }}
            transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
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
            scrolled ? 'border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl' : 'bg-transparent',
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

            {/* CTA — conversational copy */}
            <Button
              size="sm"
              className="hidden md:flex cursor-pointer rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 text-white ring-1 ring-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 text-sm font-semibold border-0 shadow-lg shadow-emerald-500/15 transition-all"
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
              className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16 lg:items-center"
            >
              {/* ── Hero Text Column ── */}
              <div className="flex-1 text-center lg:text-left lg:max-w-[560px]">
                {/* Announcement badge */}
                <motion.div variants={heroItem} className="mb-6">
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

                {/* Main headline — more emotional, conversational */}
                <motion.h1
                  variants={heroItem}
                  className="mb-5 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-zinc-50 sm:text-[3.5rem] lg:text-[4rem]"
                >
                  Your focus deserves{' '}
                  <span className="gradient-text">a coach.</span>
                  <br />
                  <span className="text-zinc-200">Not another app.</span>
                </motion.h1>

                {/* Subtitle — conversational, not marketing-y */}
                <motion.p
                  variants={heroItem}
                  className="mb-8 text-[1rem] leading-[1.7] text-zinc-400 sm:text-[1.1rem]"
                >
                  MindGuard learns how you work, what breaks your focus, and when you&apos;re at your best — then coaches you to do more of what works. It&apos;s like having a personal productivity partner.
                </motion.p>

                {/* CTA buttons — more conversational */}
                <motion.div variants={heroItem} className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="cursor-pointer group h-11 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/25"
                    onClick={() => scrollToSection('auth-section')}
                  >
                    Let&apos;s get started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="cursor-pointer h-11 rounded-xl border-zinc-800/40 bg-zinc-900/30 px-6 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/40 hover:border-zinc-700/40 shadow-none"
                    onClick={() => scrollToSection('demo-section')}
                  >
                    See how it works
                  </Button>
                </motion.div>

                {/* Trust indicators — more prominent */}
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
                className="w-full max-w-[420px] lg:w-[420px]"
              >
                <AuthExperience onSuccess={handleAuthSuccess} />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═════════════════ 2. INTERACTIVE DEMO ═════════════════ */}
        <section id="demo-section" className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-7xl lg:px-8">
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
                  A live preview of the MindGuard dashboard. Timer running, missions progressing, streaks growing — all real-time.
                </p>
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

        {/* ═════════════════ 3. FEATURES ═════════════════ */}
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
                A complete system designed for deep work. Every feature exists to protect and amplify your attention.
              </p>
            </AnimatedSection>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <AnimatedSection key={feature.title} delay={i * 0.04}>
                    <Card className="card-glow glass-card lift-hover group relative h-full cursor-default overflow-hidden border-zinc-800/30 p-6 backdrop-blur-sm transition-all duration-300 sm:p-7">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/10 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/10 group-hover:scale-105">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="relative mb-2 text-base font-bold tracking-tight text-zinc-100">
                        {feature.title}
                      </h3>
                      <p className="relative text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300">
                        {feature.description}
                      </p>
                    </Card>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═════════════════ 4. TESTIMONIALS ═════════════════ */}
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

        {/* ═════════════════ 5. PRICING ═════════════════ */}
        <section id="pricing-section" className="border-t border-zinc-800/20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl lg:px-8">
            <AnimatedSection className="mb-14 text-center">
              <Badge className="mb-4 cursor-default gap-2 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/10">
                <Sparkles className="h-3.5 w-3.5" />
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
                <AnimatedSection key={tier.name} delay={i * 0.06}>
                  <Card className={cn(
                    'relative overflow-hidden h-full backdrop-blur-sm',
                    tier.highlighted
                      ? 'glass-card-active lift-hover border-emerald-500/20 ring-1 ring-emerald-500/10'
                      : 'glass-card lift-hover border-zinc-800/30',
                  )}>
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
                    <CardContent className="p-6 sm:p-7">
                      <h3 className="text-lg font-bold text-zinc-100 mb-1">{tier.name}</h3>
                      <div className="mb-4 flex items-baseline gap-1">
                        <span className={cn(
                          'text-3xl font-extrabold',
                          tier.highlighted ? 'text-emerald-400' : 'text-zinc-100'
                        )}>
                          {tier.price}
                        </span>
                        <span className="text-sm text-zinc-500">{tier.period}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-6">{tier.description}</p>
                      <ul className="space-y-2.5 mb-8">
                        {tier.features.map(feature => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400/70 shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={cn(
                          'w-full rounded-xl h-10 text-sm font-semibold transition-all cursor-pointer',
                          tier.highlighted
                            ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl'
                            : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/30 shadow-none hover:bg-zinc-800/70 hover:text-zinc-200',
                        )}
                        onClick={() => scrollToSection('auth-section')}
                      >
                        {tier.cta}
                        {tier.highlighted && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════ 6. SECURITY ═════════════════ */}
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
                Privacy-first principles. Your attention data is personal — we treat it that way.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {securityFeatures.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.06 }}
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

        {/* ═════════════════ 7. FAQ ═════════════════ */}
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
                    <AccordionTrigger className="text-sm font-semibold text-zinc-200 hover:text-emerald-400 hover:no-underline py-4 cursor-pointer">
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

        {/* ═════════════════ 8. FINAL CTA ═════════════════ */}
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
                    Ready to meet your{' '}
                    <span className="gradient-text">coach?</span>
                  </h2>
                  <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-zinc-400">
                    Join 10,000+ focused professionals. Free forever. No credit card. Start in 30 seconds.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                    <Button
                      size="lg"
                      className="pulse-glow cursor-pointer group h-12 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-8 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/30"
                      onClick={() => scrollToSection('auth-section')}
                    >
                      Let&apos;s get started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="cursor-pointer h-12 rounded-xl border-zinc-700/30 bg-zinc-900/40 px-8 text-base font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/40 hover:border-zinc-600/30 shadow-none"
                      onClick={() => scrollToSection('demo-section')}
                    >
                      See how it works
                    </Button>
                  </div>
                  <p className="mt-4 text-sm text-zinc-500">
                    Free forever · No credit card · Set up in 30 seconds
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ═════════════════ 9. FOOTER ═════════════════ */}
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
