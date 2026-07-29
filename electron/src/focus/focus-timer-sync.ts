// MindGuard Desktop — Focus Timer Sync
// Synchronizes focus timer state between desktop tray and web app

import type { TimerCommand, TimerStateMessage } from '../types';
import { logger } from '../logger/logger';
import { BrowserWindow } from 'electron';

export class FocusTimerSync {
  private mainWindow: BrowserWindow | null = null;
  private currentTimerState: TimerStateMessage = {
    isRunning: false,
    elapsed: 0,
    missionId: null,
    missionTitle: null,
    focusMode: 'idle',
  };

  initialize(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;
    logger.info('FocusTimerSync', 'Initialized');
  }

  handleTimerCommand(command: TimerCommand): void {
    logger.info('FocusTimerSync', 'Timer command received', { action: command.action });

    switch (command.action) {
      case 'start':
        this.currentTimerState = {
          isRunning: true,
          elapsed: 0,
          missionId: command.missionId || null,
          missionTitle: command.missionTitle || null,
          focusMode: 'focus',
        };
        this.broadcastTimerState();
        break;

      case 'pause':
        this.currentTimerState.isRunning = false;
        this.currentTimerState.focusMode = 'paused';
        this.broadcastTimerState();
        break;

      case 'resume':
        this.currentTimerState.isRunning = true;
        this.currentTimerState.focusMode = 'focus';
        this.broadcastTimerState();
        break;

      case 'stop':
        this.currentTimerState.isRunning = false;
        this.currentTimerState.focusMode = 'idle';
        this.currentTimerState.elapsed = 0;
        this.broadcastTimerState();
        break;

      case 'complete':
        this.currentTimerState.isRunning = false;
        this.currentTimerState.focusMode = 'celebration';
        this.broadcastTimerState();
        break;
    }
  }

  updateElapsed(elapsed: number): void {
    this.currentTimerState.elapsed = elapsed;
  }

  broadcastTimerState(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('desktop:timer-sync', this.currentTimerState);
    }
  }

  getTimerState(): TimerStateMessage {
    return this.currentTimerState;
  }

  isTimerRunning(): boolean {
    return this.currentTimerState.isRunning;
  }
}
