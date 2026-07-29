'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, HardDrive, Download, Check } from 'lucide-react';

const TRACKED_ITEMS = [
  'Focus sessions',
  'Missions you create',
  'Daily reflections',
  'Desktop app usage (only if you enable it)',
];

const NOT_TRACKED_ITEMS = [
  'Personal messages',
  'Browser content',
  'Private files',
  'Anything you don\'t explicitly enable',
];

const PRIVACY_PRINCIPLES = [
  { icon: HardDrive, text: 'All data stored locally on your device' },
  { icon: Eye, text: 'You control what gets tracked' },
  { icon: Download, text: 'Export or delete your data anytime' },
  { icon: Lock, text: 'We never sell or share your data' },
];

interface PrivacyStepProps {
  direction: number;
}

export function PrivacyStep({ direction }: PrivacyStepProps) {
  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        Your privacy, always.
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        We believe transparency is non-negotiable. Here&apos;s what you need to know.
      </p>

      <div className="space-y-4">
        {/* What IS tracked */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">What IS tracked</span>
          </div>
          <ul className="space-y-2">
            {TRACKED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What is NOT tracked */}
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">What is NOT tracked</span>
          </div>
          <ul className="space-y-2">
            {NOT_TRACKED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* How data stays private */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">How data stays private</span>
          </div>
          <ul className="space-y-2.5">
            {PRIVACY_PRINCIPLES.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/70" />
                  {item.text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
