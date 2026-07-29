'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { shortcutManager, isInputElement } from '@/lib/shortcut-manager';

/**
 * Global keyboard shortcuts hook using the centralized ShortcutManager.
 *
 * Key fixes from previous implementation:
 * 1. Uses ShortcutManager for conflict detection and centralized registry
 * 2. Suppresses shortcuts when command palette is open (via manager.setPaletteOpen)
 * 3. Suppresses shortcuts in input fields, textareas, contentEditable elements
 * 4. Suppresses shortcuts when focus timer mode is active
 * 5. Proper event cleanup with stable reference pattern
 * 6. Handles modifier keys correctly (Cmd/Ctrl treated as platform equivalent)
 * 7. Supports custom shortcuts via UserSettings.customShortcuts
 * 8. Escape key always works (for closing palette/focus mode)
 */
export function useKeyboardShortcuts() {
  const setView = useAppStore((s) => s.setView);
  const focusMode = useAppStore((s) => s.focusMode);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const shortcutsModalRef = useRef<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

  // Register callbacks with the shortcut manager
  useEffect(() => {
    // Navigation shortcuts
    shortcutManager.registerCallback('nav.dashboard', () => setView('dashboard'));
    shortcutManager.registerCallback('nav.mission', () => setView('mission'));
    shortcutManager.registerCallback('nav.timer', () => setView('timer'));
    shortcutManager.registerCallback('nav.reflection', () => setView('reflection'));
    shortcutManager.registerCallback('nav.sessions', () => setView('sessions'));
    shortcutManager.registerCallback('nav.stats', () => setView('stats'));
    shortcutManager.registerCallback('nav.replay', () => setView('replay'));
    shortcutManager.registerCallback('nav.wrapped', () => setView('wrapped'));
    shortcutManager.registerCallback('nav.life', () => setView('life'));
    shortcutManager.registerCallback('nav.review', () => setView('review'));
    shortcutManager.registerCallback('nav.settings', () => setView('settings'));
    shortcutManager.registerCallback('nav.habits', () => setView('habits'));
    shortcutManager.registerCallback('nav.monthly', () => setView('monthly'));

    // System shortcuts — these are handled by their respective components
    // We don't register callbacks for palette/shortcuts modal here
    // because those components handle their own keyboard events.

    return () => {
      const ids = [
        'nav.dashboard', 'nav.mission', 'nav.timer', 'nav.reflection',
        'nav.sessions', 'nav.stats', 'nav.replay', 'nav.wrapped',
        'nav.life', 'nav.review', 'nav.settings', 'nav.habits', 'nav.monthly',
      ];
      ids.forEach(id => shortcutManager.unregisterCallback(id));
    };
  }, [setView]);

  // Main keyboard event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Always allow Escape key (for closing modals, palette, focus mode)
    if (e.key === 'Escape') {
      // Don't prevent default — let the escape propagate to modals/palette
      return;
    }

    // Ignore if typing in an input/textarea/contentEditable element
    if (isInputElement(e.target)) return;

    // Ignore if focus mode is active (not idle) — shortcuts disabled during timer
    if (focusMode !== 'idle') return;

    // Resolve the event through the shortcut manager
    const actionId = shortcutManager.resolveEvent(e);
    if (!actionId) return;

    // Get the definition
    const def = shortcutManager.getAllDefinitions().find(d => d.id === actionId);
    if (!def) return;

    // Skip system/focus shortcuts that are handled by their own components
    // (palette, shortcuts modal, focus timer start/stop)
    if (def.category === 'system' || def.category === 'focus') {
      return; // Let these propagate to their own handlers
    }

    // Execute the callback
    const callback = shortcutManager.actionCallbacks.get(actionId);
    if (callback) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  }, [focusMode]);

  // Register global keydown listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase for priority
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);

  // Provide a way for components to register with the shortcuts modal
  return {
    shortcutsModalRef,
  };
}

// Re-export shortcutManager for direct access in components
export { shortcutManager };
