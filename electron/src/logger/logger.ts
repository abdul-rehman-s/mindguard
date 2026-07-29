// MindGuard Desktop — Centralized Logger
// All logging goes through this module. NO console.log anywhere else.

import type { LogLevel, LogEntry } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

class Logger {
  private logDir: string;
  private logFile: string;
  private maxFileSize = 5 * 1024 * 1024; // 5MB
  private maxFiles = 3;
  private isDev: boolean;

  constructor() {
    this.isDev = !app.isPackaged;
    this.logDir = path.join(app.getPath('userData'), 'logs');
    this.logFile = path.join(this.logDir, 'desktop.log');
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatEntry(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      module,
      data,
    };
  }

  private writeToFile(entry: LogEntry): void {
    try {
      const line = JSON.stringify(entry) + '\n';
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size > this.maxFileSize) {
          this.rotateLogs();
        }
      }
      fs.appendFileSync(this.logFile, line, { encoding: 'utf8' });
    } catch {
      // Silently fail — never crash the app due to logging issues
    }
  }

  private rotateLogs(): void {
    try {
      for (let i = this.maxFiles - 1; i >= 1; i--) {
        const oldFile = path.join(this.logDir, `desktop.log.${i}`);
        const newFile = path.join(this.logDir, `desktop.log.${i + 1}`);
        if (fs.existsSync(oldFile)) {
          fs.renameSync(oldFile, newFile);
        }
      }
      if (fs.existsSync(this.logFile)) {
        fs.renameSync(this.logFile, path.join(this.logDir, 'desktop.log.1'));
      }
    } catch {
      // Silently fail
    }
  }

  private log(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): void {
    const entry = this.formatEntry(level, module, message, data);
    this.writeToFile(entry);

    if (this.isDev || level === 'error' || level === 'warn') {
      const prefix = `[MindGuard:${module}] ${level.toUpperCase()}`;
      if (data) {
        process.stdout.write(`${prefix}: ${message} ${JSON.stringify(data)}\n`);
      } else {
        process.stdout.write(`${prefix}: ${message}\n`);
      }
    }
  }

  debug(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('error', module, message, data);
  }
}

// Singleton logger instance
export const logger = new Logger();
