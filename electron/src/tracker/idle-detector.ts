// MindGuard Desktop — Idle Detection
// Detects system idle time using native modules + fallback mechanisms

import type { IdleState } from '../types';
import { logger } from '../logger/logger';

export class IdleDetector {
  private idleTimeModule: { getIdleTimeMs: () => number } | null = null;
  private moduleLoaded = false;
  private lastActivityTimestamp = Date.now();
  private lastKnownIdleMs = 0;
  private thresholdMs = 300000; // 5 min default
  private isLocked = false;

  constructor(thresholdMs?: number) {
    if (thresholdMs) this.thresholdMs = thresholdMs;
  }

  async initialize(): Promise<boolean> {
    // Try native idle time modules
    try {
      const idleTime = require('@nicbarker/electron-idle-time');
      this.idleTimeModule = idleTime;
      this.moduleLoaded = true;
      logger.info('IdleDetector', 'electron-idle-time native module loaded');
      return true;
    } catch {
      // Try alternative
      try {
        const idleTime = require('node-idle-time');
        this.idleTimeModule = idleTime;
        this.moduleLoaded = true;
        logger.info('IdleDetector', 'node-idle-time module loaded');
        return true;
      } catch {
        this.moduleLoaded = false;
        logger.warn('IdleDetector', 'No native idle module available, using fallback (last activity tracking)');
        return false;
      }
    }
  }

  getIdleState(): IdleState {
    let idleMs: number;

    if (this.moduleLoaded && this.idleTimeModule) {
      try {
        idleMs = this.idleTimeModule.getIdleTimeMs();
        this.lastKnownIdleMs = idleMs;
      } catch {
        // Fallback to last known or computed value
        idleMs = this.computeFallbackIdle();
      }
    } else {
      idleMs = this.computeFallbackIdle();
    }

    return {
      idleMs,
      isIdle: idleMs >= this.thresholdMs,
      isLocked: this.isLocked,
      thresholdMs: this.thresholdMs,
      lastActivityAt: new Date(this.lastActivityTimestamp).toISOString(),
    };
  }

  setThreshold(thresholdMs: number): void {
    this.thresholdMs = thresholdMs;
    logger.info('IdleDetector', 'Idle threshold updated', { thresholdMs });
  }

  recordActivity(): void {
    this.lastActivityTimestamp = Date.now();
    this.lastKnownIdleMs = 0;
  }

  setLockedState(locked: boolean): void {
    this.isLocked = locked;
    if (locked) {
      logger.info('IdleDetector', 'Screen locked detected');
    } else {
      logger.info('IdleDetector', 'Screen unlocked — resuming tracking');
      this.lastActivityTimestamp = Date.now();
    }
  }

  private computeFallbackIdle(): number {
    const elapsed = Date.now() - this.lastActivityTimestamp;
    // If we've seen activity recently, use elapsed since last activity
    return Math.max(this.lastKnownIdleMs, elapsed);
  }
}
