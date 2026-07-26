// MindGuard Desktop WebSocket Service
// Real-time communication hub between desktop companion and web app
// Port: 3003 (configured in Caddyfile)

import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3003;

interface ClientInfo {
  ws: WebSocket;
  userId: string | null;
  isDesktop: boolean;
  connectedAt: Date;
  lastActivityAt: Date;
}

const clients: Map<string, ClientInfo> = new Map();
let clientCounter = 0;

const wss = new WebSocketServer({ port: PORT });

console.log(`[MindGuard WS] WebSocket service started on port ${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  const clientId = `client_${++clientCounter}`;
  const clientInfo: ClientInfo = {
    ws,
    userId: null,
    isDesktop: false,
    connectedAt: new Date(),
    lastActivityAt: new Date(),
  };

  clients.set(clientId, clientInfo);
  console.log(`[MindGuard WS] Client connected: ${clientId} (total: ${clients.size})`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    payload: { clientId },
    timestamp: new Date().toISOString(),
  }));

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      clientInfo.lastActivityAt = new Date();

      switch (msg.type) {
        case 'auth_request': {
          // Desktop companion sends auth token
          const { token, userId, isDesktop } = msg.payload || {};
          clientInfo.userId = userId || null;
          clientInfo.isDesktop = isDesktop || false;
          console.log(`[MindGuard WS] Auth received: ${clientId} (user: ${userId}, desktop: ${isDesktop})`);
          ws.send(JSON.stringify({
            type: 'connected',
            payload: { clientId, authenticated: true },
            timestamp: new Date().toISOString(),
          }));
          break;
        }

        case 'activity_update': {
          // Desktop sends activity data → broadcast to matching web clients
          const { userId } = msg.payload || {};
          if (userId) {
            broadcastToUserClients(userId, msg, clientId);
          }
          break;
        }

        case 'timer_command': {
          // Web app sends timer command → forward to matching desktop client
          const { userId } = msg.payload || {};
          if (userId) {
            broadcastToDesktopClients(userId, msg, clientId);
          }
          break;
        }

        case 'settings_sync': {
          // Settings change → broadcast to all matching clients
          const { userId } = msg.payload || {};
          if (userId) {
            broadcastToUserClients(userId, msg, clientId);
            broadcastToDesktopClients(userId, msg, clientId);
          }
          break;
        }

        case 'notification_trigger': {
          // Notification → forward to matching desktop client
          const { userId } = msg.payload || {};
          if (userId) {
            broadcastToDesktopClients(userId, msg, clientId);
          }
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({
            type: 'pong',
            payload: {},
            timestamp: new Date().toISOString(),
          }));
          break;
        }

        default: {
          console.log(`[MindGuard WS] Unknown message type: ${msg.type}`);
        }
      }
    } catch (err) {
      console.error(`[MindGuard WS] Message parse error: ${String(err)}`);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`[MindGuard WS] Client disconnected: ${clientId} (total: ${clients.size})`);
  });

  ws.on('error', (err: Error) => {
    console.error(`[MindGuard WS] Client error: ${String(err)}`);
    clients.delete(clientId);
  });
});

// Broadcast activity updates to all web clients for a user
function broadcastToUserClients(userId: string, msg: Record<string, unknown>, excludeClientId: string): void {
  for (const [id, client] of clients) {
    if (id !== excludeClientId && client.userId === userId && !client.isDesktop && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(msg));
    }
  }
}

// Broadcast to all desktop clients for a user
function broadcastToDesktopClients(userId: string, msg: Record<string, unknown>, excludeClientId: string): void {
  for (const [id, client] of clients) {
    if (id !== excludeClientId && client.userId === userId && client.isDesktop && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(msg));
    }
  }
}

// Health check endpoint for monitoring
function startHealthCheck(): void {
  setInterval(() => {
    const desktopCount = Array.from(clients.values()).filter(c => c.isDesktop).length;
    const webCount = Array.from(clients.values()).filter(c => !c.isDesktop).length;
    console.log(`[MindGuard WS] Health: ${clients.size} total clients (${desktopCount} desktop, ${webCount} web)`);
  }, 30000);
}

startHealthCheck();

// Handle process termination
process.on('SIGINT', () => {
  console.log('[MindGuard WS] Shutting down...');
  wss.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[MindGuard WS] Shutting down...');
  wss.close();
  process.exit(0);
});
