// MindGuard — Web-side WebSocket Client Hook
// Connects to the desktop-ws-service and receives live updates from the desktop tracker.
// Updates the Zustand store in real-time.

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/stores/app-store';
import type { ActivityType } from '@/types';

interface WSMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

interface ActivityUpdatePayload {
  userId: string;
  app?: string;
  website?: string;
  type?: string;
  category?: string;
  duration?: number;
  focusState?: string;
  idleMinutes?: number;
  title?: string;
}

interface TimerCommandPayload {
  userId: string;
  action: 'start' | 'pause' | 'stop' | 'resume' | 'complete';
  duration?: number;
  missionId?: string;
  missionTitle?: string;
}

const RECONNECT_INTERVAL_MS = 5000;
const WS_PORT = 3003;

export function useWebsocketSync() {
  const { data: session, status } = useSession();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isConnectedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  // Store actions — use refs to avoid dependency issues
  const setDesktopStatusRef = useRef(useAppStore.getState().setDesktopStatus);
  const setDesktopSettingsRef = useRef(useAppStore.getState().setDesktopSettings);
  const desktopStatusRef = useRef(useAppStore.getState().desktopStatus);

  // Keep refs updated
  useEffect(() => {
    setDesktopStatusRef.current = useAppStore.getState().setDesktopStatus;
    setDesktopSettingsRef.current = useAppStore.getState().setDesktopSettings;
  });

  // Subscribe to desktopStatus changes via ref
  useEffect(() => {
    const unsub = useAppStore.subscribe(
      (s) => { desktopStatusRef.current = s.desktopStatus; }
    );
    return unsub;
  }, []);

  // Track userId for auth
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as Record<string, unknown>;
      userIdRef.current = user.id as string;
    } else {
      userIdRef.current = null;
    }
  }, [status, session]);

  const handleMessage = useCallback((msg: WSMessage) => {
    const desktopStatus = desktopStatusRef.current;
    const setDesktopStatus = setDesktopStatusRef.current;

    switch (msg.type) {
      case 'activity_update': {
        const payload = msg.payload as ActivityUpdatePayload;

        if (desktopStatus) {
          setDesktopStatus({
            ...desktopStatus,
            connected: true,
            currentApp: payload.app || desktopStatus.currentApp,
            currentWebsite: payload.website || desktopStatus.currentWebsite,
            currentActivityType: (payload.type as ActivityType | undefined) || desktopStatus.currentActivityType,
            idleMinutes: payload.idleMinutes ?? desktopStatus.idleMinutes,
            lastActivityAt: msg.timestamp,
            focusState: payload.focusState || desktopStatus.focusState || 'idle',
          });
        } else {
          setDesktopStatus({
            connected: true,
            trackingEnabled: true,
            currentApp: payload.app || null,
            currentWebsite: payload.website || null,
            currentActivityType: (payload.type as ActivityType | undefined) || null,
            idleMinutes: payload.idleMinutes ?? 0,
            lastActivityAt: msg.timestamp,
            focusState: payload.focusState || 'idle',
            syncStatus: { status: 'idle', pendingCount: 0, failedCount: 0, lastSyncAt: null, lastError: null },
          });
        }
        break;
      }

      case 'timer_command': {
        const payload = msg.payload as TimerCommandPayload;
        console.log('[WS] Timer command:', payload.action);
        break;
      }

      case 'settings_sync': {
        fetch('/api/desktop/settings')
          .then(r => r.json())
          .then(data => setDesktopSettingsRef.current(data))
          .catch(() => {});
        break;
      }

      case 'notification_trigger': {
        const payload = msg.payload as { type: string; title: string; body: string };
        console.log('[WS] Notification:', payload.title);
        break;
      }

      case 'auth_success': {
        isConnectedRef.current = true;
        console.log('[WS] Authenticated');
        break;
      }

      case 'auth_failed': {
        isConnectedRef.current = false;
        console.warn('[WS] Auth failed');
        break;
      }

      case 'pong': {
        break;
      }
    }
  }, []);

  // Connect function — uses refs to avoid circular dependency
  const connect = useCallback(() => {
    if (!userIdRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    // Use XTransformPort pattern for Caddy proxy
    const wsUrl = `ws://${window.location.host}/?XTransformPort=${WS_PORT}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Connected to desktop sync service');
        isConnectedRef.current = true;

        // Send auth with userId
        ws.send(JSON.stringify({
          type: 'auth_request',
          payload: { userId: userIdRef.current },
          timestamp: new Date().toISOString(),
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSMessage;
          handleMessage(msg);
        } catch (err) {
          console.warn('[WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        isConnectedRef.current = false;
        console.log('[WS] Disconnected');
        // Schedule reconnect
        if (mountedRef.current) {
          scheduleReconnect();
        }
      };

      ws.onerror = () => {
        isConnectedRef.current = false;
      };

      wsRef.current = ws;
    } catch (err) {
      console.warn('[WS] Connection failed:', err);
      if (mountedRef.current) {
        scheduleReconnect();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- scheduleReconnect uses refs only, stable identity
  }, [handleMessage]);

  // Schedule reconnect — uses refs to avoid circular dependency
  function scheduleReconnect() {
    if (reconnectTimerRef.current) return;
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connect();
    }, RECONNECT_INTERVAL_MS);
  }

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    isConnectedRef.current = false;
  }, []);

  // Connect when authenticated, disconnect when not
  useEffect(() => {
    mountedRef.current = true;

    if (status === 'authenticated' && userIdRef.current) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [status, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    disconnect,
    reconnect: connect,
  };
}
