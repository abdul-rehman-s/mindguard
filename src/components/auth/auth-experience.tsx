'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SignUpForm } from './sign-up-form';
import { SignInForm } from './sign-in-form';
import { ForgotPasswordForm } from './forgot-password-form';

type AuthView = 'signup' | 'signin' | 'forgot';

interface AuthExperienceProps {
  initialView?: 'signup' | 'signin';
  onSuccess: () => void;
}

/**
 * Premium authentication experience.
 * Manages the flow between sign up, sign in, and forgot password.
 * Every transition is animated. Every state is handled.
 * Conversational, not robotic.
 */
export function AuthExperience({ initialView = 'signup', onSuccess }: AuthExperienceProps) {
  const [view, setView] = useState<AuthView>(initialView);

  return (
    <div className="relative" id="auth-section">
      <AnimatePresence mode="wait">
        {view === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <SignUpForm
              onSwitchToSignIn={() => setView('signin')}
              onForgotPassword={() => setView('forgot')}
              onSuccess={onSuccess}
            />
          </motion.div>
        )}
        {view === 'signin' && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <SignInForm
              onSwitchToSignUp={() => setView('signup')}
              onForgotPassword={() => setView('forgot')}
              onSuccess={onSuccess}
            />
          </motion.div>
        )}
        {view === 'forgot' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ForgotPasswordForm onBack={() => setView('signin')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
