// MindGuard Desktop — Local SQLite Database
// Offline-first storage with WAL mode, prepared statements, and migration support.
// All activity data is stored locally before being synced to the web API.

import BetterSqlite3 from 'better-sqlite3';
import type { Database } from 'better-sqlite3';
import type {
  LocalActivityRow,
  SyncQueueItem,
  CreateActivityInput,
} from '../types';
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from './schema';
import { logger } from '../logger/logger';

export class LocalDB {
  /** Raw better-sqlite3 Database instance — exposed for SettingsManager direct access */
  public db: Database;

  // ── Prepared statements (created once, reused for performance) ──
  private stmtInsertActivity!: BetterSqlite3.Statement;
  private stmtInsertActivityBatch!: BetterSqlite3.Statement;
  private stmtGetUnsyncedActivities!: BetterSqlite3.Statement;
  private stmtAddToSyncQueue!: BetterSqlite3.Statement;
  private stmtGetPendingSyncQueue!: BetterSqlite3.Statement;
  private stmtUpdateSyncQueueStatus!: BetterSqlite3.Statement;
  private stmtIncrementRetryCount!: BetterSqlite3.Statement;
  private stmtGetUnsyncedCount!: BetterSqlite3.Statement;
  private stmtGetFailedSyncCount!: BetterSqlite3.Statement;

  constructor(dbPath: string) {
    try {
      this.db = new BetterSqlite3(dbPath);

      // Enable WAL mode for better concurrent read performance
      this.db.pragma('journal_mode = WAL');

      // Enable foreign keys (if we add them in future migrations)
      this.db.pragma('foreign_keys = ON');

      // Busy timeout — wait up to 5s if another process holds the lock
      this.db.pragma('busy_timeout = 5000');

      logger.info('LocalDB', 'Database opened', { path: dbPath });
    } catch (err) {
      logger.error('LocalDB', 'Failed to open database', { path: dbPath, error: String(err) });
      throw err;
    }
  }

  // =========================================================================
  // Initialization & Migrations
  // =========================================================================

  /** Create tables and run pending migrations. Called once on app startup. */
  initialize(): void {
    try {
      // Create all tables if they don't exist yet
      this.db.exec(CREATE_TABLES_SQL);

      // Track the current schema version
      this.runMigrations();

      // Prepare all statements for reuse
      this.prepareStatements();

      logger.info('LocalDB', 'Database initialized', { version: SCHEMA_VERSION });
    } catch (err) {
      logger.error('LocalDB', 'Failed to initialize database', { error: String(err) });
      throw err;
    }
  }

  /** Close the database connection. Called on app quit. */
  close(): void {
    try {
      // Optimize the database before closing
      this.db.pragma('optimize');
      this.db.close();
      logger.info('LocalDB', 'Database closed');
    } catch (err) {
      logger.error('LocalDB', 'Error closing database', { error: String(err) });
    }
  }

  // =========================================================================
  // Activity Methods
  // =========================================================================

  /** Insert a single activity record into the local database. */
  insertActivity(activity: CreateActivityInput): void {
    try {
      this.stmtInsertActivity.run(
        activity.type,
        activity.title ?? null,
        activity.category ?? null,
        activity.duration,
        activity.startedAt,
        activity.endedAt ?? null,
        activity.application ?? null,
        activity.website ?? null,
        activity.metadata ?? null,
      );
      logger.debug('LocalDB', 'Activity inserted', { type: activity.type, duration: activity.duration });
    } catch (err) {
      logger.error('LocalDB', 'Failed to insert activity', { error: String(err) });
    }
  }

