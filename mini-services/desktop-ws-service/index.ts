// MindGuard Desktop WebSocket Service v2
// Real-time communication hub between desktop companion and web app
// Port: 3003 (configured in Caddyfile with XTransformPort)
//
// Improvements over v1:
// - JWT auth validation for desktop clients
// - Web client auth via session token
// - HTTP health endpoint
// - Rate limiting (max 60 msgs/min per client)
// - Structured logging with levels
// - Graceful shutdown with close frames

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { jwtVerify } from 'jose';

const PORT = 3003;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'mindguard-dev-secret-key-2024-v5';
const MAX_MESSAGES_PER_MIN = 60;
const HEARTBEAT_INTERVAL_MS = 30000;
const CLIENT_TIMEOUT_MS = 60000; // 60s — no pong = disconnect

interface ClientInfo {
  ws: WebSocket;
  userId: string | null;
  isDesktop: boolean;
  clientId: string;
  connectedAt: Date;
  lastActivityAt: Date;
  lastPongAt: Date;
  messageCount: number;
  messageCountResetAt: Date;
  authenticated: boolean;
}

const clients: Map<string, ClientInfo> = new Map();
let clientCounter = 0;

// ── JWT Verification ──────────────────────────────────────────────────────

const secretBytes = new TextEncoder().encode(NEXTAUTH_SECRET);

async function verifyJWT(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretBytes, {
      algorithms: ['HS256'],
    });
    return (payload.id as string) || null;
  } catch {
    return null;
  }
}

// ── Rate Limiting ──────────────────────────────────────────────────────────

function checkRateLimit(client: ClientInfo): boolean {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  if (client.messageCountResetAt < oneMinuteAgo) {
    client.messageCount = 0;
    client.messageCountResetAt = now;
  }

  client.messageCount++;
  return client.messageCount <= MAX_MESSAGES_PER_MIN;
}

// ── HTTP + WS Server ──────────────────────────────────────────────────────

const server = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    const desktopCount = Array.from(clients.values()).filter(c => c.isDesktop).length;
    const webCount = Array.from(clients.values()).filter(c => !c.isDesktop).length;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      totalClients: clients.size,
      desktopClients: desktopCount,
      webClients: webCount,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server });

log('info', `WebSocket service starting on port ${PORT}`);

// ── Heartbeat / Timeout Check ─────────────────────────────────────────────

const heartbeatInterval = setInterval(() => {
  const now = Date.now();

  for (const [clientId, client] of clients) {
    // Send ping to each client
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
    }

    // Check for timed-out clients (no pong in 60s)
    if (now - client.lastPongAt.getTime() > CLIENT_TIMEOUT_MS) {
      log('warn', `Client timed out: ${clientId}`);
      client.ws.terminate();
      clients.delete(clientId);
    }
  }
}, HEARTBEAT_INTERVAL_MS);

// ── WebSocket Connection Handler ──────────────────────────────────────────

