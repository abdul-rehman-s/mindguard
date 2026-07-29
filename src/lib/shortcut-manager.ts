/**
 * Centralized Keyboard Shortcut Manager for MindGuard
 * 
 * Provides:
 * - Registry of all shortcuts with unique action IDs
 * - Conflict detection (two shortcuts can't map to same key combo)
 * - Custom shortcuts support (overrides stored in UserSettings)
 * - Guards: prevents triggering in input fields, command palette, focus mode
 * - Export/import of shortcut configurations
 */

import type { AppView } from '@/types';

// ─── Shortcut Definition ───

export type ShortcutModifier = 'cmd' | 'ctrl' | 'alt' | 'shift';
export type ShortcutKey = string; // e.g. 'd', 'k', ',', 'space', 'escape'

export interface ShortcutCombo {
  /** Modifier keys required (cmd/ctrl are treated as platform equivalents) */
  modifiers: ShortcutModifier[];
  /** Main key (lowercase) */
  key: ShortcutKey;
}

export interface ShortcutDefinition {
  /** Unique action identifier, e.g. 'nav.dashboard' */
  id: string;
  /** Human-readable label */
  label: string;
  /** One-line description */
  description: string;
  /** Default key combination */
  defaultCombo: ShortcutCombo;
  /** The action to perform — for nav shortcuts, the view name */
  actionType: 'nav' | 'action';
  /** For nav shortcuts, which AppView to navigate to */
  view?: AppView;
  /** Category for grouping in the shortcuts modal */
  category: 'navigation' | 'focus' | 'actions' | 'system';
  /** Whether this shortcut can be customized by the user */
  customizable: boolean;
}

// ─── Default Shortcuts Registry ───

const defaultShortcuts: ShortcutDefinition[] = [
  // Navigation
  { id: 'nav.dashboard',  label: 'Dashboard',   description: 'Go to your dashboard overview',     defaultCombo: { modifiers: [], key: 'd' },  actionType: 'nav', view: 'dashboard',  category: 'navigation', customizable: true },
  { id: 'nav.mission',    label: 'Missions',     description: 'View and manage your missions',     defaultCombo: { modifiers: [], key: 'm' },  actionType: 'nav', view: 'mission',    category: 'navigation', customizable: true },
  { id: 'nav.timer',      label: 'Focus Timer',  description: 'Start or view a focus session',     defaultCombo: { modifiers: [], key: 't' },  actionType: 'nav', view: 'timer',      category: 'navigation', customizable: true },
  { id: 'nav.reflection', label: 'Reflection',   description: 'Open daily reflection journal',     defaultCombo: { modifiers: [], key: 'r' },  actionType: 'nav', view: 'reflection', category: 'navigation', customizable: true },
  { id: 'nav.sessions',   label: 'Sessions',     description: 'View your session history',         defaultCombo: { modifiers: [], key: 'h' },  actionType: 'nav', view: 'sessions',   category: 'navigation', customizable: true },
  { id: 'nav.stats',      label: 'Statistics',   description: 'See your focus analytics',          defaultCombo: { modifiers: [], key: 's' },  actionType: 'nav', view: 'stats',      category: 'navigation', customizable: true },
  { id: 'nav.replay',     label: 'Daily Replay', description: 'Replay your day as a timeline',     defaultCombo: { modifiers: [], key: 'p' },  actionType: 'nav', view: 'replay',     category: 'navigation', customizable: true },
  { id: 'nav.wrapped',    label: 'Weekly Wrapped', description: 'View your weekly summary',       defaultCombo: { modifiers: [], key: 'w' },  actionType: 'nav', view: 'wrapped',    category: 'navigation', customizable: true },
  { id: 'nav.life',       label: 'Life Dashboard', description: 'Desktop activity view',          defaultCombo: { modifiers: [], key: 'l' },  actionType: 'nav', view: 'life',       category: 'navigation', customizable: true },
  { id: 'nav.review',     label: 'Daily Review', description: 'Today\'s daily review',             defaultCombo: { modifiers: [], key: 'v' },  actionType: 'nav', view: 'review',     category: 'navigation', customizable: true },
  { id: 'nav.settings',   label: 'Settings',     description: 'Open app preferences',              defaultCombo: { modifiers: [], key: ',' },  actionType: 'nav', view: 'settings',   category: 'navigation', customizable: true },

  // System shortcuts (not customizable)
  { id: 'system.palette',     label: 'Command Palette',  description: 'Quick search and navigate',   defaultCombo: { modifiers: ['cmd'], key: 'k' },  actionType: 'action', category: 'system', customizable: false },
  { id: 'system.shortcuts',   label: 'Show Shortcuts',   description: 'Open keyboard shortcuts help', defaultCombo: { modifiers: [], key: '?' },  actionType: 'action', category: 'system', customizable: false },

  // Focus shortcuts (not customizable — reserved for timer logic)
  { id: 'focus.start',   label: 'Start Focus',  description: 'Quick start from timer view',  defaultCombo: { modifiers: [], key: 'space' }, actionType: 'action', category: 'focus', customizable: false },
  { id: 'focus.exit',    label: 'Exit Focus',   description: 'Exit immersive focus mode',    defaultCombo: { modifiers: [], key: 'escape' }, actionType: 'action', category: 'focus', customizable: false },
];