  /** Insert a batch of activity records using a transaction for atomicity. */
  insertActivityBatch(activities: CreateActivityInput[]): void {
    if (activities.length === 0) return;

    try {
      const insertMany = this.db.transaction(() => {
        for (const activity of activities) {
          this.stmtInsertActivityBatch.run(
            activity.type,
            activity.title ?? null,
            activity.category ?? null,
            activity.duration,
            activity.startedAt,
            activity.endedAt ?? null,
            activity.application ?? null,
            activity.website ?? null,
            activity.metadata ?? null,
          );
        }
      });

      insertMany();
      logger.debug('LocalDB', 'Activity batch inserted', { count: activities.length });
    } catch (err) {
      logger.error('LocalDB', 'Failed to insert activity batch', { count: activities.length, error: String(err) });
    }
  }

  /** Get activities that haven't been synced yet (synced = 0). */
  getUnsyncedActivities(limit: number): LocalActivityRow[] {
    try {
      const rows = this.stmtGetUnsyncedActivities.all(limit) as LocalActivityRow[];
      return rows;
    } catch (err) {
      logger.error('LocalDB', 'Failed to get unsynced activities', { error: String(err) });
      return [];
    }
  }

  /** Mark activities as synced by setting synced = 1 for the given IDs. */
  markActivitiesSynced(ids: number[]): void {
    if (ids.length === 0) return;

    try {
      // Use a parameterized approach — build placeholders dynamically
      const placeholders = ids.map(() => '?').join(',');
      this.db.prepare(`UPDATE activities SET synced = 1 WHERE id IN (${placeholders})`).run(...ids);
      logger.debug('LocalDB', 'Activities marked synced', { count: ids.length });
    } catch (err) {
      logger.error('LocalDB', 'Failed to mark activities synced', { error: String(err) });
    }
  }

  // =========================================================================
  // Sync Queue Methods
  // =========================================================================

  /** Add an item to the sync queue for retry processing. */
  addToSyncQueue(type: string, payload: string): void {
    try {
      this.stmtAddToSyncQueue.run(type, payload);
      logger.debug('LocalDB', 'Sync queue item added', { type });
    } catch (err) {
      logger.error('LocalDB', 'Failed to add sync queue item', { type, error: String(err) });
    }
  }

  /** Get pending items from the sync queue (status = 'pending'). */
  getPendingSyncQueue(limit: number): SyncQueueItem[] {
    try {
      const rows = this.stmtGetPendingSyncQueue.all(limit) as SyncQueueItem[];
      return rows;
    } catch (err) {
      logger.error('LocalDB', 'Failed to get pending sync queue', { error: String(err) });
      return [];
    }
  }

  /** Update the status of a sync queue item. */
  updateSyncQueueStatus(id: number, status: string): void {
    try {
      this.stmtUpdateSyncQueueStatus.run(status, id);
      logger.debug('LocalDB', 'Sync queue status updated', { id, status });
    } catch (err) {
      logger.error('LocalDB', 'Failed to update sync queue status', { id, status, error: String(err) });
    }
  }

  /** Increment the retry count for a sync queue item. */
  incrementRetryCount(id: number): void {
    try {
      this.stmtIncrementRetryCount.run(id);
      logger.debug('LocalDB', 'Sync queue retry count incremented', { id });
    } catch (err) {
      logger.error('LocalDB', 'Failed to increment retry count', { id, error: String(err) });
    }
  }

  // =========================================================================
  // Count Methods
  // =========================================================================

  /** Count activities that haven't been synced yet (synced = 0). */
  getUnsyncedCount(): number {
    try {
      const row = this.stmtGetUnsyncedCount.get() as { count: number } | undefined;
      return row?.count ?? 0;
    } catch (err) {
      logger.error('LocalDB', 'Failed to get unsynced count', { error: String(err) });
      return 0;
    }
  }

  /** Count sync queue items that have failed (status = 'failed'). */
  getFailedSyncCount(): number {
    try {
      const row = this.stmtGetFailedSyncCount.get() as { count: number } | undefined;
      return row?.count ?? 0;
    } catch (err) {
      logger.error('LocalDB', 'Failed to get failed sync count', { error: String(err) });
      return 0;
    }
  }

  // =========================================================================
  // Data Export
  // =========================================================================

