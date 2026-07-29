'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { registerSchema, loginSchema } from '@/lib/validators';
import { AuthCard, AuthHeader, AuthDivider, AuthSuccessOverlay } from './auth-shared';
import { AuthField } from './auth-field';
import { AuthButton, AuthLink } from './auth-button';
import { OAuthButtons } from './oauth-buttons';
import { cardEntrance } from './auth-animations';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
}

/** Human-friendly error messages */
function humanizeError(error: string): string {
  if (error.toLowerCase().includes('email') && error.toLowerCase().includes('already')) {
    return 'Looks like you\'ve already joined MindGuard. Try signing in instead.';
  }
  if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credentials')) {
    return 'That email or password doesn\'t look right. Try again.';
  }
  if (error.toLowerCase().includes('password') && error.toLowerCase().includes('short')) {
    return 'Your password needs at least 8 characters. Make it something you\'ll remember.';
  }
  if (error.toLowerCase().includes('email') && error.toLowerCase().includes('valid')) {
    return 'That email doesn\'t look right. Double-check it?';
  }
  if (error.toLowerCase().includes('name')) {
    return 'We\'d love to know your name — at least 2 characters.';
  }
  if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
    return 'Something went wrong on our end. Give it another try?';
  }
  return error || 'Something went wrong. Please try again.';
}

export function SignUpForm({ onSwitchToSignIn, onForgotPassword, onSuccess }: SignUpFormProps) {
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validated = registerSchema.parse(formData);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      setAuthSuccess(true);
      setTimeout(onSuccess, 800);
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

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="visible" className="w-full max-w-[420px]">
      <AuthCard>
        <AuthSuccessOverlay
          show={authSuccess}
          message="Welcome aboard!"
          subtext="Getting everything ready for you\u2026"
        />

        <AuthHeader
          title="Let's get started"
          subtitle="Create your account and meet your AI coach. It only takes a moment."
        />

        {/* OAuth buttons */}
        <OAuthButtons mode="signup" />
        <AuthDivider />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField
            id="signup-name"
            label="What should we call you?"
            placeholder="Your name"
            value={formData.name}
            onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
            autoComplete="name"
            autoFocus
            required
          />

          <AuthField
            id="signup-email"
            label="Your email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
            autoComplete="email"
            required
            hint="We'll only use this to sign you in."
          />

          <AuthField
            id="signup-password"
            label="Choose a password"
            type="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(v) => setFormData((p) => ({ ...p, password: v }))}
            showPasswordToggle
            showStrength
            autoComplete="new-password"
            required
          />

          {/* Global error */}
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
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </AuthButton>
        </form>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-1 text-sm">
          <span className="text-zinc-500">Already have an account?</span>
          <AuthLink onClick={onSwitchToSignIn}>Sign in</AuthLink>
        </div>

        {/* Privacy note */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3 text-zinc-600" />
          <span className="text-[11px] text-zinc-600">Your data stays private. Always.</span>
        </div>
      </AuthCard>
    </motion.div>
  );
}
