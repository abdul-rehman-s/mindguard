import type { Variants } from 'framer-motion';

/** Premium entrance animation for auth cards */
export const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Smooth field entrance animation */
export const fieldEntrance: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Error message entrance */
export const errorEntrance: Variants = {
  hidden: { opacity: 0, y: -4, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    height: 0,
    transition: { duration: 0.15 },
  },
};

/** Success overlay animation */
export const successOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Success icon pop animation */
export const successIcon: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { delay: 0.15, type: 'spring', stiffness: 200, damping: 15 },
  },
};

/** Tab toggle animation */
export const tabContent: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

/** Floating label animation — moves up when focused */
export const labelFloat: Variants = {
  resting: {
    y: 0,
    scale: 1,
    originY: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  floating: {
    y: -22,
    scale: 0.82,
    originY: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Ambient glow pulse for the auth card */
export const glowPulse: Variants = {
  initial: { opacity: 0.4, scale: 1 },
  animate: {
    opacity: [0.4, 0.6, 0.4],
    scale: [1, 1.02, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Checkmark draw animation */
export const checkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Coach-like loading messages — warm, encouraging, never robotic */
export const loadingMessages = [
  'Preparing your workspace\u2026',
  'Learning your preferences\u2026',
  'Getting your coach ready\u2026',
  'Almost there\u2026',
  'Setting things up\u2026',
  'Making it feel like home\u2026',
] as const;

/** Sign-up specific loading messages */
export const signUpLoadingMessages = [
  'Creating your space\u2026',
  'Meeting your AI coach\u2026',
  'Preparing your first mission\u2026',
  'Almost ready\u2026',
] as const;

/** Sign-in specific loading messages */
export const signInLoadingMessages = [
  'Welcome back\u2026',
  'Loading your workspace\u2026',
  'Picking up where you left off\u2026',
  'Almost there\u2026',
] as const;

/** Password strength levels */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 4) return 'weak';
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return 'weak';
  if (score <= 2) return 'fair';
  if (score <= 3) return 'good';
  return 'strong';
}

export const strengthConfig: Record<PasswordStrength, { label: string; color: string; width: string }> = {
  weak: { label: 'Keep going — add a few more characters', color: 'bg-red-400', width: 'w-1/4' },
  fair: { label: 'Getting there — try mixing in numbers', color: 'bg-amber-400', width: 'w-2/4' },
  good: { label: 'Nice — that\u2019s a solid password', color: 'bg-emerald-400', width: 'w-3/4' },
  strong: { label: 'Excellent — you\u2019re all set', color: 'bg-emerald-500', width: 'w-full' },
};
