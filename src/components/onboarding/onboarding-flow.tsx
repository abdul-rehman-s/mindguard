'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MindGuardLogo } from '@/components/branding/mindguard-logo';

// Step sub-components
import { WelcomeStep } from './steps/welcome-step';
import { ImproveStep } from './steps/improve-step';
import { RoleStep } from './steps/role-step';
import { ScheduleStep } from './steps/schedule-step';
import { FocusStyleStep } from './steps/focus-style-step';
import { MotivationStep } from './steps/motivation-step';
import { DistractionStep } from './steps/distraction-step';
import { GoalsStep } from './steps/goals-step';
import { PrivacyStep } from './steps/privacy-step';
import { PermissionsStep } from './steps/permissions-step';
import { FinishStep } from './steps/finish-step';

// ─── Step configuration ──────────────────────────────────────────────────────

const TOTAL_STEPS = 11;

const STEP_LABELS = [
  'Welcome',
  'Interests',
  'Role',
  'Schedule',
  'Focus Style',
  'Motivation',
  'Distractions',
  'Goals',
  'Privacy',
  'Permissions',
  'Finish',
];

// TASK 7: Contextual progress messages — feel rewarding, not generic
const PROGRESS_MESSAGES = [
  'Welcome',                              // 0 — Welcome
  'Discovering your interests...',         // 1 — Interests
  'Understanding your role...',            // 2 — Role
  'Learning your routine...',              // 3 — Schedule
  'Finding your focus style...',           // 4 — Focus Style
  'Choosing your coach...',                // 5 — Motivation
  'Identifying your distractions...',      // 6 — Distractions
  'Setting your goals...',                 // 7 — Goals
  'How we protect you',                    // 8 — Privacy
  'Optional setup',                        // 9 — Permissions
  'Almost ready!',                         // 10 — Finish
];

// ─── Internal mapping functions ──────────────────────────────────────────────
// These map user-friendly answers to internal timer/workflow settings

function mapScheduleTypeToChronotype(scheduleType: string): string {
  const map: Record<string, string> = {
    morning_person: 'early_bird',
    night_owl: 'night_owl',
    flexible_schedule: 'flexible',
    changes_frequently: 'flexible',
  };
  return map[scheduleType] ?? 'flexible';
}

function mapScheduleTypeToWorkSchedule(scheduleType: string): string {
  const map: Record<string, string> = {
    morning_person: 'morning',
    night_owl: 'night',
    flexible_schedule: 'flexible',
    changes_frequently: 'flexible',
  };
  return map[scheduleType] ?? 'flexible';
}

function mapFocusDurationToPomodoroPreference(focusDurationComfort: string): string {
  const map: Record<string, string> = {
    '15min': '25/5',
    '30min': '25/5',
    '45min': '45/10',
    'about_an_hour': '60/15',
    '90_plus': '90/20',
    'it_depends': '45/10', // default balanced
  };
  return map[focusDurationComfort] ?? '45/10';
}

function mapFocusDurationToEstimatedDuration(focusDurationComfort: string): number {
  const map: Record<string, number> = {
    '15min': 25,
    '30min': 30,
    '45min': 45,
    'about_an_hour': 60,
    '90_plus': 90,
    'it_depends': 45,
  };
  return map[focusDurationComfort] ?? 45;
}

function mapFocusDurationToDeepWorkDuration(focusDurationComfort: string): number {
  const map: Record<string, number> = {
    '15min': 30,
    '30min': 45,
    '45min': 60,
    'about_an_hour': 90,
    '90_plus': 120,
    'it_depends': 60,
  };
  return map[focusDurationComfort] ?? 60;
}

function mapWorkStyleToFocusStyle(workStylePreference: string): string {
  const map: Record<string, string> = {
    short_sprints: 'pomodoro',
    deep_uninterrupted: 'deep_work',
    mix_both: 'flexible',
  };
  return map[workStylePreference] ?? 'flexible';
}

