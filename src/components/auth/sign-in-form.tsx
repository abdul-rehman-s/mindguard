'use client';

import { useState, useCallback } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { loginSchema } from '@/lib/validators';
import {
  AuthCard,
  AuthHeader,
  AuthDivider,
  StepIndicator,
  BackButton,
  TrustBadge,
} from './auth-shared';
import { AuthField } from './auth-field';
import { AuthButton, StepButton, AuthLink } from './auth-button';
import { OAuthButtons } from './oauth-buttons';
import { cardEntrance, signInLoadingMessages } from './auth-animations';

/* ────────────────────────────────────────────────────────────────
   Props
   ──────────────────────────────────────────────────────────────── */

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
}

/* ────────────────────────────────────────────────────────────────
   Humanized error messages — coach-like, never robotic
   ──────────────────────────────────────────────────────────────── */

function humanizeError(error: string): string {
  const lower = error.toLowerCase();

  if (lower.includes('wrong password')) {
    return "That password doesn't look right. Give it another try?";
  }
  if (lower.includes('invalid') || lower.includes('credentials') || lower.includes('wrong')) {
    return "That email or password doesn't look right. Give it another try?";
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Something went wrong on our end. Give it another try?';
  }
  return 'Something went wrong. Please try again.';
}

/* ────────────────────────────────────────────────────────────────
   Step transition variants — slide from right (forward) / left (back)
   ──────────────────────────────────────────────────────────────── */

const stepVariants = {
  enterForward: {
    opacity: 0,
    x: 60,
    scale: 0.97,
  },
  enterBack: {
    opacity: 0,
    x: -60,
    scale: 0.97,
  },
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exitForward: {
    opacity: 0,
    x: -60,
    scale: 0.97,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exitBack: {
    opacity: 0,
    x: 60,
    scale: 0.97,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

/* ────────────────────────────────────────────────────────────────
   Email validation helper
   ──────────────────────────────────────────────────────────────── */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ────────────────────────────────────────────────────────────────
   SignInForm — Conversational two-step flow
   ──────────────────────────────────────────────────────────────── */

export function SignInForm({ onSwitchToSignUp, onForgotPassword, onSuccess }: SignInFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Direction tracking for animations
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // OAuth availability check
  const oAuthAvailable =
    typeof window !== 'undefined' &&
    (process.env.NEXT_PUBLIC_GOOGLE_OAUTH === 'true' ||
      process.env.NEXT_PUBLIC_GITHUB_OAUTH === 'true');

  /* ── Step 1 → Step 2 ── */
  const handleEmailContinue = useCallback(() => {
    setEmailError('');
    setAuthError('');

    if (!email.trim()) {
      setEmailError("We'll need your email to find your account.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("That email doesn't look right. Double-check it?");
      return;
    }

    setDirection('forward');
    setStep(2);
  }, [email]);

  /* ── Step 2 → Step 1 (back) ── */
  const handleGoBack = useCallback(() => {
    setDirection('back');
    setAuthError('');
    setPasswordError('');
    setStep(1);
  }, []);

  /* ── Sign in (Step 2 submit) ── */
  const handleSignIn = useCallback(async () => {
    setPasswordError('');
    setAuthError('');

    if (!password.trim()) {
      setPasswordError("You'll need to enter your password.");
      return;
    }

    setLoading(true);

    try {
      // Validate with Zod schema
      loginSchema.parse({ email, password });

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid credentials');
      }

      // Brief success state on button, then transition
      setSuccess(true);
      // Force session refresh so page.tsx detects the new authenticated state
      await getSession();
      // Small delay so the user sees the success state before page transition
      await new Promise((r) => setTimeout(r, 400));
      onSuccess();
    } catch (err: unknown) {
      setSuccess(false);
      if (err instanceof Error) {
        setAuthError(humanizeError(err.message));
      } else {
        setAuthError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, onSuccess]);

  /* ── Get animation variants based on direction ── */
  const getStepAnimation = (type: 'enter' | 'exit') => {
    if (type === 'enter') {
      return direction === 'forward' ? stepVariants.enterForward : stepVariants.enterBack;
    }
    return direction === 'forward' ? stepVariants.exitForward : stepVariants.exitBack;
  };

  return (
    <motion.div
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[600px]"
    >
      <AuthCard>
        {/* Back button — Step 2 only */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <BackButton onClick={handleGoBack} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator — 2 dots */}
        <div className="mb-8">
          <StepIndicator currentStep={step} totalSteps={2} />
        </div>

        {/* ── Step content with AnimatePresence ── */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 ? (
            <motion.div
              key="step-1"
              custom={direction}
              initial={getStepAnimation('enter')}
              animate={stepVariants.center}
              exit={getStepAnimation('exit')}
            >
              {/* Header — conversational question */}
              <AuthHeader
                title="What's your email?"
                subtitle="We'll look you up in our system."
              />

              {/* OAuth buttons — top of Step 1 only */}
              <OAuthButtons mode="signin" />
              {oAuthAvailable && <AuthDivider />}

              {/* Email field */}
              <div className="flex flex-col gap-5">
                <AuthField
                  id="signin-email"
                  label="Your email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    setEmailError('');
                    setAuthError('');
                  }}
                  error={emailError}
                  autoComplete="email"
                  autoFocus
                  required
                  onSubmit={handleEmailContinue}
                />

                {/* Continue button */}
                <StepButton
                  onClick={handleEmailContinue}
                  disabled={!email.trim() || !!emailError}
                >
                  Continue
                </StepButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              custom={direction}
              initial={getStepAnimation('enter')}
              animate={stepVariants.center}
              exit={getStepAnimation('exit')}
            >
              {/* Header — "Welcome back" with email shown */}
              <AuthHeader
                title="Welcome back"
                subtitle={email}
              />

              {/* Password field + sign in */}
              <div className="flex flex-col gap-5">
                <AuthField
                  id="signin-password"
                  label="Password"
                  type="password"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    setPasswordError('');
                    setAuthError('');
                  }}
                  error={passwordError}
                  showPasswordToggle
                  autoComplete="current-password"
                  autoFocus
                  required
                  onSubmit={handleSignIn}
                />

                {/* Forgot password — more prominent */}
                <div className="flex justify-end -mt-1">
                  <AuthLink onClick={onForgotPassword} className="text-xs">
                    Forgot your password?
                  </AuthLink>
                </div>

                {/* Global auth error — softer, encouraging */}
                <AnimatePresence>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-xl bg-red-500/[0.06] border border-red-500/10 px-4 py-3"
                      role="alert"
                      aria-live="polite"
                    >
                      <p className="text-xs text-red-400/90 leading-relaxed">
                        {authError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sign in button */}
                <AuthButton
                  loading={loading}
                  success={success}
                  onClick={handleSignIn}
                  type="button"
                  loadingMessages={signInLoadingMessages}
                >
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </AuthButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer — "Don't have an account? Let's get started" */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[15px]">
          <span className="text-zinc-500">Don&apos;t have an account?</span>
          <AuthLink onClick={onSwitchToSignUp}>Let&apos;s get started</AuthLink>
        </div>

        {/* Trust badge */}
        <TrustBadge />
      </AuthCard>
    </motion.div>
  );
}
