'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  successOverlay,
  successIcon,
  checkDraw,
  glowPulse,
} from './auth-animations';

/* ────────────────────────────────────────────────────────────────
   1. AuthCard — Premium glassmorphism card
   ──────────────────────────────────────────────────────────────── */

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('w-full max-w-[420px] mx-auto', className)}>
      <motion.div
        initial="initial"
        animate="animate"
        className="relative group"
      >
        {/* Ambient glow — more visible, pulsing emerald aura */}
        <motion.div
          variants={glowPulse}
          initial="initial"
          animate="animate"
          className="absolute -inset-6 rounded-3xl bg-emerald-500/[0.06] blur-3xl will-change-[opacity,transform]"
          aria-hidden="true"
        />
        {/* Secondary softer glow ring */}
        <div
          className="absolute -inset-3 rounded-[1.5rem] bg-emerald-500/[0.02] blur-2xl will-change-[opacity] group-hover:bg-emerald-500/[0.04] transition-colors duration-700"
          aria-hidden="true"
        />

        {/* Card body */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/80 backdrop-blur-2xl shadow-2xl shadow-black/30 transition-all duration-500 group-hover:border-zinc-700/60 group-hover:shadow-emerald-500/[0.03] group-hover:shadow-2xl">
          {/* Top premium gradient line — emerald shimmer */}
          <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          {/* Secondary thin line for depth */}
          <div className="absolute left-4 right-4 top-[1px] h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

          {/* Inner glow at top — more visible emerald wash */}
          <div
            className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-emerald-500/[0.05] via-emerald-500/[0.02] to-transparent"
            aria-hidden="true"
          />

          {/* Corner accents */}
          <div className="absolute top-0 left-0 h-8 w-8 bg-gradient-to-br from-emerald-500/[0.06] to-transparent rounded-tl-2xl" aria-hidden="true" />
          <div className="absolute top-0 right-0 h-8 w-8 bg-gradient-to-bl from-emerald-500/[0.06] to-transparent rounded-tr-2xl" aria-hidden="true" />

          {/* Hover border glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-inset ring-emerald-500/10" aria-hidden="true" />

          <div className="relative p-6 sm:p-8">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   2. AuthSuccessOverlay — Success celebration with confetti
   ──────────────────────────────────────────────────────────────── */

/** Confetti particle component */
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute top-1/3 w-1.5 h-1.5 rounded-full"
      style={{ left: `${x}%`, background: color }}
      initial={{ opacity: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -60, -120],
        x: [0, (Math.random() - 0.5) * 80],
        scale: [0, 1, 0.6],
        rotate: [0, Math.random() * 360],
      }}
      transition={{
        duration: 1.8,
        delay,
        ease: 'easeOut',
      }}
      aria-hidden="true"
    />
  );
}

interface AuthSuccessOverlayProps {
  show: boolean;
  message?: string;
  subtext?: string;
}

export function AuthSuccessOverlay({
  show,
  message = 'Welcome aboard!',
  subtext = 'Getting everything ready for you\u2026',
}: AuthSuccessOverlayProps) {
  // Generate confetti particles only once
  const confettiParticles = useMemo(() => {
    const colors = [
      'rgb(52, 211, 153)',  // emerald-400
      'rgb(16, 185, 129)',  // emerald-500
      'rgb(110, 231, 183)', // emerald-300
      'rgb(251, 191, 36)',  // amber-400
      'rgb(167, 139, 250)', // violet-400
      'rgb(96, 165, 250)',  // blue-400
    ];
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      delay: 0.2 + i * 0.06,
      x: 10 + Math.random() * 80,
      color: colors[i % colors.length],
    }));
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={successOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-zinc-950/80 backdrop-blur-2xl overflow-hidden"
        >
          {/* Confetti particles */}
          {confettiParticles.map((p) => (
            <ConfettiParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
          ))}

          {/* Radial glow behind icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2.5], opacity: [0, 0.15, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-32 h-32 rounded-full bg-emerald-400"
            />
          </div>

          <div className="flex flex-col items-center gap-6 text-center relative z-10">
            {/* Checkmark icon — bigger, more celebratory */}
            <motion.div
              variants={successIcon}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Outer glow ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="absolute -inset-3 rounded-full bg-emerald-500/20 blur-xl"
              />
              {/* Inner glow */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4, type: 'spring', stiffness: 150 }}
                className="absolute -inset-1 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20"
              />
              {/* Main circle */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/25 shadow-lg shadow-emerald-500/10">
                <svg
                  className="h-10 w-10 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    variants={checkDraw}
                    initial="hidden"
                    animate="visible"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Text hierarchy */}
            <div className="space-y-2">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-2xl font-bold text-emerald-400 tracking-tight"
              >
                {message}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="text-sm text-zinc-400 leading-relaxed"
              >
                {subtext}
              </motion.p>
            </div>

            {/* Sparkle accent */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 180 }}
            >
              <Sparkles className="h-4 w-4 text-emerald-500/40" aria-hidden="true" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────────────
   3. AuthHeader — Form header with conversational title
   ──────────────────────────────────────────────────────────────── */

