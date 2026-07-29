'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MindGuardLogo } from '@/components/branding/mindguard-logo';
import { HeroSection } from './hero-section';
import { StorySection } from './story-section';
import { ClosingSection } from './closing-section';
import {
  ParticleField,
  AmbientOrbs,
  CursorGlow,
  BackgroundGradient,
} from './ambient-effects';

/* ─── Premium ease curves ─── */
const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── NAVIGATION — Minimal, premium, purposeful ─── */
/* ═══════════════════════════════════════════════════════════════════ */

function Navigation({ onBegin, scrolled }: { onBegin: () => void; scrolled: boolean }) {
  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: APPLE_EASE }}
      className={cn(
        'fixed top-0 z-50 mx-auto w-full transition-all duration-700',
        scrolled
          ? 'border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-2xl shadow-2xl shadow-black/20'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <MindGuardLogo size="sm" showText={true} />

        {/* Desktop nav links — minimal, no labels like "Features" or "How It Works" */}
        <div className="hidden items-center gap-6 md:flex">
          {[
            { label: 'Story', id: 'story-section' },
            { label: 'Outcomes', id: 'features-section' },
            { label: 'Pricing', id: 'pricing-section' },
          ].map((link) => (
            <button
              key={link.label}
              type="button"
              className="cursor-pointer text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors duration-300 tracking-wide"
              onClick={() => scrollToSection(link.id)}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA — premium, purposeful */}
        <Button
          size="sm"
          className="hidden md:flex cursor-pointer group rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 text-white ring-1 ring-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 text-sm font-semibold border-0 shadow-lg shadow-emerald-500/15 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] h-9 px-4"
          onClick={onBegin}
        >
          Begin
          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Button>

        {/* Mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden cursor-pointer text-zinc-400"
          onClick={onBegin}
        >
          Sign In
        </Button>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── LANDING PAGE — Main orchestrator ─── */
/* ═══════════════════════════════════════════════════════════════════ */

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAuthSuccess = () => {
    // Session refresh is handled by the form components via getSession().
  };

  const handleBegin = () => {
    // Scroll to the top (hero section) and trigger the auth flow
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-zinc-950">
      {/* ═══ Background Effects Layer ═══ */}
      <ParticleField />
      <AmbientOrbs />
      <CursorGlow />
      <BackgroundGradient />

      {/* ═══ Content Layer ═══ */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* ═══ Navigation ═══ */}
        <Navigation onBegin={handleBegin} scrolled={scrolled} />

        {/* ═══ Hero Section ═══ */}
        <HeroSection onAuthSuccess={handleAuthSuccess} />

        {/* ═══ Story + Features + Testimonials + Pricing + FAQ ═══ */}
        <StorySection />

        {/* ═══ Closing CTA + Footer ═══ */}
        <ClosingSection onBegin={handleBegin} />
      </div>
    </div>
  );
}