function mapWorkStyleToPreferredSchedule(workStylePreference: string): string {
  const map: Record<string, string> = {
    short_sprints: 'structured',
    deep_uninterrupted: 'flexible',
    mix_both: 'flexible',
  };
  return map[workStylePreference] ?? 'flexible';
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Primary use (multi-select up to 3)
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [otherImproveText, setOtherImproveText] = useState('');

  // Step 2: Role (no work mode)
  const [selectedRole, setSelectedRole] = useState('');

  // Step 3: Schedule type + sleep range (replaces exact wake/sleep)
  const [scheduleType, setScheduleType] = useState('');
  const [sleepRange, setSleepRange] = useState('');

  // Step 4: Focus style (natural language)
  const [hasAdhd, setHasAdhd] = useState(false);
  const [focusDurationComfort, setFocusDurationComfort] = useState('');
  const [workStylePreference, setWorkStylePreference] = useState('');

  // Step 5: Motivation style
  const [coachPersonality, setCoachPersonality] = useState('');
  const [motivationStyle, setMotivationStyle] = useState('');

  // Step 6: Distractions
  const [selectedDistractions, setSelectedDistractions] = useState<string[]>([]);
  const [distractionRanking, setDistractionRanking] = useState<string[]>([]);

  // Step 7: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [focusGoalMinutes, setFocusGoalMinutes] = useState(120);

  // Step 9: Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    desktop: false,
    notifications: false,
    accessibility: false,
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const toggleMulti = useCallback((list: string[], setList: (v: string[]) => void, item: string, max: number) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else if (list.length < max) {
      setList([...list, item]);
    }
  }, []);

  const toggleImprovement = useCallback((item: string) => {
    toggleMulti(selectedImprovements, setSelectedImprovements, item, 3);
  }, [selectedImprovements, toggleMulti]);

  const toggleGoal = useCallback((item: string) => {
    toggleMulti(selectedGoals, setSelectedGoals, item, 3);
  }, [selectedGoals, toggleMulti]);

  const toggleDistraction = useCallback((id: string) => {
    if (selectedDistractions.includes(id)) {
      setSelectedDistractions(selectedDistractions.filter((d) => d !== id));
      setDistractionRanking(distractionRanking.filter((r) => r !== id));
    } else {
      setSelectedDistractions([...selectedDistractions, id]);
    }
  }, [selectedDistractions, distractionRanking]);

  const togglePermission = useCallback((id: string) => {
    setPermissions((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  // Generate firstMission based on selections
  const firstMission = useMemo(() => {
    const primary = selectedImprovements[0];
    const role = selectedRole;
    const goal = selectedGoals[0];

    if (role === 'medical_student' || role === 'competitive_exam') return 'Study for exams with focused sessions';
    if (role === 'developer') return 'Complete coding tasks with deep focus';
    if (role === 'designer') return 'Design with deep creative focus';
    if (role === 'founder') return 'Build key startup milestones';
    if (role === 'freelancer') return 'Deliver client work on schedule';
    if (role === 'teacher') return 'Prepare lesson materials efficiently';

    if (primary === 'exam_preparation' || primary === 'study' || primary === 'university' || primary === 'school') {
      return 'Study for exams with focused sessions';
    }
    if (primary === 'programming') return 'Complete coding tasks with deep focus';
    if (primary === 'gaming_addiction' || primary === 'social_media_addiction') {
      return 'Reduce screen time and build healthier habits';
    }
    if (goal === 'deep_work') return 'Achieve deep work sessions daily';
    if (goal === 'screen_time') return 'Reduce daily screen time';
    if (goal === 'habits') return 'Build consistent focus habits';

    if (primary === 'business' || primary === 'freelancing') return 'Boost productivity for key projects';
    if (primary === 'writing' || primary === 'reading') return 'Dedicate focused time to writing and reading';
    if (primary === 'adhd_support') return 'Improve focus and manage attention';

    return 'Improve focus and daily productivity';
  }, [selectedImprovements, selectedRole, selectedGoals]);

  // ─── Validation ──────────────────────────────────────────────────────────

  const canProceed = useMemo(() => [
    true, // Step 0: Welcome (always proceed)
    selectedImprovements.length > 0, // Step 1: Improve
    selectedRole.length > 0, // Step 2: Role
    scheduleType.length > 0, // Step 3: Schedule (scheduleType required, sleepRange optional)
    focusDurationComfort.length > 0 && workStylePreference.length > 0, // Step 4: Focus style
    coachPersonality.length > 0 && motivationStyle.length > 0, // Step 5: Motivation
    selectedDistractions.length > 0, // Step 6: Distractions
    selectedGoals.length > 0, // Step 7: Goals
    true, // Step 8: Privacy (always proceed)
    true, // Step 9: Permissions (always proceed)
    true, // Step 10: Finish
  ], [selectedImprovements, selectedRole, scheduleType, focusDurationComfort, workStylePreference, coachPersonality, motivationStyle, selectedDistractions, selectedGoals]);

  const next = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  }, [step]);

  const prev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  }, [step]);

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleFinish = useCallback(async () => {
    setSaving(true);

    // Map user-friendly answers to internal settings
    const chronotype = mapScheduleTypeToChronotype(scheduleType);
    const workSchedule = mapScheduleTypeToWorkSchedule(scheduleType);
    const pomodoroPreference = mapFocusDurationToPomodoroPreference(focusDurationComfort);
    const estimatedDuration = mapFocusDurationToEstimatedDuration(focusDurationComfort);
    const deepWorkDuration = mapFocusDurationToDeepWorkDuration(focusDurationComfort);
    const focusStyle = mapWorkStyleToFocusStyle(workStylePreference);
    const preferredSchedule = mapWorkStyleToPreferredSchedule(workStylePreference);

    const payload = {
      primaryUse: selectedImprovements[0],
      firstMission,
      estimatedDuration,
      workSchedule,
      biggestDistraction: distractionRanking[0] ?? selectedDistractions[0],
      goals: selectedGoals,
      distractionsList: selectedDistractions,
      // Derived legacy fields
      role: selectedRole,
      chronotype,
      focusStyle,
      hasAdhd,
      pomodoroPreference,
      deepWorkDuration,
      preferredSchedule,
      coachPersonality,
      motivationStyle,
      distractionRanking,
      focusGoalMinutes,
      sleepTime: sleepRange,
      // UX Rebirth raw answer fields
      scheduleType,
      sleepRange,
      focusDurationComfort,
      workStylePreference,
      otherImproveText,
    };

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const retryRes = await fetch('/api/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!retryRes.ok) throw new Error(`Failed with status ${retryRes.status}`);
        } else {
          throw new Error(`Failed with status ${res.status}`);
        }
      }
      toast.success('Welcome to MindGuard!');
      onComplete();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to save preferences: ${message}. Please try again.`);
    } finally {
      setSaving(false);
    }
  }, [selectedImprovements, selectedRole, scheduleType, sleepRange, hasAdhd, focusDurationComfort, workStylePreference, coachPersonality, motivationStyle, selectedDistractions, distractionRanking, selectedGoals, focusGoalMinutes, otherImproveText, firstMission, onComplete]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-zinc-950 overflow-hidden"
      aria-label="Onboarding setup wizard"
      role="form"
    >
      {/* Background glows — TASK 8: softer, more premium */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.04] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full bg-teal-500/[0.03] blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xl px-4 sm:px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center"
        >
          <MindGuardLogo size="md" showText={true} />
        </motion.div>

        {/* TASK 7: Improved progress indicator */}
        <div className="mb-6" aria-label={`Step ${step + 1} of ${TOTAL_STEPS}: ${STEP_LABELS[step]}`}>
          {/* Progress bar */}
          <div className="mb-2.5 flex gap-1" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden"
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: '0%' }}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>
          {/* Contextual message + counter */}
          <div className="flex items-center justify-between">
            <motion.p
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-emerald-400/60"
              aria-live="polite"
            >
              {PROGRESS_MESSAGES[step]}
            </motion.p>
            <p className="text-[11px] text-zinc-600">
              {step + 1}/{TOTAL_STEPS}
            </p>
          </div>
        </div>

        {/* Steps container */}
        <div className="relative min-h-[340px] sm:min-h-[380px]" aria-live="polite">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && <WelcomeStep direction={direction} />}
            {step === 1 && <ImproveStep selected={selectedImprovements} onToggle={toggleImprovement} otherImproveText={otherImproveText} onOtherImproveTextChange={setOtherImproveText} direction={direction} />}
            {step === 2 && <RoleStep selectedRole={selectedRole} onSelectRole={setSelectedRole} direction={direction} />}
            {step === 3 && <ScheduleStep scheduleType={scheduleType} onScheduleTypeChange={setScheduleType} sleepRange={sleepRange} onSleepRangeChange={setSleepRange} direction={direction} />}
            {step === 4 && <FocusStyleStep hasAdhd={hasAdhd} onHasAdhdChange={setHasAdhd} focusDurationComfort={focusDurationComfort} onFocusDurationComfortChange={setFocusDurationComfort} workStylePreference={workStylePreference} onWorkStylePreferenceChange={setWorkStylePreference} direction={direction} />}
            {step === 5 && <MotivationStep coachPersonality={coachPersonality} onCoachChange={setCoachPersonality} motivationStyle={motivationStyle} onMotivationChange={setMotivationStyle} direction={direction} />}
            {step === 6 && <DistractionStep selectedDistractions={selectedDistractions} onToggleDistraction={toggleDistraction} distractionRanking={distractionRanking} onSetRanking={setDistractionRanking} direction={direction} />}
            {step === 7 && <GoalsStep selectedGoals={selectedGoals} onToggleGoal={toggleGoal} focusGoalMinutes={focusGoalMinutes} onFocusGoalChange={setFocusGoalMinutes} direction={direction} />}
            {step === 8 && <PrivacyStep direction={direction} />}
            {step === 9 && <PermissionsStep permissions={permissions} onTogglePermission={togglePermission} direction={direction} />}
            {step === 10 && (
              <FinishStep
                selectedImprovements={selectedImprovements}
                otherImproveText={otherImproveText}
                selectedRole={selectedRole}
                scheduleType={scheduleType}
                sleepRange={sleepRange}
                hasAdhd={hasAdhd}
                focusDurationComfort={focusDurationComfort}
                workStylePreference={workStylePreference}
                coachPersonality={coachPersonality}
                motivationStyle={motivationStyle}
                selectedDistractions={selectedDistractions}
                distractionRanking={distractionRanking}
                selectedGoals={selectedGoals}
                focusGoalMinutes={focusGoalMinutes}
                firstMission={firstMission}
                direction={direction}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Navigation — TASK 9: Accessibility improvements */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={prev}
              aria-label="Go back to previous step"
              className="gap-1 text-zinc-500 hover:text-zinc-200 focus-emerald"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {/* Skip button for optional steps */}
          {(step === 2 || step === 9) ? (
            <Button
              variant="ghost"
              onClick={next}
              className="text-xs text-zinc-600 hover:text-zinc-400 focus-emerald"
              aria-label="Skip this optional step"
            >
              Skip
            </Button>
          ) : null}

          {step < TOTAL_STEPS - 1 ? (
            <Button
              onClick={next}
              disabled={!canProceed[step]}
              aria-label="Continue to next step"
              className={cn(
                'gap-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 focus-emerald',
                !canProceed[step] && 'opacity-40 pointer-events-none'
              )}
            >
              {step === 0 ? 'Let\'s Begin' : 'Continue'}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={saving}
              aria-label={saving ? 'Setting up your account' : 'Launch dashboard'}
              className={cn(
                'gap-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 focus-emerald',
                saving && 'opacity-70 pointer-events-none'
              )}
            >
              {saving ? 'Setting up...' : 'Launch Dashboard'}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
