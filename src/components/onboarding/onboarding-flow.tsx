'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const USES = ['Coding', 'Studying', 'Reading', 'Writing', 'Business', 'Health', 'Personal Growth'];

const DURATIONS = [
  { label: '25 min', value: 25 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: 'Custom', value: 0 },
];

const CHECKLIST = ['Phone Silent', 'Water Nearby', 'Notifications Off', 'Ready to Focus'];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -200 : 200, opacity: 0 }),
};

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [primaryUse, setPrimaryUse] = useState('');
  const [mission, setMission] = useState('');
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const next = () => { if (step < 4) { setDirection(1); setStep(step + 1); } };
  const prev = () => { if (step > 0) { setDirection(-1); setStep(step - 1); } };

  const canProceed = [
    true,
    primaryUse.length > 0,
    mission.trim().length > 0,
    duration > 0,
    Object.values(checks).filter(Boolean).length >= 2,
  ];

  const handleFinish = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryUse, firstMission: mission.trim(), estimatedDuration: duration }),
      });
      if (!res.ok) throw new Error();
      toast.success('Welcome to MindGuard!');
      onComplete();
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleCheck = (item: string) => setChecks((p) => ({ ...p, [item]: !p[item] }));

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-teal-500/[0.05] blur-[100px]" />

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">MindGuard</h1>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-10 flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div key={i} className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                initial={{ width: '0%' }}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </motion.div>
          ))}
        </div>

        {/* Steps */}
        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: Welcome */}
            {step === 0 && (
              <motion.div key="s0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }} className="flex flex-col items-center text-center">
                <h2 className="mb-3 text-3xl font-semibold tracking-tight text-zinc-50">Welcome to MindGuard</h2>
                <p className="text-base leading-relaxed text-zinc-400">Your attention is your most valuable asset.</p>
                <p className="mt-2 text-sm text-zinc-500">Let's set up your experience in under a minute.</p>
              </motion.div>
            )}

            {/* Step 1: Primary Use */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>
                <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100">What do you primarily use MindGuard for?</h2>
                <p className="mb-6 text-sm text-zinc-500">This helps personalize your experience.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {USES.map((use) => (
                    <motion.button
                      key={use}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setPrimaryUse(use)}
                      className={cn(
                        'rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200',
                        primaryUse === use
                          ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 ring-1 ring-emerald-500/20'
                          : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-zinc-200'
                      )}
                    >
                      {primaryUse === use && <Check className="mb-1 h-3.5 w-3.5 text-emerald-400" />}
                      {use}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Mission */}
            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>
                <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100">What would make today successful?</h2>
                <p className="mb-6 text-sm text-zinc-500">Define your first mission.</p>
                <Input
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="e.g. Finish chapter 3 of the textbook"
                  className="h-12 border-white/[0.06] bg-white/[0.02] text-zinc-100 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && canProceed[step] && next()}
                />
              </motion.div>
            )}

            {/* Step 3: Duration */}
            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>
                <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100">Estimated Duration</h2>
                <p className="mb-6 text-sm text-zinc-500">How long do you plan to focus?</p>
                <div className="flex flex-wrap gap-2.5">
                  {DURATIONS.map((d) => (
                    <motion.button
                      key={d.label}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => { if (d.value > 0) setDuration(d.value); }}
                      className={cn(
                        'rounded-xl border px-6 py-3 text-sm font-medium transition-all duration-200',
                        duration === d.value && d.value > 0
                          ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 ring-1 ring-emerald-500/20'
                          : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
                      )}
                    >
                      {d.label}
                    </motion.button>
                  ))}
                </div>
                {duration === 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <Input
                      type="number" min="1" max="180" value={customDuration}
                      onChange={(e) => { const v = parseInt(e.target.value); if (v >= 1 && v <= 180) setDuration(v); }}
                      placeholder="Minutes" className="h-10 w-28 border-white/[0.06] bg-white/[0.02] text-zinc-100 placeholder:text-zinc-600"
                    />
                    <span className="text-xs text-zinc-500">min</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Checklist */}
            {step === 4 && (
              <motion.div key="s4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>
                <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100">Preparation Checklist</h2>
                <p className="mb-6 text-sm text-zinc-500">Set up your environment for deep focus.</p>
                <div className="space-y-3">
                  {CHECKLIST.map((item) => (
                    <motion.button
                      key={item} whileTap={{ scale: 0.98 }} onClick={() => toggleCheck(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-200',
                        checks[item]
                          ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300'
                          : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04]'
                      )}
                    >
                      <div className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                        checks[item] ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/[0.1]'
                      )}>
                        {checks[item] && <Check className="h-3 w-3 text-emerald-400" />}
                      </div>
                      {item}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={prev} className="text-zinc-500 hover:text-zinc-200">Back</Button>
          ) : <div />}

          {step < 4 ? (
            <Button
              onClick={next} disabled={!canProceed[step]}
              className={cn(
                'gap-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500',
                !canProceed[step] && 'opacity-40 pointer-events-none'
              )}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish} disabled={saving || !canProceed[step]}
              className={cn(
                'gap-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500',
                !canProceed[step] && 'opacity-40 pointer-events-none'
              )}
            >
              {saving ? 'Setting up...' : 'Launch Dashboard'} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Step counter */}
        <p className="mt-6 text-center text-[11px] text-zinc-600">Step {step + 1} of 5</p>
      </div>
    </div>
  );
}
