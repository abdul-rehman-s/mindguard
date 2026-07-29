'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { AuthCard, AuthHeader } from './auth-shared';
import { AuthButton, AuthLink } from './auth-button';
import { AuthField } from './auth-field';
import { cardEntrance } from './auth-animations';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !email.includes('@')) {
        throw new Error('That email doesn\'t look right. Double-check it?');
      }

      // TODO: Implement actual password reset API endpoint
      // For now, simulate the flow
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSent(true);
      setCountdown(60);

      // Countdown for resend
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    // TODO: Implement resend API
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="visible" className="w-full max-w-[420px]">
      <AuthCard>
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="request"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AuthHeader
                title="Reset your password"
                subtitle="No worries — it happens to everyone. Enter your email and we'll send you a link to get back in."
              />

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <AuthField
                  id="forgot-email"
                  label="Your email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  autoFocus
                  required
                  hint="We'll send a reset link to this address."
                />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="rounded-xl bg-red-500/[0.06] border border-red-500/10 px-4 py-3"
                      role="alert"
                      aria-live="polite"
                    >
                      <p className="text-xs text-red-400/90 leading-relaxed">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AuthButton loading={loading} type="submit">
                  Send reset link
                  <Mail className="ml-2 h-4 w-4" />
                </AuthButton>
              </form>

              <div className="mt-6 flex items-center justify-center">
                <AuthLink onClick={onBack}>
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5 inline" />
                  Back to sign in
                </AuthLink>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-4"
            >
              {/* Success icon */}
              <div className="relative mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl scale-150" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20"
                >
                  <Mail className="h-7 w-7 text-emerald-400" />
                </motion.div>
              </div>

              <h3 className="text-lg font-bold text-zinc-100 mb-2">Check your email</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-1">
                We've sent a password reset link to
              </p>
              <p className="text-sm font-medium text-zinc-200 mb-6">{email}</p>

              {/* What happens next */}
              <div className="rounded-xl bg-zinc-800/30 border border-zinc-800/30 p-4 mb-6 text-left">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-300">What happens next:</strong> Click the link in the email to set a new password. The link expires in 15 minutes for security.
                </p>
              </div>

              {/* Resend */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className="cursor-pointer text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend email'}
                </button>

                <p className="text-xs text-zinc-600">
                  Didn't receive it? Check your spam folder.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/30">
                <AuthLink onClick={onBack}>
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5 inline" />
                  Back to sign in
                </AuthLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AuthCard>
    </motion.div>
  );
}
