'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { loginSchema } from '@/lib/validators';
import { AuthCard, AuthHeader, AuthDivider, AuthSuccessOverlay, TrustBadge } from './auth-shared';
import { AuthField } from './auth-field';
import { AuthButton, AuthLink } from './auth-button';
import { OAuthButtons } from './oauth-buttons';
import { cardEntrance, signInLoadingMessages } from './auth-animations';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
}

function humanizeError(error: string): string {
  if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credentials') || error.toLowerCase().includes('wrong')) {
    return 'That email or password doesn\'t look right. Give it another try?';
  }
  if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
    return 'Something went wrong on our end. Give it another try?';
  }
  return error || 'Something went wrong. Please try again.';
}

export function SignInForm({ onSwitchToSignUp, onForgotPassword, onSuccess }: SignInFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      loginSchema.parse(formData);

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      setAuthSuccess(true);
      setTimeout(onSuccess, 1200);
    } catch (err: unknown) {
      setAuthSuccess(false);
      if (err instanceof Error) {
        setError(humanizeError(err.message));
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const oAuthAvailable = typeof window !== 'undefined' &&
    (process.env.NEXT_PUBLIC_GOOGLE_OAUTH === 'true' || process.env.NEXT_PUBLIC_GITHUB_OAUTH === 'true');

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="visible" className="w-full max-w-[420px]">
      <AuthCard>
        <AuthSuccessOverlay
          show={authSuccess}
          message="Welcome back!"
          subtext="Picking up where you left off\u2026"
        />

        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to continue your journey with your AI coach."
        />

        {/* OAuth buttons — only shown when configured */}
        <OAuthButtons mode="signin" />
        {oAuthAvailable && <AuthDivider />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField
            id="signin-email"
            label="Your email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
            autoComplete="email"
            autoFocus
            required
          />

          <AuthField
            id="signin-password"
            label="Password"
            type="password"
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            value={formData.password}
            onChange={(v) => setFormData((p) => ({ ...p, password: v }))}
            showPasswordToggle
            autoComplete="current-password"
            required
          />

          {/* Forgot password — more prominent, less hidden */}
          <div className="flex justify-end -mt-1">
            <AuthLink onClick={onForgotPassword} className="text-xs">
              Forgot your password?
            </AuthLink>
          </div>

          {/* Global error — softer, more encouraging */}
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

          <AuthButton loading={loading} type="submit" loadingMessages={signInLoadingMessages}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </AuthButton>
        </form>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-sm">
          <span className="text-zinc-500">Don't have an account?</span>
          <AuthLink onClick={onSwitchToSignUp}>Let's get started</AuthLink>
        </div>

        {/* Trust badge */}
        <TrustBadge />
      </AuthCard>
    </motion.div>
  );
}