export function AuthHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-8 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Icon above title if present */}
          {Icon && (
            <div className="mb-3 flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/15">
                <Icon className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          )}
          {/* Larger title for conversational questions */}
          <h2 className="text-2xl sm:text-[1.7rem] font-bold tracking-tight text-zinc-100 leading-snug">
            {title}
          </h2>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.p
          key={subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.08 }}
          className="mt-2 text-sm text-zinc-500 leading-relaxed max-w-[300px] mx-auto"
        >
          {subtitle}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   4. AuthDivider — "or continue with email" divider
   ──────────────────────────────────────────────────────────────── */

export function AuthDivider({ text = 'or continue with email' }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-800/40" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-zinc-900/90 px-4 text-zinc-500/80 backdrop-blur-sm tracking-wide">
          {text}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   5. TrustBadge — Privacy indicator near the CTA
   ──────────────────────────────────────────────────────────────── */

export function TrustBadge({ text = 'Your data stays private. Always.' }: { text?: string }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/15">
        <Shield className="h-2.5 w-2.5 text-emerald-400" strokeWidth={2.5} />
      </div>
      <span className="text-[11px] text-zinc-500 font-medium tracking-wide">{text}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   6. StepIndicator — Progress dots for multi-step flow
   ──────────────────────────────────────────────────────────────── */

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <motion.div
            key={step}
            className="relative flex items-center justify-center"
            initial={false}
            animate={{
              width: isActive ? 24 : 8,
              height: 8,
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Background track */}
            <div
              className={cn(
                'h-full w-full rounded-full transition-colors duration-300',
                isCompleted
                  ? 'bg-emerald-500'
                  : isActive
                    ? 'bg-emerald-500/60'
                    : 'bg-zinc-800'
              )}
            />
            {/* Active pulse */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-400/40"
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              />
            )}
            {/* Completed checkmark */}
            {isCompleted && (
              <motion.svg
                className="absolute h-3 w-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <path d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   7. ConversationalStep — Wrapper for each step in the flow
   ──────────────────────────────────────────────────────────────── */

interface ConversationalStepProps {
  children: React.ReactNode;
  active: boolean;
  direction?: 'forward' | 'back';
}

const stepVariants = {
  enter: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? 40 : -40,
    scale: 0.98,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? -40 : 40,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function ConversationalStep({
  children,
  active,
  direction = 'forward',
}: ConversationalStepProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      {active && (
        <motion.div
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────────────
   8. BackButton — Back navigation button
   ──────────────────────────────────────────────────────────────── */

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = 'Back' }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="absolute top-4 left-4 z-10 h-8 gap-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-200 -ml-2"
      aria-label={label}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
}

/* ────────────────────────────────────────────────────────────────
   9. TermsNotice — Terms of service / privacy policy notice
   ──────────────────────────────────────────────────────────────── */

interface TermsNoticeProps {
  className?: string;
}

export function TermsNotice({ className }: TermsNoticeProps) {
  return (
    <p
      className={cn(
        'text-center text-[11px] leading-relaxed text-zinc-600 px-4',
        className,
      )}
    >
      By continuing, you agree to our{' '}
      <a
        href="/terms"
        className="text-zinc-400 underline underline-offset-2 decoration-zinc-700 hover:text-emerald-400 hover:decoration-emerald-500/50 transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        Terms of Service
      </a>{' '}
      and{' '}
      <a
        href="/privacy"
        className="text-zinc-400 underline underline-offset-2 decoration-zinc-700 hover:text-emerald-400 hover:decoration-emerald-500/50 transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        Privacy Policy
      </a>
    </p>
  );
}

/* ────────────────────────────────────────────────────────────────
   10. OAuthComingSoon — Badge for OAuth buttons not yet configured
   ──────────────────────────────────────────────────────────────── */

interface OAuthComingSoonProps {
  className?: string;
}

export function OAuthComingSoon({ className }: OAuthComingSoonProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
        'bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/50',
        'select-none pointer-events-none',
        className,
      )}
    >
      Soon
    </span>
  );
}
