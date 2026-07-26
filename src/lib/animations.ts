import type { Variants } from "framer-motion";

/**
 * Shared stagger animation variants.
 * Replaces 5+ duplicated container/item variant definitions across components.
 */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/** Standard ease curve used across the app */
export const EASE = [0.25, 0.1, 0.25, 1] as const;

/** Spring config for interactive elements */
export const SPRING_LIGHT = { type: "spring", stiffness: 300, damping: 20 } as const;
export const SPRING_MEDIUM = { type: "spring", stiffness: 200, damping: 15 } as const;
