'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Clock, ShieldCheck } from 'lucide-react';
import { AuthCard, AuthHeader } from './auth-shared';
import { AuthButton, AuthLink } from './auth-button';
import {
  cardEntrance,
  envelopeFloat,
  verificationLoadingMessages,
} from './auth-animations';

interface EmailVerificationProps {
  email: string;
  onBack: () => void;
  onVerified?: () => void;
}

export function EmailVerification({ email, onBack, onVerified }: EmailVerificationProps) {
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback((seconds: number = 60) => {
    clearCountdown();
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown]);

  // Start countdown on mount
  useEffect(() => {
    startCountdown(60);
    return clearCountdown;
  }, [startCountdown, clearCountdown]);

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;
    setResendLoading(true);

    try {
      // TODO: Implement resend verification email API
      await new Promise((resolve) => setTimeout(resolve, 800));
      startCountdown(60);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[560px]"
    >
      <AuthCard>
        <div className="text-center py-2">
          {/* Large animated envelope */}
          <div className="relative mx-auto mb-8">
            {/* Ambient glow behind envelope */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
            </motion.div>

            {/* Outer ring pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto flex h-24 w-24 items-center justify-center"
              aria-hidden="true"
            >
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.15, 0.08, 0.15],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/20"
              />
            </motion.div>

            {/* Envelope icon with floating animation */}
            <motion.div
              variants={envelopeFloat}
              initial="hidden"
              animate={['visible', 'floating']}
              className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
            >
              <Mail className="h-9 w-9 text-emerald-400" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl font-bold text-zinc-100 mb-2 tracking-tight"
          >
            Check your email
          </motion.h3>

          {/* Email display */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <p className="text-sm text-zinc-400 leading-relaxed mb-1">
              We've sent a verification link to
            </p>
            <p className="text-sm font-semibold text-zinc-200 bg-zinc-800/40 inline-block px-3 py-1 rounded-lg">
              {email}
            </p>
          </motion.div>

          {/* What happens next — guidance box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl bg-zinc-800/30 border border-zinc-800/40 p-4 mb-6 text-left space-y-3"
          >
            <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              What happens next
            </p>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/15 mt-0.5">
                <Mail className="h-3 w-3 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click the link in the email to verify your account
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/15 mt-0.5">
                <Clock className="h-3 w-3 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The link expires in 15 minutes for security
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/15 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Once verified, you'll be able to sign in and start your journey
              </p>
            </div>
          </motion.div>

          {/* Resend section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="space-y-3"
          >
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resendLoading}
              className="cursor-pointer text-sm font-medium text-emerald-400/80 hover:text-emerald-400 transition-colors duration-200 disabled:text-zinc-600 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 rounded-sm"
            >
              {countdown > 0 ? (
                <span className="flex items-center justify-center gap-1.5">
                  <motion.span
                    key={countdown}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    Resend in {countdown}s
                  </motion.span>
                </span>
              ) : (
                'Resend verification email'
              )}
            </button>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Didn't receive it? Check your spam folder.
            </p>
          </motion.div>

          {/* Back to sign in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="mt-6 pt-4 border-t border-zinc-800/30"
          >
            <AuthLink onClick={onBack}>
              <span className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </span>
            </AuthLink>
          </motion.div>
        </div>
      </AuthCard>
    </motion.div>
  );
}
