// Debug script: Reproduce Bug #1 (Onboarding 400)
// Compares the exact frontend payload structure against the Zod schema
// and identifies the mismatching field(s).

import { z } from 'zod';

// ─── Zod schema: EXACT COPY from src/app/api/onboarding/route.ts ───
const schema = z.object({
  primaryUse: z.string().min(1),
  firstMission: z.string().min(1),
  estimatedDuration: z.number().int().min(1),
  workSchedule: z.string().min(1),
  biggestDistraction: z.string().min(1),
  goals: z.array(z.string()).min(1),
  distractionsList: z.array(z.string()).min(1),
  role: z.string().optional(),
  workHours: z.number().int().min(4).max(12).optional(),
  wakeTime: z.string().optional(),
  sleepTime: z.string().optional(),
  chronotype: z.enum(['early_bird', 'night_owl', 'flexible']).optional(),
  focusStyle: z.enum(['pomodoro', 'deep_work', 'flexible']).optional(),
  hasAdhd: z.boolean().optional(),
  pomodoroPreference: z.string().optional(),
  deepWorkDuration: z.number().int().min(10).max(180).optional(),
  preferredSchedule: z.enum(['structured', 'flexible']).optional(),
  coachPersonality: z.enum(['strict', 'friendly', 'data_nerd']).optional(),
  motivationStyle: z.enum(['gamification', 'minimalist', 'balanced']).optional(),
  distractionRanking: z.array(z.string()).max(3).optional(),
  focusGoalMinutes: z.number().int().min(30).max(300).optional(),
  scheduleType: z.enum(['morning_person', 'night_owl', 'flexible_schedule', 'changes_frequently']).optional(),
  sleepRange: z.preprocess((v) => (v === '' ? undefined : v), z.enum(['before_midnight', '12_2am', '2_4am', 'after_4am', 'varies']).optional()),
  focusDurationComfort: z.enum(['15min', '30min', '45min', 'about_an_hour', '90_plus', 'it_depends']).optional(),
  workStylePreference: z.enum(['short_sprints', 'deep_uninterrupted', 'mix_both']).optional(),
  otherImproveText: z.string().optional(),
});

// ─── Normal frontend payload (all fields set) ───
const normalPayload = {
  primaryUse: 'programming',
  firstMission: 'Complete coding tasks with deep focus',
  estimatedDuration: 60,
  workSchedule: 'morning',
  biggestDistraction: 'instagram',
  goals: ['deep_work', 'screen_time'],
  distractionsList: ['instagram', 'youtube', 'discord'],
  role: 'developer',
  chronotype: 'early_bird',
  focusStyle: 'deep_work',
  hasAdhd: false,
  pomodoroPreference: '60/15',
  deepWorkDuration: 90,
  preferredSchedule: 'flexible',
  coachPersonality: 'friendly',
  motivationStyle: 'gamification',
  distractionRanking: ['instagram', 'youtube', 'discord'],
  focusGoalMinutes: 120,
  sleepTime: '12_2am',
  scheduleType: 'morning_person',
  sleepRange: '12_2am',
  focusDurationComfort: 'about_an_hour',
  workStylePreference: 'deep_uninterrupted',
  otherImproveText: '',
};

// ─── Payload where sleepRange is empty string (user skips it) ───
const payloadMissingSleepRange = { ...normalPayload, sleepRange: '' };

// ─── Payload where ALL optional enum fields are empty strings ───
const payloadAllEmptyOptionals = {
  ...normalPayload,
  sleepRange: '',
  scheduleType: '',  // Note: canProceed requires this, but let's test anyway
  focusDurationComfort: '',
  workStylePreference: '',
  coachPersonality: '',
  motivationStyle: '',
  chronotype: '',
  focusStyle: '',
  preferredSchedule: '',
};

console.log('=== Bug #1 Debug: Onboarding 400 ===\n');

// Test 1: Normal payload (should pass)
const r1 = schema.safeParse(normalPayload);
console.log('Test 1 - Normal payload:');
console.log('  Passed:', r1.success);
if (!r1.success) console.log('  Errors:', JSON.stringify(r1.error?.flatten(), null, 2));
console.log();

// Test 2: sleepRange = "" (most likely real scenario)
const r2 = schema.safeParse(payloadMissingSleepRange);
console.log('Test 2 - sleepRange = "" (user skips sleep range):');
console.log('  Passed:', r2.success);
if (!r2.success) {
  console.log('  ⚠️  BUG FOUND: sleepRange empty string fails Zod enum validation');
  const flat = r2.error?.flatten();
  if (flat) {
    console.log('  Field errors:', JSON.stringify(flat.fieldErrors, null, 2));
  }
}
console.log();

// Test 3: All optional enums empty
const r3 = schema.safeParse(payloadAllEmptyOptionals);
console.log('Test 3 - All optional enum fields = "":');
console.log('  Passed:', r3.success);
if (!r3.success) {
  const flat = r3.error?.flatten();
  if (flat) {
    console.log('  Field errors:', JSON.stringify(flat.fieldErrors, null, 2));
  }
}
console.log();

// Test 4: sleepRange = undefined (should pass since optional)
const r4 = schema.safeParse({ ...normalPayload, sleepRange: undefined });
console.log('Test 4 - sleepRange = undefined:');
console.log('  Passed:', r4.success);
console.log();

// Find ALL enum fields that could accept ""
console.log('=== Diagnosing: which optional enum fields accept ""? ===\n');
const optionalEnumFields = [
  { name: 'chronotype', values: ['early_bird', 'night_owl', 'flexible'] },
  { name: 'focusStyle', values: ['pomodoro', 'deep_work', 'flexible'] },
  { name: 'preferredSchedule', values: ['structured', 'flexible'] },
  { name: 'coachPersonality', values: ['strict', 'friendly', 'data_nerd'] },
  { name: 'motivationStyle', values: ['gamification', 'minimalist', 'balanced'] },
  { name: 'scheduleType', values: ['morning_person', 'night_owl', 'flexible_schedule', 'changes_frequently'] },
  { name: 'sleepRange', values: ['before_midnight', '12_2am', '2_4am', 'after_4am', 'varies'] },
  { name: 'focusDurationComfort', values: ['15min', '30min', '45min', 'about_an_hour', '90_plus', 'it_depends'] },
  { name: 'workStylePreference', values: ['short_sprints', 'deep_uninterrupted', 'mix_both'] },
];

for (const field of optionalEnumFields) {
  const testEmpty = schema.safeParse({ ...normalPayload, [field.name]: '' });
  const testUndefined = schema.safeParse({ ...normalPayload, [field.name]: undefined });
  console.log(`  ${field.name}: "" = ${testEmpty.success ? 'OK' : '❌ FAIL'}, undefined = ${testUndefined.success ? 'OK' : 'FAIL'}`);
}

console.log('\n=== Root Cause ===');
console.log('Optional Zod enum fields do not accept empty string "".');
console.log('In Zod, .optional() means the value can be undefined, but "" is still a string value.');
console.log('The frontend initializes all inputs as "" and sends them even when user skips.');
console.log('Fields validated by canProceed before going to sleepRange alone can be "" because');
console.log('Step 3 only requires scheduleType, not sleepRange.');
