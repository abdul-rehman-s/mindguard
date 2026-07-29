'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Monitor, Bell, Accessibility } from 'lucide-react';

const PERMISSIONS = [
  {
    id: 'desktop',
    label: 'Desktop Tracking',
    description: 'Track app usage to identify distraction patterns',
    icon: Monitor,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Send you focus reminders and break alerts',
    icon: Bell,
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Detect when you switch between apps',
    icon: Accessibility,
  },
];

const itemStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

interface PermissionsStepProps {
  permissions: Record<string, boolean>;
  onTogglePermission: (id: string) => void;
  direction: number;
}

export function PermissionsStep({ permissions, onTogglePermission, direction }: PermissionsStepProps) {
  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        Optional permissions
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        Enable these for the best experience. You can always change them later.
      </p>

      <motion.div
        variants={itemStagger}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {PERMISSIONS.map((perm) => {
          const Icon = perm.icon;
          const isEnabled = permissions[perm.id];
          return (
            <motion.div
              key={perm.id}
              variants={itemFade}
              className={cn(
                'flex items-center gap-4 rounded-xl border p-4 transition-all duration-200',
                isEnabled
                  ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
                  : 'border-white/[0.06] bg-white/[0.02]'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  isEnabled ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isEnabled ? 'text-emerald-400' : 'text-zinc-500'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isEnabled ? 'text-emerald-300' : 'text-zinc-300'
                    )}
                  >
                    {perm.label}
                  </span>
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                    Optional
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{perm.description}</p>
              </div>
              {/* Toggle */}
              <button
                onClick={() => onTogglePermission(perm.id)}
                role="switch"
                aria-checked={isEnabled}
                aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${perm.label}`}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                  isEnabled ? 'bg-emerald-500' : 'bg-white/[0.1]'
                )}
              >
                <motion.div
                  layout
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                  style={{ left: isEnabled ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      <p className="mt-4 text-center text-xs text-zinc-600">
        All permissions are optional and can be enabled later in Settings.
      </p>
    </motion.div>
  );
}
