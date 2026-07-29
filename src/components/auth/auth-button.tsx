'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────
   AuthButton — Primary / Secondary / Ghost
   ────────────────────────────────────────────── */

interface AuthButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  loadingMessages?: readonly string[];
}

export function AuthButton({
  loading = false,
  children,
  onClick,
  type = 'submit',
  variant = 'primary',
  className,
  disabled = false,
  loadingMessages: messages = ['Preparing your workspace\u2026', 'Almost there\u2026'],
}: AuthButtonProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (loading) {
      clearRotation();
      intervalRef.current = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2000);
    } else {
      clearRotation();
    }
    return clearRotation;
  }, [loading, clearRotation, messages]);

  const effectiveIndex = loading ? messageIndex : 0;

  // Height map: primary gets h-13, secondary gets h-12, ghost gets h-10
  const heightClass = variant === 'primary' ? 'h-[56px]' : variant === 'secondary' ? 'h-[52px]' : 'h-11';

  // Style map per variant
  const variantStyles: Record<string, string> = {
    primary:
      'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] active:from-emerald-600 active:to-emerald-700 active:scale-[0.99]',
    secondary:
      'bg-zinc-800/50 text-zinc-300 border border-zinc-700/30 shadow-none hover:bg-zinc-800/70 hover:text-zinc-200 hover:border-zinc-600/40 active:bg-zinc-800/90',
    ghost:
      'bg-transparent text-zinc-400 border-none shadow-none hover:bg-zinc-800/40 hover:text-zinc-300 active:bg-zinc-800/60',
  };

  return (
    <div className="space-y-2">
      <Button
        type={type}
        onClick={onClick}
        disabled={loading || disabled}
        className={cn(
          'w-full rounded-xl text-[15px] font-semibold transition-all duration-300 ease-out cursor-pointer',
          heightClass,
          variantStyles[variant] ?? variantStyles.primary,
          loading && 'opacity-80',
          className,
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={effectiveIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {messages[effectiveIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}

/* ──────────────────────────────────────────────
   StepButton — For advancing steps in
   conversational flow
   ────────────────────────────────────────────── */

interface StepButtonProps {
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function StepButton({
  disabled = false,
  loading = false,
  children,
  onClick,
  className,
}: StepButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'group relative w-full h-[56px] rounded-xl text-base font-semibold',
        'transition-all duration-300 ease-out cursor-pointer',
        'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white',
        'shadow-lg shadow-emerald-500/20',
        'hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01]',
        'active:from-emerald-600 active:to-emerald-700 active:scale-[0.99]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg disabled:hover:from-emerald-500 disabled:hover:to-emerald-600',
        className,
      )}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>One moment\u2026</span>
          </>
        ) : (
          <>
            <span>{children ?? 'Continue'}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </span>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
   AuthLink — Small text link for auth form toggles
   ────────────────────────────────────────────── */

interface AuthLinkProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function AuthLink({
  children,
  onClick,
  className,
}: AuthLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-sm font-medium text-emerald-400/80 transition-all duration-200 cursor-pointer',
        'hover:text-emerald-400 hover:underline hover:underline-offset-4 hover:decoration-emerald-400/30',
        'active:text-emerald-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-sm',
        className,
      )}
    >
      {children}
    </button>
  );
}
