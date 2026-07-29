import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import { z } from 'zod';

const schema = z.object({
  primaryUse: z.string().min(1),
  firstMission: z.string().min(1),
  estimatedDuration: z.number().int().min(1),
  workSchedule: z.string().min(1),
  biggestDistraction: z.string().min(1),
  goals: z.array(z.string()).min(1),
  distractionsList: z.array(z.string()).min(1),
  // Legacy psychological profiling fields (derived internally)
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
  // UX Rebirth raw answer fields — user's natural answers
  scheduleType: z.enum(['morning_person', 'night_owl', 'flexible_schedule', 'changes_frequently']).optional(),
  sleepRange: z.enum(['before_midnight', '12_2am', '2_4am', 'after_4am', 'varies']).optional(),
  focusDurationComfort: z.enum(['15min', '30min', '45min', 'about_an_hour', '90_plus', 'it_depends']).optional(),
  workStylePreference: z.enum(['short_sprints', 'deep_uninterrupted', 'mix_both']).optional(),
  otherImproveText: z.string().optional(),
});

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        onboarded: true,
        primaryUse: true,
        workSchedule: true,
        preferredFocusDuration: true,
        biggestDistraction: true,
        goals: true,
        distractionsList: true,
        role: true,
        workHours: true,
        wakeTime: true,
        sleepTime: true,
        chronotype: true,
        focusStyle: true,
        hasAdhd: true,
        pomodoroPreference: true,
        deepWorkDuration: true,
        preferredSchedule: true,
        coachPersonality: true,
        motivationStyle: true,
        distractionRanking: true,
        focusGoalMinutes: true,
        scheduleType: true,
        sleepRange: true,
        focusDurationComfort: true,
        workStylePreference: true,
        otherImproveText: true,
      },
    });
    return NextResponse.json({
      onboarded: user?.onboarded ?? false,
      primaryUse: user?.primaryUse ?? null,
      workSchedule: user?.workSchedule ?? null,
      preferredFocusDuration: user?.preferredFocusDuration ?? null,
      biggestDistraction: user?.biggestDistraction ?? null,
      goals: user?.goals ?? null,
      distractionsList: user?.distractionsList ?? null,
      role: user?.role ?? null,
      workHours: user?.workHours ?? null,
      wakeTime: user?.wakeTime ?? null,
      sleepTime: user?.sleepTime ?? null,
      chronotype: user?.chronotype ?? null,
      focusStyle: user?.focusStyle ?? null,
      hasAdhd: user?.hasAdhd ?? null,
      pomodoroPreference: user?.pomodoroPreference ?? null,
      deepWorkDuration: user?.deepWorkDuration ?? null,
      preferredSchedule: user?.preferredSchedule ?? null,
      coachPersonality: user?.coachPersonality ?? null,
      motivationStyle: user?.motivationStyle ?? null,
      distractionRanking: user?.distractionRanking ?? null,
      focusGoalMinutes: user?.focusGoalMinutes ?? null,
      scheduleType: user?.scheduleType ?? null,
      sleepRange: user?.sleepRange ?? null,
      focusDurationComfort: user?.focusDurationComfort ?? null,
      workStylePreference: user?.workStylePreference ?? null,
      otherImproveText: user?.otherImproveText ?? null,
    });
  } catch (e) {
    logError("onboarding", "Failed to fetch onboarding status", e);
    return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const data = parsed.data;

    // Convert arrays to JSON strings for SQLite storage
    const goalsJson = JSON.stringify(data.goals);
    const distractionsListJson = JSON.stringify(data.distractionsList);
    const distractionRankingJson = data.distractionRanking ? JSON.stringify(data.distractionRanking) : null;

    await db.user.update({
      where: { id: userId },
      data: {
        onboarded: true,
        primaryUse: data.primaryUse,
        workSchedule: data.workSchedule,
        preferredFocusDuration: data.estimatedDuration,
        biggestDistraction: data.biggestDistraction,
        goals: goalsJson,
        distractionsList: distractionsListJson,
        focusGoalMinutes: data.focusGoalMinutes ?? data.estimatedDuration * 2,
        // Legacy fields (derived from new UX Rebirth answers)
        role: data.role ?? null,
        workHours: data.workHours ?? null,
        wakeTime: data.wakeTime ?? null,
        sleepTime: data.sleepTime ?? data.sleepRange ?? null,
        chronotype: data.chronotype ?? null,
        focusStyle: data.focusStyle ?? null,
        hasAdhd: data.hasAdhd ?? false,
        pomodoroPreference: data.pomodoroPreference ?? null,
        deepWorkDuration: data.deepWorkDuration ?? null,
        preferredSchedule: data.preferredSchedule ?? null,
        coachPersonality: data.coachPersonality ?? null,
        motivationStyle: data.motivationStyle ?? null,
        distractionRanking: distractionRankingJson,
        // UX Rebirth raw answer fields
        scheduleType: data.scheduleType ?? null,
        sleepRange: data.sleepRange ?? null,
        focusDurationComfort: data.focusDurationComfort ?? null,
        workStylePreference: data.workStylePreference ?? null,
        otherImproveText: data.otherImproveText ?? null,
      },
    });

    if (data.firstMission) {
      await db.mission.create({
        data: { userId, title: data.firstMission, priority: 'medium' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    logError("onboarding", "Failed to complete onboarding", e);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
