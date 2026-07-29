// MindGuard Desktop — Web App Integration Hook
// Detects if running inside Electron, provides desktop status and real-time updates

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import type { AppView, DesktopStatus, ActivityType } from '@/types';

interface DesktopIntegration {
  isElectron: boolean;
  status: DesktopStatus | null;
  isConnected: boolean;
  sendAuthToken: (token: string) => Promise<boolean>;
  navigate: (view: string) => void;
}

// Extended window type for desktop companion integration
interface MindGuardDesktop {
  isElectron?: boolean;
  onNavigate?: (cb: (view: string) => void) => () => void;
  onActivityUpdate?: (cb: (data: Record<string, unknown>) => void) => () => void;
  onTimerSync?: (cb: (state: Record<string, unknown>) => void) => () => void;
  onFocusProtectionChange?: (cb: (data: Record<string, unknown>) => void) => () => void;
  onNotification?: (cb: (data: Record<string, unknown>) => void) => () => void;
  getStatus?: () => Promise<DesktopStatus | null>;
  sendAuthToken?: (token: string) => Promise<boolean>;
}

type ExtendedWindow = Window & { mindguardDesktop?: MindGuardDesktop };

// Check if running in Electron — lazy initializer avoids setState in effect
// Must be SSR-safe: window is undefined during server rendering
const getIsElectron = () => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as ExtendedWindow)?.mindguardDesktop?.isElectron);
};

function getDesktop(): MindGuardDesktop | undefined {
  return (window as ExtendedWindow).mindguardDesktop;
}

export function useDesktopIntegration(): DesktopIntegration {
  const { setDesktopStatus } = useAppStore();
  const [isElectron] = useState(getIsElectron);
  const [status, setStatus] = useState<DesktopStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const removeListenersRef = useRef<(() => void)[]>([]);

  // Register navigate listener when in Electron
  useEffect(() => {
    if (!isElectron) return;

    const desktop = getDesktop();

    // Listen for navigation commands from tray/IPC
    const removeNavigate = desktop?.onNavigate?.((view: string) => {
      // Navigate via Zustand store
      useAppStore.getState().setView(view as AppView);
    });

    // Listen for activity updates from tracker
    const removeActivity = desktop?.onActivityUpdate?.((data: Record<string, unknown>) => {
      // Update desktop status in store
      const currentStatus = useAppStore.getState().desktopStatus;
      if (currentStatus) {
        setDesktopStatus({
          ...currentStatus,
          currentApp: (data.app as string) || currentStatus.currentApp,
          currentWebsite: (data.website as string) || currentStatus.currentWebsite,
          currentActivityType: (data.type as ActivityType | undefined) || currentStatus.currentActivityType,
        });
      }
    });

    // Listen for timer sync commands
    const removeTimer = desktop?.onTimerSync?.((_state: Record<string, unknown>) => {
      // Update timer state from desktop
      // This syncs the web timer with desktop timer
    });

    // Listen for focus protection changes
    const removeFocus = desktop?.onFocusProtectionChange?.((_data: Record<string, unknown>) => {
      // Update focus protection state
    });

    // Listen for notifications from desktop
    const removeNotification = desktop?.onNotification?.((_data: Record<string, unknown>) => {
      // Show in-app notification
    });

    removeListenersRef.current = [
      removeNavigate || (() => {}),
      removeActivity || (() => {}),
      removeTimer || (() => {}),
      removeFocus || (() => {}),
      removeNotification || (() => {}),
    ];

    return () => {
      // Clean up all listeners
      removeListenersRef.current.forEach(remove => remove());
      removeListenersRef.current = [];
    };
  }, [isElectron, setDesktopStatus]);

  // Poll desktop status periodically
  useEffect(() => {
    if (!isElectron) return;

    const desktop = getDesktop();
    if (!desktop?.getStatus) return;

    const pollStatus = async () => {
      try {
        const statusResult = await desktop.getStatus!();
        if (statusResult) {
          setStatus(statusResult);
          setIsConnected(statusResult.connected);
          setDesktopStatus(statusResult);
        }
      } catch {
        setIsConnected(false);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [isElectron, setDesktopStatus]);

  const sendAuthToken = useCallback(async (token: string): Promise<boolean> => {
    if (!isElectron) return false;
    const desktop = getDesktop();
    if (!desktop?.sendAuthToken) return false;
    return desktop.sendAuthToken!(token);
  }, [isElectron]);

  const navigate = useCallback((view: string) => {
    useAppStore.getState().setView(view as AppView);
  }, []);

  return {
    isElectron,
    status,
    isConnected,
    sendAuthToken,
    navigate,
  };
}