// ─── Shortcut Manager Class ───

export class ShortcutManager {
  private definitions: Map<string, ShortcutDefinition> = new Map();
  /** Custom overrides from user settings: actionId → combo string like "cmd+k" or "d" */
  private customOverrides: Map<string, ShortcutCombo> = new Map();
  /** Resolved combos: actionId → ShortcutCombo (default + override merged) */
  private resolvedCombos: Map<string, ShortcutCombo> = new Map();
  /** Reverse lookup: combo string → actionId (for conflict detection) */
  private comboToAction: Map<string, string> = new Map();
  /** Whether the command palette is currently open */
  private paletteOpen = false;
  /** Registered action callbacks */
  private actionCallbacks: Map<string, () => void> = new Map();

  constructor() {
    // Load all default definitions
    for (const def of defaultShortcuts) {
      this.definitions.set(def.id, def);
    }
    this.rebuildResolved();
  }

  // ─── Combo Normalization ───

  /** Normalize a ShortcutCombo to a unique string key for lookup/comparison */
  comboToString(combo: ShortcutCombo): string {
    const mods = [...combo.modifiers].sort().join('+');
    const key = combo.key.toLowerCase();
    return mods.length > 0 ? `${mods}+${key}` : key;
  }

  /** Parse a combo string like "cmd+k" or "d" back into ShortcutCombo */
  comboFromString(str: string): ShortcutCombo {
    const parts = str.split('+');
    if (parts.length === 1) {
      return { modifiers: [], key: parts[0].toLowerCase() };
    }
    const key = parts[parts.length - 1].toLowerCase();
    const modifiers = parts.slice(0, -1).map(m => m.toLowerCase() as ShortcutModifier);
    return { modifiers, key };
  }

  // ─── Registration ───

  /** Register a callback for a specific action ID */
  registerCallback(actionId: string, callback: () => void) {
    this.actionCallbacks.set(actionId, callback);
  }

  /** Unregister a callback */
  unregisterCallback(actionId: string) {
    this.actionCallbacks.delete(actionId);
  }

  // ─── Lookup ───

  /** Get all shortcut definitions */
  getAllDefinitions(): ShortcutDefinition[] {
    return Array.from(this.definitions.values());
  }

  /** Get definitions by category */
  getByCategory(category: ShortcutDefinition['category']): ShortcutDefinition[] {
    return this.getAllDefinitions().filter(d => d.category === category);
  }

  /** Get the resolved combo for a given action ID (custom override or default) */
  getResolvedCombo(actionId: string): ShortcutCombo | undefined {
    return this.resolvedCombos.get(actionId);
  }

  /** Get the default combo for a given action ID */
  getDefaultCombo(actionId: string): ShortcutCombo | undefined {
    return this.definitions.get(actionId)?.defaultCombo;
  }

  /** Look up which action a KeyboardEvent should trigger */
  resolveEvent(e: KeyboardEvent): string | null {
    // Never trigger if palette is open (except escape to close)
    if (this.paletteOpen && e.key !== 'Escape') return null;

    // Build combo from event
    const modifiers: ShortcutModifier[] = [];
    if (e.metaKey || e.ctrlKey) modifiers.push('cmd');
    if (e.altKey) modifiers.push('alt');
    if (e.shiftKey) modifiers.push('shift');

    // Normalize key
    let key = e.key.toLowerCase();
    if (key === ' ') key = 'space';
    else if (key === 'esc') key = 'escape';
    else if (key === ',') key = ',';

    const combo: ShortcutCombo = { modifiers, key };
    const comboStr = this.comboToString(combo);

    return this.comboToAction.get(comboStr) ?? null;
  }

  // ─── Custom Overrides ───

  /** Set custom overrides from user settings (e.g. from UserSettings.customShortcuts) */
  setCustomOverrides(overrides: Record<string, string> | null) {
    this.customOverrides.clear();
    if (overrides) {
      for (const [actionId, comboStr] of Object.entries(overrides)) {
        if (this.definitions.has(actionId)) {
          const combo = this.comboFromString(comboStr);
          this.customOverrides.set(actionId, combo);
        }
      }
    }
    this.rebuildResolved();
  }

