// MindGuard Desktop — Session Recorder
// Automatically creates focus sessions from tracked activity data

import type { FocusSessionInfo, FocusState } from '../types';
import { logger } from '../logger/logger';

interface SessionBoundary {
  focusState: FocusState;
  startedAt: Date;
  endedAt: Date | null;
  missionId: string | null;
}

export class SessionRecorder {
  private currentSession: SessionBoundary | null = null;
  private completedSessions: FocusSessionInfo[] = [];

  // Focus states that count as a session
  private SESSION_STATES: FocusState[] = [
    'deep_work', 'focus', 'coding', 'reading', 'research',
    'learning', 'ai_usage', 'meeting',
  ];

  startSession(focusState: FocusState, missionId: string | null = null): void {
    if (!this.SESSION_STATES.includes(focusState)) {
      // Not a session-worthy state
      this.endCurrentSession();
      return;
    }

    // If we already have a session with the same state, continue it
    if (this.currentSession && this.currentSession.focusState === focusState) {
      return; // Continue existing session
    }

    // End previous session first
    this.endCurrentSession();

    // Start new session
    this.currentSession = {
      focusState,
      startedAt: new Date(),
      endedAt: null,
      missionId,
    };

    logger.info('SessionRecorder', 'Session started', {
      focusState,
      missionId,
    });
  }

  endCurrentSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endedAt = new Date();
    const durationMs = this.currentSession.endedAt.getTime() - this.currentSession.startedAt.getTime();
    const durationSec = Math.round(durationMs / 1000);

    // Only record sessions that are at least 5 minutes long
    if (durationSec >= 300) {
      const session: FocusSessionInfo = {
        id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        focusState: this.currentSession.focusState,
        startedAt: this.currentSession.startedAt.toISOString(),
        endedAt: this.currentSession.endedAt.toISOString(),
        duration: durationSec,
        missionId: this.currentSession.missionId,
        quality: this.calculateQuality(durationSec, this.currentSession.focusState),
        distractionCount: 0, // Will be populated by tracker
      };

      this.completedSessions.push(session);
      logger.info('SessionRecorder', 'Session completed', {
        focusState: session.focusState,
        duration: durationSec,
        quality: session.quality,
      });
    } else {
      logger.debug('SessionRecorder', 'Session too short to record', {
        duration: durationSec,
        focusState: this.currentSession.focusState,
      });
    }

    this.currentSession = null;
  }

  updateFocusState(newFocusState: FocusState, missionId?: string | null): void {
    if (!this.SESSION_STATES.includes(newFocusState)) {
      this.endCurrentSession();
      return;
    }

    if (!this.currentSession) {
      this.startSession(newFocusState, missionId ?? null);
      return;
    }

    // If focus state changed, end old session and start new one
    if (this.currentSession.focusState !== newFocusState) {
      this.endCurrentSession();
      this.startSession(newFocusState, missionId ?? null);
    }
  }

  getCurrentSession(): SessionBoundary | null {
    return this.currentSession;
  }

  getCompletedSessions(): FocusSessionInfo[] {
    return [...this.completedSessions];
  }

  clearCompletedSessions(): FocusSessionInfo[] {
    const sessions = [...this.completedSessions];
    this.completedSessions = [];
    return sessions;
  }

  private calculateQuality(durationSec: number, focusState: FocusState): number {
    // Base quality from duration
    if (durationSec >= 5400) return 9; // >90 min = excellent
    if (durationSec >= 3600) return 8; // >60 min = very good
    if (durationSec >= 1500) return 7; // >25 min = good
    if (durationSec >= 900) return 6;  // >15 min = decent
    if (durationSec >= 300) return 5;  // >5 min = acceptable

    // Boost for deep work states
    if (focusState === 'deep_work') return 10;
    if (focusState === 'coding' && durationSec >= 1500) return 9;
    if (focusState === 'meeting') return 6; // Meetings are neutral quality

    return 5;
  }
}