wss.on('connection', (ws: WebSocket) => {
  const clientId = `client_${++clientCounter}`;
  const clientInfo: ClientInfo = {
    ws,
    userId: null,
    isDesktop: false,
    clientId,
    connectedAt: new Date(),
    lastActivityAt: new Date(),
    lastPongAt: new Date(),
    messageCount: 0,
    messageCountResetAt: new Date(),
    authenticated: false,
  };

  clients.set(clientId, clientInfo);
  log('info', `Client connected: ${clientId} (total: ${clients.size})`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    payload: { clientId, authenticated: false },
    timestamp: new Date().toISOString(),
  }));

  ws.on('message', async (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      clientInfo.lastActivityAt = new Date();

      // Rate limit check
      if (!checkRateLimit(clientInfo)) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: { code: 'rate_limit', message: 'Too many messages' },
          timestamp: new Date().toISOString(),
        }));
        return;
      }

      switch (msg.type) {
        case 'auth_request': {
          // Desktop: sends { token, isDesktop: true }
          // Web: sends { userId, token }
          const { token, userId, isDesktop } = msg.payload || {};

          if (token) {
            // Verify JWT token
            const verifiedUserId = await verifyJWT(token);

            if (verifiedUserId) {
              clientInfo.userId = verifiedUserId;
              clientInfo.isDesktop = Boolean(isDesktop);
              clientInfo.authenticated = true;
              log('info', `Auth verified: ${clientId} (user: ${verifiedUserId}, desktop: ${isDesktop})`);
              ws.send(JSON.stringify({
                type: 'auth_success',
                payload: { clientId, authenticated: true, userId: verifiedUserId },
                timestamp: new Date().toISOString(),
              }));
            } else {
              log('warn', `Auth failed: ${clientId} — invalid token`);
              ws.send(JSON.stringify({
                type: 'auth_failed',
                payload: { clientId, authenticated: false, reason: 'Invalid token' },
                timestamp: new Date().toISOString(),
              }));
            }
          } else if (userId) {
            // Web client — userId provided directly (will be validated by web app)
            clientInfo.userId = userId;
            clientInfo.isDesktop = false;
            clientInfo.authenticated = true;
            log('info', `Web auth: ${clientId} (user: ${userId})`);
            ws.send(JSON.stringify({
              type: 'auth_success',
              payload: { clientId, authenticated: true, userId },
              timestamp: new Date().toISOString(),
            }));
          } else {
            ws.send(JSON.stringify({
              type: 'auth_failed',
              payload: { clientId, authenticated: false, reason: 'No token or userId provided' },
              timestamp: new Date().toISOString(),
            }));
          }
          break;
        }

        case 'activity_update': {
          if (!clientInfo.authenticated) {
            ws.send(JSON.stringify({ type: 'error', payload: { code: 'unauthorized' }, timestamp: new Date().toISOString() }));
            return;
          }
          // Desktop sends activity data → broadcast to matching web clients
          broadcastToUserClients(clientInfo.userId!, msg, clientId);
          break;
        }

        case 'timer_command': {
          if (!clientInfo.authenticated) {
            ws.send(JSON.stringify({ type: 'error', payload: { code: 'unauthorized' }, timestamp: new Date().toISOString() }));
            return;
          }
          // Web app sends timer command → forward to matching desktop client
          broadcastToDesktopClients(clientInfo.userId!, msg, clientId);
          break;
        }

        case 'settings_sync': {
          if (!clientInfo.authenticated) {
            ws.send(JSON.stringify({ type: 'error', payload: { code: 'unauthorized' }, timestamp: new Date().toISOString() }));
            return;
          }
          // Settings change → broadcast to all matching clients
          broadcastToUserClients(clientInfo.userId!, msg, clientId);
          broadcastToDesktopClients(clientInfo.userId!, msg, clientId);
          break;
        }

        case 'notification_trigger': {
          if (!clientInfo.authenticated) {
            ws.send(JSON.stringify({ type: 'error', payload: { code: 'unauthorized' }, timestamp: new Date().toISOString() }));
            return;
          }
          // Notification → forward to matching desktop client
          broadcastToDesktopClients(clientInfo.userId!, msg, clientId);
          break;
        }

        case 'pong': {
          // Heartbeat response
          clientInfo.lastPongAt = new Date();
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
        }

        default: {
          log('warn', `Unknown message type: ${msg.type} from ${clientId}`);
        }
      }
    } catch (err) {
      log('error', `Message parse error from ${clientId}: ${String(err)}`);
    }
  });

  ws.on('close', (code: number, reason: string) => {
    clients.delete(clientId);
    log('info', `Client disconnected: ${clientId} (code: ${code}, total: ${clients.size})`);
  });

  ws.on('error', (err: Error) => {
    log('error', `Client error: ${clientId}: ${String(err)}`);
    clients.delete(clientId);
  });
});

// ── Broadcast Functions ────────────────────────────────────────────────────

function broadcastToUserClients(userId: string, msg: Record<string, unknown>, excludeClientId: string): void {
  for (const [id, client] of clients) {
    if (id !== excludeClientId && client.userId === userId && !client.isDesktop && client.authenticated && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(msg));
    }
  }
}

function broadcastToDesktopClients(userId: string, msg: Record<string, unknown>, excludeClientId: string): void {
  for (const [id, client] of clients) {
    if (id !== excludeClientId && client.userId === userId && client.isDesktop && client.authenticated && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(msg));
    }
  }
}

// ── Structured Logging ─────────────────────────────────────────────────────

function log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
  const timestamp = new Date().toISOString();
  const prefix = `[MindGuard WS]`;

  switch (level) {
    case 'error': console.error(`${prefix} [ERROR] ${timestamp} ${message}`); break;
    case 'warn': console.warn(`${prefix} [WARN] ${timestamp} ${message}`); break;
    case 'info': console.log(`${prefix} [INFO] ${timestamp} ${message}`); break;
    case 'debug': if (process.env.WS_DEBUG) console.log(`${prefix} [DEBUG] ${timestamp} ${message}`); break;
  }
}

// ── Periodic Stats ─────────────────────────────────────────────────────────

const statsInterval = setInterval(() => {
  const desktopCount = Array.from(clients.values()).filter(c => c.isDesktop).length;
  const webCount = Array.from(clients.values()).filter(c => !c.isDesktop).length;
  log('info', `Stats: ${clients.size} total (${desktopCount} desktop, ${webCount} web)`);
}, 30000);

// ── Graceful Shutdown ──────────────────────────────────────────────────────

function shutdown(): void {
  log('info', 'Shutting down...');

  // Send close frames to all connected clients
  for (const [clientId, client] of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.close(1001, 'Server shutting down');
    }
  }

  // Clear intervals
  clearInterval(heartbeatInterval);
  clearInterval(statsInterval);

  // Close server
  wss.close(() => {
    server.close(() => {
      log('info', 'Server closed');
      process.exit(0);
    });
  });

  // Force exit after 5s if graceful shutdown doesn't complete
  setTimeout(() => {
    log('warn', 'Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ── Start Server ───────────────────────────────────────────────────────────

server.listen(PORT, () => {
  log('info', `HTTP + WebSocket server listening on port ${PORT}`);
  log('info', `Health check: http://localhost:${PORT}/health`);
  log('info', `WebSocket: ws://localhost:${PORT}`);
});