  /** Set a custom override for a single action. Returns conflict info or null if OK. */
  setCustomOverride(actionId: string, combo: ShortcutCombo): ConflictResult | null {
    const def = this.definitions.get(actionId);
    if (!def || !def.customizable) {
      return { conflict: true, reason: 'This shortcut cannot be customized', conflictingActionId: actionId };
    }

    const comboStr = this.comboToString(combo);
    const existingActionId = this.comboToAction.get(comboStr);

    // Check if this combo is already used by a DIFFERENT action
    if (existingActionId && existingActionId !== actionId) {
      const existingDef = this.definitions.get(existingActionId);
      return {
        conflict: true,
        reason: `This shortcut conflicts with "${existingDef?.label ?? existingActionId}"`,
        conflictingActionId: existingActionId,
        conflictingLabel: existingDef?.label ?? existingActionId,
      };
    }

    // Apply override
    this.customOverrides.set(actionId, combo);
    this.rebuildResolved();
    return null; // No conflict
  }

  /** Remove a custom override, reverting to default */
  removeCustomOverride(actionId: string) {
    this.customOverrides.delete(actionId);
    this.rebuildResolved();
  }

  /** Clear all custom overrides */
  clearAllOverrides() {
    this.customOverrides.clear();
    this.rebuildResolved();
  }

  /** Get current custom overrides as a Record<string, string> for saving */
  getCustomOverridesForSave(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [actionId, combo] of this.customOverrides) {
      result[actionId] = this.comboToString(combo);
    }
    return result;
  }

  // ─── Palette State ───

  setPaletteOpen(open: boolean) {
    this.paletteOpen = open;
  }

  // ─── Conflict Detection ───

  checkConflict(combo: ShortcutCombo, excludeActionId?: string): ConflictResult | null {
    const comboStr = this.comboToString(combo);
    const existingActionId = this.comboToAction.get(comboStr);
    if (existingActionId && existingActionId !== excludeActionId) {
      const existingDef = this.definitions.get(existingActionId);
      return {
        conflict: true,
        reason: `This shortcut conflicts with "${existingDef?.label ?? existingActionId}"`,
        conflictingActionId: existingActionId,
        conflictingLabel: existingDef?.label ?? existingActionId,
      };
    }
    return null;
  }

  // ─── Internal ───

  private rebuildResolved() {
    this.resolvedCombos.clear();
    this.comboToAction.clear();

    for (const [id, def] of this.definitions) {
      const combo = this.customOverrides.get(id) ?? def.defaultCombo;
      this.resolvedCombos.set(id, combo);
      this.comboToAction.set(this.comboToString(combo), id);
    }
  }

  // ─── Export / Import ───

  exportConfig(): ShortcutExportData {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      customOverrides: this.getCustomOverridesForSave(),
      defaults: this.getAllDefinitions().map(d => ({
        id: d.id,
        label: d.label,
        defaultCombo: this.comboToString(d.defaultCombo),
      })),
    };
  }

  importConfig(data: ShortcutExportData): ImportResult {
    if (data.version !== 1) {
      return { success: false, errors: ['Unsupported config version'] };
    }

    const errors: string[] = [];
    const overrides: Record<string, string> = {};

    for (const [actionId, comboStr] of Object.entries(data.customOverrides)) {
      const def = this.definitions.get(actionId);
      if (!def) {
        errors.push(`Unknown action: ${actionId}`);
        continue;
      }
      if (!def.customizable) {
        errors.push(`Cannot customize: ${actionId}`);
        continue;
      }
      overrides[actionId] = comboStr;
    }

    this.setCustomOverrides(overrides);
    return { success: true, errors };
  }
}

export interface ConflictResult {
  conflict: true;
  reason: string;
  conflictingActionId: string;
  conflictingLabel?: string;
}

export interface ShortcutExportData {
  version: number;
  exportedAt: string;
  customOverrides: Record<string, string>;
  defaults: { id: string; label: string; defaultCombo: string }[];
}

export interface ImportResult {
  success: boolean;
  errors: string[];
}

// ─── Singleton ───

export const shortcutManager = new ShortcutManager();

// ─── Keyboard Event Helpers ───

/** Check if the event target is an input element where shortcuts should be suppressed */
export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  // Also check role attribute
  if (target.getAttribute('role') === 'textbox') return true;
  return false;
}

/** Format a ShortcutCombo for display (Raycast-style kbd rendering) */
export function formatComboForDisplay(combo: ShortcutCombo): string[] {
  const parts: string[] = [];
  for (const mod of combo.modifiers) {
    switch (mod) {
      case 'cmd': parts.push('⌘'); break;
      case 'ctrl': parts.push('⌃'); break;
      case 'alt': parts.push('⌥'); break;
      case 'shift': parts.push('⇧'); break;
    }
  }
  let keyDisplay = combo.key;
  switch (combo.key) {
    case 'space': keyDisplay = 'Space'; break;
    case 'escape': keyDisplay = 'Esc'; break;
    case ',': keyDisplay = ','; break;
    case '?': keyDisplay = '?'; break;
    default:
      if (combo.key.length === 1) keyDisplay = combo.key.toUpperCase();
  }
  parts.push(keyDisplay);
  return parts;
}
