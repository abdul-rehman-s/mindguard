'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SignUpForm } from './sign-up-form';
import { SignInForm } from './sign-in-form';
import { ForgotPasswordForm } from './forgot-password-form';
import { EmailVerification } from './email-verification';

type AuthView = 'signup' | 'signin' | 'forgot' | 'verification';

interface AuthExperienceProps {
  initialView?: 'signup' | 'signin';
  onSuccess: () => void;
}

/**
 * Premium authentication experience.
 * Manages the flow between sign up, sign in, forgot password, and email verification.
 * Every transition is animated. Every state is handled.
 * Conversational, not robotic.
 */
export function AuthExperience({ initialView = 'signup', onSuccess }: AuthExperienceProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSignUpSuccess = useCallback(() => {
    // After sign-up, show email verification screen
    // In production, this would be triggered by the backend
    // For now, we go directly to onSuccess (no email verification required)
    onSuccess();
  }, [onSuccess]);

  const handleRequireVerification = useCallback((email: string) => {
    setVerificationEmail(email);
    setView('verification');
  }, []);

  const handleVerificationComplete = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

  // Determine slide direction based on view transitions
  const getViewDirection = (currentView: AuthView) => {
    if (currentView === 'forgot' || currentView === 'verification') return 0;
    return currentView === 'signup' ? -20 : 20;
  };

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
              onSuccess={handleSignUpSuccess}
              onRequireVerification={handleRequireVerification}
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
        {view === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <EmailVerification
              email={verificationEmail}
              onBack={() => setView('signin')}
              onVerified={handleVerificationComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