  /** Export all local data as a JSON string (for diagnostics / export-logs). */
  exportAllData(): string {
    try {
      const activities = this.db.prepare('SELECT * FROM activities ORDER BY startedAt DESC').all();
      const sessions = this.db.prepare('SELECT * FROM sessions ORDER BY startedAt DESC').all();
      const settings = this.db.prepare('SELECT * FROM settings').all();
      const syncQueue = this.db.prepare('SELECT * FROM sync_queue ORDER BY createdAt DESC').all();
      const events = this.db.prepare('SELECT * FROM events ORDER BY timestamp DESC').all();
      const migrations = this.db.prepare('SELECT * FROM _migrations ORDER BY version DESC').all();

      const exportData = {
        exportedAt: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
        activities,
        sessions,
        settings,
        syncQueue,
        events,
        migrations,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (err) {
      logger.error('LocalDB', 'Failed to export all data', { error: String(err) });
      return JSON.stringify({ error: String(err), exportedAt: new Date().toISOString() });
    }
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  /** Run schema migrations — applies new versions not yet recorded in _migrations. */
  private runMigrations(): void {
    try {
      // Check what version we're currently at
      const currentRow = this.db.prepare('SELECT MAX(version) as version FROM _migrations').get() as { version: number | null } | undefined;
      const currentVersion = currentRow?.version ?? 0;

      if (currentVersion >= SCHEMA_VERSION) {
        logger.debug('LocalDB', 'Schema is up to date', { current: currentVersion, target: SCHEMA_VERSION });
        return;
      }

      // Future migrations can be added here as numbered blocks:
      // if (currentVersion < 2) { this.db.exec(MIGRATION_V2_SQL); }
      // if (currentVersion < 3) { this.db.exec(MIGRATION_V3_SQL); }

      // Record the migration
      this.db.prepare('INSERT INTO _migrations (version, appliedAt) VALUES (?, ?)').run(
        SCHEMA_VERSION,
        new Date().toISOString(),
      );

      logger.info('LocalDB', 'Migration applied', { from: currentVersion, to: SCHEMA_VERSION });
    } catch (err) {
      logger.error('LocalDB', 'Migration failed', { error: String(err) });
      throw err;
    }
  }

  /** Create prepared statements for all frequently-used queries. */
  private prepareStatements(): void {
    this.stmtInsertActivity = this.db.prepare(
      `INSERT INTO activities (type, title, category, duration, startedAt, endedAt, application, website, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    // Separate statement for batch — same SQL, different name for clarity
    this.stmtInsertActivityBatch = this.db.prepare(
      `INSERT INTO activities (type, title, category, duration, startedAt, endedAt, application, website, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    this.stmtGetUnsyncedActivities = this.db.prepare(
      `SELECT id, type, title, category, duration, startedAt, endedAt, application, website, metadata, synced, createdAt
       FROM activities WHERE synced = 0 ORDER BY startedAt ASC LIMIT ?`,
    );

    this.stmtAddToSyncQueue = this.db.prepare(
      `INSERT INTO sync_queue (type, payload) VALUES (?, ?)`,
    );

    this.stmtGetPendingSyncQueue = this.db.prepare(
      `SELECT id, type, payload, status, retryCount, createdAt, updatedAt
       FROM sync_queue WHERE status = 'pending' ORDER BY createdAt ASC LIMIT ?`,
    );

    this.stmtUpdateSyncQueueStatus = this.db.prepare(
      `UPDATE sync_queue SET status = ?, updatedAt = datetime('now') WHERE id = ?`,
    );

    this.stmtIncrementRetryCount = this.db.prepare(
      `UPDATE sync_queue SET retryCount = retryCount + 1, updatedAt = datetime('now') WHERE id = ?`,
    );

    this.stmtGetUnsyncedCount = this.db.prepare(
      'SELECT COUNT(*) as count FROM activities WHERE synced = 0',
    );

    this.stmtGetFailedSyncCount = this.db.prepare(
      'SELECT COUNT(*) as count FROM sync_queue WHERE status = \'failed\'',
    );
  }
}
