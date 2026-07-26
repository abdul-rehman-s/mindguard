// MindGuard Desktop — Security Manager
// Handles encrypted local storage, JWT token management, secure IPC validation

import { logger } from '../logger/logger';
import { encrypt, decrypt, generateKey, hash } from '../utils/crypto';
import Store from 'electron-store';

export class SecurityManager {
  private store: Store<Record<string, string>>;
  private encryptionKey: string;
  private authToken: string | null = null;
  private authHash: string | null = null; // Hashed version for verification

  constructor() {
    this.store = new Store<Record<string, string>>({
      name: 'mindguard-security',
      encryptionKey: 'mindguard-security-v5',
    });

    // Get or generate encryption key
    this.encryptionKey = (this.store as any).get('encryptionKey') as string;
    if (!this.encryptionKey) {
      this.encryptionKey = generateKey();
      (this.store as any).set('encryptionKey', this.encryptionKey);
    }
  }

  storeAuthToken(token: string): void {
    // Encrypt the token before storing
    const encrypted = encrypt(token, this.encryptionKey);
    (this.store as any).set('authToken', encrypted);

    // Store hash for quick verification
    this.authHash = hash(token);
    this.authToken = token;

    logger.info('SecurityManager', 'Auth token stored securely');
  }

  getAuthToken(): string | null {
    if (this.authToken) return this.authToken;

    // Try to decrypt from storage
    const encrypted = (this.store as any).get('authToken') as string;
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
    (this.store as any).delete('authToken');
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

  // Validate IPC inputs to prevent injection attacks
  validateIPCInput(channel: string, input: unknown): boolean {
    // Only allow known IPC channels
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

    // Type-check input
    if (input === null || input === undefined) return true; // Some channels have void input

    if (typeof input === 'string') {
      // Prevent overly long strings
      if (input.length > 10000) {
        logger.warn('SecurityManager', 'Rejected overly long string input', { channel, length: input.length });
        return false;
      }
      return true;
    }

    if (typeof input === 'object') {
      // Prevent deeply nested objects
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
