'use client';

import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerSchema } from '@/lib/validators';
import {
  AuthCard,
  AuthHeader,
  AuthDivider,
  AuthSuccessOverlay,
  StepIndicator,
  BackButton,
  TermsNotice,
  TrustBadge,
} from './auth-shared';
import { AuthField } from './auth-field';
import { AuthButton, StepButton, AuthLink } from './auth-button';
import { OAuthButtons } from './oauth-buttons';
import { signUpLoadingMessages } from './auth-animations';

/* ────────────────────────────────────────────────────────────────
   Props
   ──────────────────────────────────────────────────────────────── */

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
  onRequireVerification?: (email: string) => void;
}

/* ────────────────────────────────────────────────────────────────
   Humanized error messages — warm, never blame the user
   ──────────────────────────────────────────────────────────────── */

function humanizeError(error: string): string {
  const lower = error.toLowerCase();

  if (lower.includes('email') && lower.includes('already')) {
    return "Looks like you've already joined MindGuard. Try signing in instead.";
  }
  if (lower.includes('invalid') || lower.includes('credentials')) {
    return "That email or password doesn't look right. Try again.";
  }
  if (lower.includes('password') && lower.includes('short')) {
    return "Your password needs at least 8 characters. Make it something you'll remember.";
  }
  if (lower.includes('email') && (lower.includes('valid') || lower.includes('format'))) {
    return "That email doesn't look right. Double-check it?";
  }
  if (lower.includes('name')) {
    return "We'd love to know your name — at least 2 characters.";
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed')) {
    return 'Something went wrong on our end. Give it another try?';
  }

  return error || 'Something went wrong. Please try again.';
}

/* ────────────────────────────────────────────────────────────────
   Step transition variants — slide right (forward) / left (back)
   ──────────────────────────────────────────────────────────────── */

const stepVariants = {
  enter: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? 60 : -60,
    scale: 0.97,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? -60 : 60,
    scale: 0.97,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ────────────────────────────────────────────────────────────────
   Step-level validation helpers
   ──────────────────────────────────────────────────────────────── */

function validateName(name: string): string | null {
  if (!name.trim()) return "We'd love to know your name — at least 2 characters.";
  if (name.trim().length < 2) return "We'd love to know your name — at least 2 characters.";
  return null;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return "That email doesn't look right. Double-check it?";
  const basicEmailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicEmailCheck.test(email.trim())) return "That email doesn't look right. Double-check it?";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Your password needs at least 8 characters. Make it something you'll remember.";
  if (password.length < 8) return "Your password needs at least 8 characters. Make it something you'll remember.";
  return null;
}

/* ────────────────────────────────────────────────────────────────
   SignUpForm — Conversational Multi-Step Flow
   ──────────────────────────────────────────────────────────────── */

