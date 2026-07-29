'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const IMPROVE_OPTIONS = [
  { id: 'study', label: 'Studying', icon: '📚' },
  { id: 'programming', label: 'Coding', icon: '💻' },
  { id: 'university', label: 'University work', icon: '🎓' },
  { id: 'school', label: 'School work', icon: '🏫' },
  { id: 'business', label: 'Running a business', icon: '💼' },
  { id: 'freelancing', label: 'Freelancing', icon: '🚀' },
  { id: 'writing', label: 'Writing', icon: '✍️' },
  { id: 'reading', label: 'Reading more', icon: '📖' },
  { id: 'gaming_addiction', label: 'Reducing gaming', icon: '🎮' },
  { id: 'social_media_addiction', label: 'Less social media', icon: '📱' },
  { id: 'adhd_support', label: 'Managing ADHD', icon: '🧠' },
  { id: 'research', label: 'Research & analysis', icon: '🔬' },
  { id: 'exam_preparation', label: 'Exam preparation', icon: '📝' },
  { id: 'other', label: 'Something else', icon: '✨' },
];

const itemStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export const IMPROVE_OPTIONS_LIST = IMPROVE_OPTIONS;

interface ImproveStepProps {
  selected: string[];
  onToggle: (item: string) => void;
  otherImproveText: string;
  onOtherImproveTextChange: (text: string) => void;
  direction: number;
}

export function ImproveStep({ selected, onToggle, otherImproveText, onOtherImproveTextChange, direction }: ImproveStepProps) {
  const hasOther = selected.includes('other');
  const isAtMax = selected.length >= 3;

  return (
    <motion.div
      key="s1"
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        What do you want to get better at?
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        Pick up to 3. This shapes how your coach works with you.
      </p>
      <motion.div
        variants={itemStagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
        role="group"
        aria-label="Choose up to 3 areas to improve"
      >
        {IMPROVE_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const isDisabled = !isSelected && isAtMax;
          return (
            <motion.button
              key={opt.id}
              variants={itemFade}
              whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
              whileTap={isDisabled ? {} : { scale: 0.97 }}
              onClick={() => !isDisabled && onToggle(opt.id)}
              aria-pressed={isSelected}
              aria-label={opt.label}
              aria-disabled={isDisabled}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 ring-1 ring-emerald-500/20'
                  : isDisabled
                    ? 'border-white/[0.04] bg-white/[0.01] text-zinc-600 opacity-50 cursor-not-allowed'
                    : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-zinc-200'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20"
                >
                  <Check className="h-3 w-3 text-emerald-400" />
                </motion.div>
              )}
              <span className="text-lg" aria-hidden="true">{opt.icon}</span>
              <span className="text-sm">{opt.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selection counter */}
      {selected.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-zinc-500"
        >
          {selected.length}/3 selected
        </motion.p>
      )}

      {/* "Other" multiline text input */}
      <AnimatePresence>
        {hasOther && (
          <motion.div
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-5 overflow-hidden"
          >
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">Tell us in your own words</span>
              </div>
              <textarea
                value={otherImproveText}
                onChange={(e) => onOtherImproveTextChange(e.target.value)}
                placeholder="What are you working on improving?"
                aria-label="Describe what you want to improve"
                rows={3}
                className="w-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200"
              />
              <p className="mt-1.5 text-xs text-zinc-600">
                Optional. We&apos;ll use this to personalize your coaching.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
