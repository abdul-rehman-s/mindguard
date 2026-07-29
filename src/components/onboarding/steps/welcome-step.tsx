'use client';

import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';
import { MindGuardHeroLogo } from '@/components/branding/mindguard-logo';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.97,
    filter: 'blur(3px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 25 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.97,
    filter: 'blur(3px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 25 },
  }),
};

export function WelcomeStep({ direction }: { direction: number }) {
  return (
    <motion.div
      key="s0"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col items-center text-center"
    >
      {/* Hero logo */}
      <MindGuardHeroLogo className="mb-8" />

      {/* Shield icon with premium animation */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.15 }}
        className="mb-8 flex h-18 w-18 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 sm:h-20 sm:w-20"
      >
        <Shield className="h-9 w-9 text-emerald-400 sm:h-10 sm:w-10" />
      </motion.div>

      {/* Headline — conversational, not software-like */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        className="mb-3 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
      >
        Let&apos;s build your personal
        <br />
        <span className="gradient-text">productivity coach.</span>
      </motion.h2>

      {/* Subtitle — warm and clear */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
        className="max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg"
      >
        MindGuard learns how you work, what distracts you,
        and when you&apos;re at your best — then coaches you accordingly.
      </motion.p>

      {/* Time + privacy commitment */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-sm text-zinc-500"
      >
        About 2 minutes. Everything stays private.
      </motion.p>

      {/* Personalization preview — builds trust */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.4 }}
        className="mt-6 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-5 py-3"
      >
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          What we&apos;ll personalize for you
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-zinc-400">
          <span>Coaching style</span>
          <span className="text-zinc-600">·</span>
          <span>Focus timers</span>
          <span className="text-zinc-600">·</span>
          <span>Dashboard layout</span>
          <span className="text-zinc-600">·</span>
          <span>Daily nudges</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