export function SignUpForm({ onSwitchToSignIn, onForgotPassword, onSuccess, onRequireVerification }: SignUpFormProps) {
  // ── State ──────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  // ── OAuth availability ─────────────────────────────────────────
  const oAuthAvailable =
    typeof window !== 'undefined' &&
    (process.env.NEXT_PUBLIC_GOOGLE_OAUTH === 'true' ||
      process.env.NEXT_PUBLIC_GITHUB_OAUTH === 'true');

  // ── Step navigation ────────────────────────────────────────────
  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 'forward' : 'back');
    setCurrentStep(step);
    // Clear the error for the step we're navigating to
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[step];
      return next;
    });
    setGlobalError('');
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // ── Step 1: Name validation & advance ──────────────────────────
  const handleStep1Continue = useCallback(() => {
    const error = validateName(formData.name);
    if (error) {
      setStepErrors((prev) => ({ ...prev, 1: error }));
      return;
    }
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[1];
      return next;
    });
    goToStep(2);
  }, [formData.name, goToStep]);

  // ── Step 2: Email validation & advance ─────────────────────────
  const handleStep2Continue = useCallback(() => {
    const error = validateEmail(formData.email);
    if (error) {
      setStepErrors((prev) => ({ ...prev, 2: error }));
      return;
    }
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[2];
      return next;
    });
    goToStep(3);
  }, [formData.email, goToStep]);

  // ── Step 3: Password validation & submit ───────────────────────
  const handleStep3Submit = useCallback(async () => {
    const error = validatePassword(formData.password);
    if (error) {
      setStepErrors((prev) => ({ ...prev, 3: error }));
      return;
    }

    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[3];
      return next;
    });
    setGlobalError('');
    setLoading(true);

    try {
      // Final validation with the server schema
      const validated = registerSchema.parse({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Register via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(data.error || 'Registration failed');
      }

      // Sign in with credentials
      const result = await signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid credentials');
      }

      // Show success overlay
      setAuthSuccess(true);
      setTimeout(onSuccess, 1200);
    } catch (err: unknown) {
      setAuthSuccess(false);
      if (err instanceof Error) {
        setGlobalError(humanizeError(err.message));
      } else {
        setGlobalError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, onSuccess]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[420px] mx-auto"
    >
      <AuthCard>
        {/* Success overlay */}
        <AuthSuccessOverlay
          show={authSuccess}
          message="Welcome aboard!"
          subtext="Getting your coach ready\u2026"
        />

        {/* Back button — only on steps 2 and 3 */}
        {currentStep > 1 && <BackButton onClick={goBack} />}

        {/* Step indicator */}
        <div className="mb-6">
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        {/* ── Step Content with AnimatePresence ──────────────── */}
        <AnimatePresence mode="wait" custom={direction}>
          {/* ─── Step 1: What should we call you? ──────────── */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <AuthHeader
                title="What should we call you?"
                subtitle="We'll use this to personalize your experience."
              />

              {/* OAuth buttons — only on Step 1 */}
              <OAuthButtons mode="signup" />
              {oAuthAvailable && <AuthDivider />}

              {/* Name field */}
              <div className="space-y-4">
                <AuthField
                  id="signup-name"
                  label="Your name"
                  placeholder="e.g. Alex"
                  value={formData.name}
                  onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
                  autoComplete="name"
                  autoFocus
                  required
                  error={stepErrors[1] ?? undefined}
                  onSubmit={handleStep1Continue}
                />

                <StepButton
                  onClick={handleStep1Continue}
                  disabled={!formData.name.trim()}
                >
                  Continue
                </StepButton>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Where can we reach you? ────────────── */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <AuthHeader
                title="Where can we reach you?"
                subtitle="We'll only use this to sign you in and important updates."
              />

              <div className="space-y-4">
                <AuthField
                  id="signup-email"
                  label="Your email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
                  autoComplete="email"
                  autoFocus
                  required
                  error={stepErrors[2] ?? undefined}
                  hint="We'll never share your email."
                  onSubmit={handleStep2Continue}
                />

                <StepButton
                  onClick={handleStep2Continue}
                  disabled={!formData.email.trim()}
                >
                  Continue
                </StepButton>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Choose a password ──────────────────── */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <AuthHeader
                title="Choose a password"
                subtitle="Make it something you'll remember — at least 8 characters."
              />

              <div className="space-y-4">
                <AuthField
                  id="signup-password"
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(v) => setFormData((p) => ({ ...p, password: v }))}
                  showPasswordToggle
                  showStrength
                  autoComplete="new-password"
                  autoFocus
                  required
                  error={stepErrors[3] ?? undefined}
                  onSubmit={handleStep3Submit}
                />

                {/* Global error — softer, more encouraging */}
                <AnimatePresence>
                  {globalError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-xl bg-red-500/[0.06] border border-red-500/10 px-4 py-3"
                      role="alert"
                      aria-live="polite"
                    >
                      <p className="text-xs text-red-400/90 leading-relaxed">{globalError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AuthButton
                  loading={loading}
                  onClick={handleStep3Submit}
                  type="button"
                  loadingMessages={signUpLoadingMessages}
                  disabled={formData.password.length < 8}
                >
                  Create your account
                </AuthButton>

                {/* Terms notice */}
                <TermsNotice className="mt-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer: switch to sign in ──────────────────────── */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-sm">
          <span className="text-zinc-500">Already have an account?</span>
          <AuthLink onClick={onSwitchToSignIn}>Sign in</AuthLink>
        </div>

        {/* ── Trust badge — only on Step 3 ───────────────────── */}
        {currentStep === 3 && <TrustBadge />}
      </AuthCard>
    </motion.div>
  );
}
