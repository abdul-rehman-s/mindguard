'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { successOverlay, successIcon, checkDraw, glowPulse } from './auth-animations';

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
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={successOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-emerald-500/10 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center gap-5 text-center">
            <motion.div variants={successIcon} initial="hidden" animate="visible" className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-150" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/20">
                <svg
                  className="h-8 w-8 text-emerald-400"
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
            <div className="space-y-1.5">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-emerald-400"
              >
                {message}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-zinc-400"
              >
                {subtext}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Auth form card wrapper with premium glassmorphism and ambient glow */
export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="relative">
        {/* Ambient glow behind card */}
        <motion.div
          variants={glowPulse}
          initial="initial"
          animate="animate"
          className="absolute -inset-4 rounded-3xl bg-emerald-500/[0.03] blur-2xl"
          aria-hidden="true"
        />

        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/70 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* Top glow line — premium gradient */}
          <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

          {/* Subtle inner glow at top */}
          <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-emerald-500/[0.03] to-transparent" aria-hidden="true" />

          <div className="relative p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Auth form header with animated title and subtitle */
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
    <div className="mb-6 text-center">
      <AnimatePresence mode="wait">
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mb-2 text-xl font-bold tracking-tight text-zinc-100"
        >
          {Icon && <Icon className="mr-2 inline-block h-5 w-5 text-emerald-400 -mt-0.5" />}
          {title}
        </motion.h2>
      </AnimatePresence>
      <p className="text-sm text-zinc-500 leading-relaxed max-w-[280px] mx-auto">{subtitle}</p>
    </div>
  );
}

/** Divider with "or" text — only shown when OAuth is available */
export function AuthDivider({ text = 'or continue with email' }: { text?: string }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-800/30" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-zinc-900/80 px-3 text-zinc-500 backdrop-blur-sm">{text}</span>
      </div>
    </div>
  );
}

/** Trust badge — privacy indicator near the CTA */
export function TrustBadge({ text = 'Your data stays private. Always.' }: { text?: string }) {
  return (
    <div className="mt-5 flex items-center justify-center gap-1.5">
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/15">
        <svg className="h-2.5 w-2.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <span className="text-[11px] text-zinc-500 font-medium">{text}</span>
    </div>
  );
}
