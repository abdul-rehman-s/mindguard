// MindGuard Desktop — Security Manager
// Handles encrypted local storage, JWT token management, secure IPC validation.
// Uses better-sqlite3 (via LocalDB) instead of electron-store (ESM-only).

import { logger } from '../logger/logger';
import { encrypt, decrypt, generateKey, hash } from '../utils/crypto';
import { LocalDB } from '../database/local-db';

const ENCRYPTION_KEY_KEY = 'security_encryption_key';
const AUTH_TOKEN_KEY = 'security_auth_token';

export class SecurityManager {
  private localDB: LocalDB;
  private encryptionKey: string;
  private authToken: string | null = null;
  private authHash: string | null = null;

  constructor(localDB: LocalDB) {
    this.localDB = localDB;

    // Get or generate encryption key from the DB
        const storedKey = this.getSetting(ENCRYPTION_KEY_KEY);
        if (storedKey) {
          this.encryptionKey = storedKey;
        } else {
          this.encryptionKey = generateKey();
          this.setSetting(ENCRYPTION_KEY_KEY, this.encryptionKey);
        }

    // Restore auth token if one was persisted
    const encryptedToken = this.getSetting(AUTH_TOKEN_KEY);
    if (encryptedToken) {
      try {
        this.authToken = decrypt(encryptedToken, this.encryptionKey);
        this.authHash = this.authToken ? hash(this.authToken) : null;
      } catch {
        logger.warn('SecurityManager', 'Failed to restore auth token from DB');
      }
    }
  }

  storeAuthToken(token: string): void {
    const encrypted = encrypt(token, this.encryptionKey);
    this.setSetting(AUTH_TOKEN_KEY, encrypted);
    this.authHash = hash(token);
    this.authToken = token;
    logger.info('SecurityManager', 'Auth token stored securely');
  }

  getAuthToken(): string | null {
    if (this.authToken) return this.authToken;

    const encrypted = this.getSetting(AUTH_TOKEN_KEY);
    if (!encrypted) return null;

    try {
      this.authToken = decrypt(encrypted, this.encryptionKey);
      return this.authToken;
    } catch {
      logger.error('SecurityManager', 'Failed to decrypt auth token');
      return null;
    }
  }

  clearAuthToken(): void {
    this.authToken = null;
    this.authHash = null;
    this.deleteSetting(AUTH_TOKEN_KEY);
    logger.info('SecurityManager', 'Auth token cleared');
  }

  verifyTokenHash(token: string): boolean {
    return this.authHash === hash(token);
  }

  encryptLocalData(data: string): string {
    return encrypt(data, this.encryptionKey);
  }

  decryptLocalData(encrypted: string): string {
    return decrypt(encrypted, this.encryptionKey);
  }

  validateIPCInput(channel: string, input: unknown): boolean {
    const allowedChannels = [
      'desktop:get-status',
      'desktop:get-settings',
      'desktop:update-settings',
      'desktop:auth-token',
      'desktop:report-activity',
      'desktop:report-batch',
      'desktop:start-focus-protection',
      'desktop:stop-focus-protection',
      'desktop:trigger-notification',
      'desktop:set-auto-start',
      'desktop:force-sync',
      'desktop:get-sync-status',
      'desktop:pause-tracking',
      'desktop:resume-tracking',
      'desktop:export-logs',
    ];

    if (!allowedChannels.includes(channel)) {
      logger.warn('SecurityManager', 'Rejected unknown IPC channel', { channel });
      return false;
    }

    if (input === null || input === undefined) return true;

    if (typeof input === 'string') {
      if (input.length > 10000) {
        logger.warn('SecurityManager', 'Rejected overly long string input', { channel, length: input.length });
        return false;
      }
      return true;
    }

    if (typeof input === 'object') {
      const depth = this.getObjectDepth(input);
      if (depth > 5) {
        logger.warn('SecurityManager', 'Rejected deeply nested input', { channel, depth });
        return false;
      }
      return true;
    }

    if (typeof input === 'boolean' || typeof input === 'number') return true;

    logger.warn('SecurityManager', 'Rejected input of unexpected type', { channel, type: typeof input });
    return false;
  }

  // =========================================================================
  // Private helpers — settings table CRUD (replaces electron-store)
  // =========================================================================

  private getSetting(key: string): string | null {
    try {
      const db = (this.localDB as unknown as { db: { prepare: (sql: string) => { get: (...args: unknown[]) => unknown } } }).db;
      const row = db?.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
      return row?.value ?? null;
    } catch {
      return null;
    }
  }

  private setSetting(key: string, value: string): void {
    try {
      const db = (this.localDB as unknown as { db: { prepare: (sql: string) => { run: (...args: unknown[]) => void } } }).db;
      db?.prepare(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      ).run(key, value);
    } catch (err) {
      logger.error('SecurityManager', `Failed to write setting ${key}`, { error: String(err) });
    }
  }

  private deleteSetting(key: string): void {
    try {
      const db = (this.localDB as unknown as { db: { prepare: (sql: string) => { run: (...args: unknown[]) => void } } }).db;
      db?.prepare('DELETE FROM settings WHERE key = ?').run(key);
    } catch (err) {
      logger.error('SecurityManager', `Failed to delete setting ${key}`, { error: String(err) });
    }
  }

  private getObjectDepth(obj: unknown, maxDepth = 10): number {
    if (maxDepth <= 0) return 10;
    if (typeof obj !== 'object' || obj === null) return 0;
    let maxChildDepth = 0;
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const childDepth = this.getObjectDepth(record[key], maxDepth - 1);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
    return 1 + maxChildDepth;
  }
}