// MindGuard Desktop — Web App Integration Hook
// Detects if running inside Electron, provides desktop status and real-time updates

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import type { DesktopStatus } from '@/types';

interface DesktopIntegration {
  isElectron: boolean;
  status: DesktopStatus | null;
  isConnected: boolean;
  sendAuthToken: (token: string) => Promise<boolean>;
  navigate: (view: string) => void;
}

// Check if running in Electron — lazy initializer avoids setState in effect
// Must be SSR-safe: window is undefined during server rendering
const getIsElectron = () => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any)?.mindguardDesktop?.isElectron);
};

export function useDesktopIntegration(): DesktopIntegration {
  const { setDesktopStatus } = useAppStore();
  const [isElectron] = useState(getIsElectron);
  const [status, setStatus] = useState<DesktopStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const removeListenersRef = useRef<(() => void)[]>([]);

  // Register navigate listener when in Electron
  useEffect(() => {
    if (!isElectron) return;

    const desktop = (window as any).mindguardDesktop;

    // Listen for navigation commands from tray/IPC
    const removeNavigate = desktop?.onNavigate?.((view: string) => {
      // Navigate via Zustand store
      useAppStore.getState().setView(view);
    });

    // Listen for activity updates from tracker
    const removeActivity = desktop?.onActivityUpdate?.((data: any) => {
      // Update desktop status in store
      const currentStatus = useAppStore.getState().desktopStatus;
      if (currentStatus) {
        setDesktopStatus({
          ...currentStatus,
          currentApp: data.app || currentStatus.currentApp,
          currentWebsite: data.website || currentStatus.currentWebsite,
          currentActivityType: data.type || currentStatus.currentActivityType,
        });
      }
    });

    // Listen for timer sync commands
    const removeTimer = desktop?.onTimerSync?.((state: any) => {
      // Update timer state from desktop
      // This syncs the web timer with desktop timer
    });

    // Listen for focus protection changes
    const removeFocus = desktop?.onFocusProtectionChange?.((data: any) => {
      // Update focus protection state
    });

    // Listen for notifications from desktop
    const removeNotification = desktop?.onNotification?.((data: any) => {
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

    const desktop = (window as any).mindguardDesktop;
    if (!desktop?.getStatus) return;

    const pollStatus = async () => {
      try {
        const statusResult = await desktop.getStatus();
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
    const desktop = (window as any).mindguardDesktop;
    if (!desktop?.sendAuthToken) return false;
    return desktop.sendAuthToken(token);
  }, [isElectron]);

  const navigate = useCallback((view: string) => {
    useAppStore.getState().setView(view);
  }, []);

  return {
    isElectron,
    status,
    isConnected,
    sendAuthToken,
    navigate,
  };
}
