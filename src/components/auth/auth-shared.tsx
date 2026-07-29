'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { successOverlay, successIcon } from './auth-animations';

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
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div variants={successIcon} initial="hidden" animate="visible" className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-150" />
              <CheckCircle2 className="relative h-14 w-14 text-emerald-400" />
            </motion.div>
            <div className="space-y-1">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-emerald-400"
              >
                {message}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
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

/** Auth form card wrapper with glass morphism and top glow */
export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/40 bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-black/30 ring-1 ring-inset ring-white/[0.04]">
        {/* Top glow line */}
        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

/** Auth form header with animated title and subtitle */
export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
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
          className="mb-1.5 text-xl font-bold tracking-tight text-zinc-100"
        >
          {title}
        </motion.h2>
      </AnimatePresence>
      <p className="text-sm text-zinc-500 leading-relaxed">{subtitle}</p>
    </div>
  );
}

/** Divider with "or" text */
export function AuthDivider({ text = 'or use email' }: { text?: string }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-800/30" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-zinc-900/60 px-3 text-zinc-500 backdrop-blur-sm">{text}</span>
      </div>
    </div>
  );
}
