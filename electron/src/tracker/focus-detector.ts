// MindGuard Desktop — Focus Detection
// Determines focus state from activity patterns (deep_work, coding, reading, etc.)

import type { FocusState, ClassificationResult, ActivityInfo, IdleState } from '../types';
import { logger } from '../logger/logger';

interface FocusContext {
  currentActivity: ActivityInfo | null;
  classification: ClassificationResult | null;
  idleState: IdleState | null;
  sessionStartAt: Date | null;
  totalDurationMs: number;
  contextSwitchCount: number;
  previousFocusState: FocusState | null;
}

export class FocusDetector {
  private currentFocusState: FocusState = 'idle';
  private totalDurationMs = 0;
  private contextSwitchCount = 0;
  private lastAppName: string | null = null;

  detectFocus(context: FocusContext): FocusState {
    const { currentActivity, classification, idleState } = context;

    // 1. Idle detection — highest priority
    if (idleState && idleState.isIdle) {
      if (this.currentFocusState !== 'idle') {
        logger.info('FocusDetector', 'Focus state changed to idle', {
          previousState: this.currentFocusState,
          idleMs: idleState.idleMs,
        });
      }
      return 'idle';
    }

    // 2. Screen locked = idle
    if (idleState && idleState.isLocked) {
      return 'idle';
    }

    // 3. No activity = idle
    if (!currentActivity || !classification) {
      return this.currentFocusState === 'idle' ? 'idle' : 'break';
    }

    // 4. Count context switches
    if (this.lastAppName && this.lastAppName !== currentActivity.appName) {
      this.contextSwitchCount++;
    }
    this.lastAppName = currentActivity.appName;

    // 5. Meeting detection
    const meetingApps = ['Zoom', 'Microsoft Teams', 'Google Meet', 'Webex', 'Skype', 'FaceTime'];
    if (meetingApps.some(m => currentActivity.appName.includes(m))) {
      return 'meeting';
    }

    // 6. Classification-based focus detection
    const productive = classification.productivityLevel === 'productive';
    const distracting = classification.productivityLevel === 'distracting';

    // 7. Distracting = distraction state (if high context switches)
    if (distracting && this.contextSwitchCount > 5) {
      return 'distraction';
    }

    // 8. Coding detection
    if (classification.type === 'coding' || currentActivity.appName.toLowerCase().includes('code') || currentActivity.appName.toLowerCase().includes('terminal')) {
      if (this.totalDurationMs > 600000) { // >10 min
        return 'coding';
      }
      return productive ? 'focus' : 'coding';
    }

    // 9. Reading detection
    if (classification.type === 'reading') {
      return 'reading';
    }

    // 10. Research detection
    if (classification.type === 'research') {
      return 'research';
    }

    // 11. Learning detection
    if (classification.type === 'learning') {
      return 'learning';
    }

    // 12. AI usage detection
    if (classification.type === 'ai_usage') {
      return 'ai_usage';
    }

    // 13. Deep work detection (productive + sustained focus >25 min)
    if (productive && this.totalDurationMs > 1500000) { // >25 min
      return 'deep_work';
    }

    // 14. Regular productive focus
    if (productive && this.totalDurationMs > 300000) { // >5 min
      return 'focus';
    }

    // 15. Browsing (if browser without productive classification)
    if (classification.type === 'browsing') {
      return 'browsing';
    }

    // 16. Distracting activity (not high context switches)
    if (distracting) {
      return 'distraction';
    }

    // 17. Break (idle <15 min after focus session)
    if (this.currentFocusState !== 'idle' && !productive && !distracting) {
      return 'break';
    }

    // 18. Default
    return 'focus';
  }

  updateState(newState: FocusState): void {
    if (newState !== this.currentFocusState) {
      logger.info('FocusDetector', 'Focus state transition', {
        from: this.currentFocusState,
        to: newState,
        duration: this.totalDurationMs,
      });
    }

    this.currentFocusState = newState;

    // Reset session on meaningful state changes
    const meaningfulChanges: [FocusState, FocusState][] = [
      ['deep_work', 'idle'],
      ['focus', 'idle'],
      ['coding', 'idle'],
      ['focus', 'distraction'],
      ['deep_work', 'distraction'],
      ['idle', 'focus'],
      ['idle', 'deep_work'],
      ['idle', 'coding'],
    ];

    const isMeaningfulChange = meaningfulChanges.some(
      ([from, to]) => from === this.currentFocusState && to === newState
    );

    if (isMeaningfulChange || newState === 'idle') {
      this.totalDurationMs = 0;
      this.contextSwitchCount = 0;
    }
  }

  addDuration(ms: number): void {
    this.totalDurationMs += ms;
  }

  getCurrentState(): FocusState {
    return this.currentFocusState;
  }

  getSessionDurationMs(): number {
    return this.totalDurationMs;
  }

  getContextSwitchCount(): number {
    return this.contextSwitchCount;
  }
}
