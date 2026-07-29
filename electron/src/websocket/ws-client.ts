// MindGuard Desktop — WebSocket Client
// Real-time communication with MindGuard web app via WebSocket mini-service

import type { WSMessage } from '../types';
import { logger } from '../logger/logger';
import { isoNow } from '../utils/formatters';
import WebSocket from 'ws';

const RECONNECT_INTERVAL_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 30000;

export class WSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private authToken: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private isConnected = false;
  private messageQueue: string[] = [];
  private onMessage: ((msg: WSMessage) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  setMessageHandler(handler: (msg: WSMessage) => void): void {
    this.onMessage = handler;
  }

  connect(): void {
    if (this.isConnected) return;

    logger.info('WSClient', 'Connecting to WebSocket', { url: this.url });

    try {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        this.isConnected = true;
        logger.info('WSClient', 'WebSocket connected');

        // Send auth message
        if (this.authToken) {
          this.send({
            type: 'auth_request',
            payload: { token: this.authToken },
            timestamp: isoNow(),
          });
        }

        // Flush queued messages
        this.flushMessageQueue();

        // Start heartbeat
        this.startHeartbeat();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const msg = JSON.parse(data.toString()) as WSMessage;
          logger.debug('WSClient', 'Message received', { type: msg.type });

          if (this.onMessage) {
            this.onMessage(msg);
          }
        } catch (err) {
          logger.warn('WSClient', 'Failed to parse message', { error: String(err) });
        }
      });

      this.ws.on('close', (code: number, reason: string) => {
        this.isConnected = false;
        this.stopHeartbeat();
        logger.info('WSClient', 'WebSocket closed', { code, reason });
        this.scheduleReconnect();
      });

      this.ws.on('error', (err: Error) => {
        logger.error('WSClient', 'WebSocket error', { error: String(err) });
      });

    } catch (err) {
      logger.error('WSClient', 'WebSocket connection failed', { error: String(err) });
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.cancelReconnect();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    logger.info('WSClient', 'WebSocket disconnected');
  }

  send(msg: WSMessage): void {
    const serialized = JSON.stringify(msg);

    if (this.isConnected && this.ws) {
      try {
        this.ws.send(serialized);
      } catch (err) {
        logger.warn('WSClient', 'Failed to send message', { error: String(err) });
        this.messageQueue.push(serialized);
      }
    } else {
      // Queue for later
      this.messageQueue.push(serialized);
    }
  }

  sendActivityUpdate(activity: Record<string, unknown>): void {
    this.send({
      type: 'activity_update',
      payload: activity,
      timestamp: isoNow(),
    });
  }

  sendTimerState(timerState: Record<string, unknown>): void {
    this.send({
      type: 'timer_command',
      payload: timerState,
      timestamp: isoNow(),
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({
        type: 'ping',
        payload: {},
        timestamp: isoNow(),
      });
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return; // Already scheduled

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_INTERVAL_MS);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected && this.ws) {
      const msg = this.messageQueue.shift();
      if (msg) {
        try {
          this.ws.send(msg);
        } catch {
          this.messageQueue.unshift(msg);
          break;
        }
      }
    }
  }

  getStatus(): { connected: boolean; queueSize: number } {
    return {
      connected: this.isConnected,
      queueSize: this.messageQueue.length,
    };
  }
}
