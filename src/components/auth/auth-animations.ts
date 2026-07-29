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

/** Loading dot pulse */
export const loadingMessages = [
  'Preparing your workspace\u2026',
  'Checking your account\u2026',
  'Almost there\u2026',
  'Setting things up\u2026',
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
  weak: { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' },
  fair: { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' },
  good: { label: 'Good', color: 'bg-emerald-400', width: 'w-3/4' },
  strong: { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' },
};
