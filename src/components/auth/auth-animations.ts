import type { Variants } from 'framer-motion';

// ─── Apple-style easing curve ────────────────────────────────────────
const appleEase = [0.22, 1, 0.36, 1] as const;

/** Reduced-motion-safe durations */
const duration = {
  fast: 0.2,
  normal: 0.35,
  slow: 0.5,
  slower: 0.6,
} as const;

/** Reduced-motion-safe spring configs */
const spring = {
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 18 },
  snappy: { type: 'spring' as const, stiffness: 400, damping: 25 },
} as const;

// ─── Existing Animations (preserved) ─────────────────────────────────

/** Premium entrance animation for auth cards */
export const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.slow, ease: appleEase },
  },
};

/** Smooth field entrance animation */
export const fieldEntrance: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: 0,
    transition: { duration: duration.fast, ease: appleEase },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: duration.fast, ease: appleEase },
  },
};

/** Error message entrance */
export const errorEntrance: Variants = {
  hidden: { opacity: 0, y: -4, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: { duration: duration.fast, ease: appleEase },
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
    transition: { delay: 0.15, ...spring.gentle },
  },
};

/** Tab toggle animation */
export const tabContent: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.fast } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

/** Floating label animation — moves up when focused */
export const labelFloat: Variants = {
  resting: {
    y: 0,
    scale: 1,
    originY: 0,
    transition: { duration: duration.fast, ease: appleEase },
  },
  floating: {
    y: -22,
    scale: 0.82,
    originY: 0,
    transition: { duration: duration.fast, ease: appleEase },
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
    transition: { duration: duration.slow, delay: 0.3, ease: appleEase },
  },
};

// ─── New Conversational Step Animations ───────────────────────────────

/** Conversational step entering — slides up and fades in from below */
export const stepSlideIn: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: duration.slower,
      ease: appleEase,
      opacity: { duration: duration.normal, ease: appleEase },
      filter: { duration: duration.normal, ease: appleEase },
    },
  },
};

/** Conversational step exiting — slides up and fades out upward */
export const stepSlideOut: Variants = {
  hidden: {
    opacity: 0,
    y: -40,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: duration.normal,
      ease: appleEase,
    },
  },
  exit: {
    opacity: 0,
    y: -40,
    filter: 'blur(4px)',
    transition: {
      duration: duration.normal,
      ease: appleEase,
      opacity: { duration: duration.fast, ease: appleEase },
      filter: { duration: duration.fast, ease: appleEase },
    },
  },
};

/** Going back to previous step — slides down and fades in from above */
export const stepSlideBack: Variants = {
  hidden: {
    opacity: 0,
    y: -40,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: duration.slower,
      ease: appleEase,
      opacity: { duration: duration.normal, ease: appleEase },
      filter: { duration: duration.normal, ease: appleEase },
    },
  },
};

/** Current step exiting when going back — slides down and fades out */
export const stepSlideBackOut: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: duration.normal,
      ease: appleEase,
    },
  },
  exit: {
    opacity: 0,
    y: 40,
    filter: 'blur(4px)',
    transition: {
      duration: duration.normal,
      ease: appleEase,
      opacity: { duration: duration.fast, ease: appleEase },
      filter: { duration: duration.fast, ease: appleEase },
    },
  },
};

// ─── Progress Indicator ───────────────────────────────────────────────

/** Progress indicator dot — scale + color transition */
export const progressDot: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    transition: {
      duration: duration.fast,
      ease: appleEase,
    },
  },
  active: {
    scale: 1.3,
    backgroundColor: 'hsl(var(--primary))',
    transition: {
      duration: duration.normal,
      ease: appleEase,
      scale: spring.gentle,
    },
  },
  completed: {
    scale: 1,
    backgroundColor: 'hsl(var(--primary))',
    transition: {
      duration: duration.normal,
      ease: appleEase,
    },
  },
};

// ─── Envelope / Verification ──────────────────────────────────────────

/** Email verification envelope floating animation */
export const envelopeFloat: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8,
    rotateX: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: duration.slow,
      ease: appleEase,
      scale: spring.gentle,
    },
  },
  floating: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Celebration / Success ────────────────────────────────────────────

/** Success celebration burst — particles radiating outward */
export const celebrationBurst: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.2,
      ...spring.bouncy,
      staggerChildren: 0.04,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: duration.fast,
      ease: appleEase,
    },
  },
};

/** Individual celebration particle — use with `custom` prop on motion element */
export const celebrationParticle: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0,
  },
  visible: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 0],
    transition: {
      duration: 0.8,
      ease: appleEase,
      scale: { duration: 0.3, ease: appleEase },
      opacity: { duration: 0.8, ease: 'easeOut' },
    },
  },
};

/**
 * Generate celebration particle positions for a burst effect.
 * Returns an array of { x, y } offsets for each particle.
 */
export function getParticlePositions(count: number = 8): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    positions.push({
      x: Math.cos(angle) * 80,
      y: Math.sin(angle) * 80,
    });
  }
  return positions;
}

// ─── Skeleton / Loading ───────────────────────────────────────────────

/** Skeleton loading shimmer effect */
export const shimmerPulse: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── OAuth Button ─────────────────────────────────────────────────────

/** OAuth button hover state */
export const oauthHover: Variants = {
  resting: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
    transition: {
      duration: duration.fast,
      ease: appleEase,
    },
  },
  hovering: {
    scale: 1.02,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: {
      duration: duration.fast,
      ease: appleEase,
      scale: spring.snappy,
    },
  },
  tapping: {
    scale: 0.98,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
    transition: {
      duration: 0.1,
      ease: appleEase,
    },
  },
};

// ─── Field Focus Ring ─────────────────────────────────────────────────

/** Field focus ring animation — subtle ring expansion on focus */
export const fieldFocusRing: Variants = {
  unfocused: {
    boxShadow: '0 0 0 0px hsl(var(--ring) / 0)',
    transition: {
      duration: duration.normal,
      ease: appleEase,
    },
  },
  focused: {
    boxShadow: '0 0 0 3px hsl(var(--ring) / 0.15)',
    transition: {
      duration: duration.normal,
      ease: appleEase,
    },
  },
  error: {
    boxShadow: '0 0 0 3px hsl(0 84% 60% / 0.15)',
    transition: {
      duration: duration.normal,
      ease: appleEase,
    },
  },
};

// ─── Loading Messages (Conversational, Coach-like) ────────────────────

/** General coach-like loading messages — warm, encouraging, never robotic */
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

/** Email verification loading messages */
export const verificationLoadingMessages = [
  'Verifying your email\u2026',
  'Almost there\u2026',
  'Setting up your profile\u2026',
] as const;

/** Forgot password loading messages */
export const forgotPasswordLoadingMessages = [
  'Sending reset link\u2026',
  'Almost there\u2026',
] as const;

// ─── Password Strength ────────────────────────────────────────────────

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

/** Conversational password strength labels */
export const strengthConfig: Record<
  PasswordStrength,
  { label: string; color: string; width: string }
> = {
  weak: {
    label: 'Keep going \u2014 add a few more characters',
    color: 'bg-red-400',
    width: 'w-1/4',
  },
  fair: {
    label: 'Getting there \u2014 try mixing in numbers',
    color: 'bg-amber-400',
    width: 'w-2/4',
  },
  good: {
    label: 'Nice \u2014 that\u2019s a solid password',
    color: 'bg-emerald-400',
    width: 'w-3/4',
  },
  strong: {
    label: 'Excellent \u2014 you\u2019re all set',
    color: 'bg-emerald-500',
    width: 'w-full',
  },
};
