import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { serialService } from './serialService';

interface ClientSession {
  ws: WebSocket;
  deviceId: string | null;
  userId: string;
  username: string; // [NEW] Track username
  labId: string | null; // [NEW] Track which lab the user is viewing
}

interface WebSocketMessage {
  type: 'connect' | 'disconnect' | 'command' | 'ping' | 'join'; // [NEW] Add 'join' type
  deviceId?: string;
  portPath?: string;
  baudRate?: number;
  command?: string;
  userId?: string;
  username?: string; // [NEW]
  labId?: string; // [NEW]
}

interface OutgoingMessage {
  type: 'connected' | 'disconnected' | 'output' | 'error' | 'pong' | 'ports' | 'presence_update';
  deviceId?: string;
  data?: string;
  error?: string;
  ports?: Array<{ path: string; manufacturer?: string }>;
  users?: Array<{ userId: string; username: string; deviceId: string | null }>; // [NEW] List of connected users
}

class WebSocketTerminalServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ClientSession> = new Map();

  /**
   * Initialize WebSocket server with existing HTTP server
   */
  initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/terminal'
    });

    console.log('[WebSocket] Terminal server initialized on /ws/terminal');

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    // Setup serial service event listeners
    this.setupSerialListeners();
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket): void {
    console.log('[WebSocket] New client connected');

    const session: ClientSession = {
      ws,
      deviceId: null,
      userId: 'anonymous',
      username: 'Anonymous',
      labId: null,
    };

    this.clients.set(ws, session);

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, session, message);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
        this.send(ws, { type: 'error', error: 'Invalid message format' });
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      
      // Disconnect from device if connected
      if (session.deviceId) {
        serialService.closePort(session.deviceId);
      }
      
      this.clients.delete(ws);
      
      // Broadcast update to others in the same lab
      if (session.labId) {
        this.broadcastPresence(session.labId);
      }
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Client error:', error);
    });

    // Send welcome message
    this.send(ws, { 
      type: 'connected', 
      data: 'WebSocket Terminal Server Ready' 
    });
  }

  /**
   * Handle incoming message from client
   */
  private async handleMessage(
    ws: WebSocket, 
    session: ClientSession, 
    message: WebSocketMessage
  ): Promise<void> {
    switch (message.type) {
      case 'join': // [NEW] User joins a lab page
        if (message.labId && message.userId && message.username) {
          session.labId = message.labId;
          session.userId = message.userId;
          session.username = message.username;
          
          // Broadcast presence update to everyone in this lab
          this.broadcastPresence(session.labId);
        }
        break;

      case 'connect':
        if (!message.deviceId || !message.portPath) {
          this.send(ws, { type: 'error', error: 'Missing deviceId or portPath' });
          return;
        }

        session.deviceId = message.deviceId;
        // Update user info if provided (redundant if 'join' was called, but good for safety)
        if (message.userId) session.userId = message.userId;
        if (message.username) session.username = message.username;

        const baudRate = message.baudRate || 9600;
        const connected = await serialService.openPort(
          message.deviceId, 
          message.portPath, 
          baudRate
        );

        if (connected) {
          this.send(ws, { 
            type: 'connected', 
            deviceId: message.deviceId,
            data: `Connected to ${message.portPath} at ${baudRate} baud`
          });
          
          // Broadcast update so others see this user is now using a device
          if (session.labId) {
            this.broadcastPresence(session.labId);
          }
        } else {
          this.send(ws, { 
            type: 'error', 
            deviceId: message.deviceId,
            error: `Failed to connect to ${message.portPath}`
          });
        }
        break;

      case 'disconnect':
        if (session.deviceId) {
          await serialService.closePort(session.deviceId);
          this.send(ws, { 
            type: 'disconnected', 
            deviceId: session.deviceId 
          });
          session.deviceId = null;
          
          // Broadcast update (user released device)
          if (session.labId) {
            this.broadcastPresence(session.labId);
          }
        }
        break;

      case 'command':
        if (!session.deviceId) {
          this.send(ws, { type: 'error', error: 'Not connected to any device' });
          return;
        }

        if (message.command !== undefined) {
          const sent = await serialService.sendData(session.deviceId, message.command);
          if (!sent) {
            this.send(ws, { 
              type: 'error', 
              error: 'Failed to send command' 
            });
          }
        }
        break;

      case 'ping':
        this.send(ws, { type: 'pong' });
        break;

      default:
        this.send(ws, { type: 'error', error: 'Unknown message type' });
    }
  }

  /**
   * Broadcast list of connected users to all clients in a specific lab
   */
  private broadcastPresence(labId: string): void {
    const users: Array<{ userId: string; username: string; deviceId: string | null }> = [];
    
    // Collect all users in this lab
    this.clients.forEach((session) => {
      if (session.labId === labId) {
        users.push({
          userId: session.userId,
          username: session.username,
          deviceId: session.deviceId
        });
      }
    });

    // Send to all clients in this lab
    this.clients.forEach((session, ws) => {
      if (session.labId === labId) {
        this.send(ws, {
          type: 'presence_update',
          users: users
        });
      }
    });
  }

  /**
   * Setup SerialPort event listeners to forward data to WebSocket clients
   */
  private setupSerialListeners(): void {
    // Forward serial data to connected clients
    serialService.on('rawData', ({ deviceId, data }) => {
      this.broadcastToDevice(deviceId, {
        type: 'output',
        deviceId,
        data,
      });
    });

    // Forward serial errors
    serialService.on('error', ({ deviceId, error }) => {
      this.broadcastToDevice(deviceId, {
        type: 'error',
        deviceId,
        error,
      });
    });

    // Forward connection close events
    serialService.on('close', ({ deviceId }) => {
      this.broadcastToDevice(deviceId, {
        type: 'disconnected',
        deviceId,
      });
    });
  }

  /**
   * Send message to specific WebSocket client
   */
  private send(ws: WebSocket, message: OutgoingMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all clients connected to a specific device
   */
  private broadcastToDevice(deviceId: string, message: OutgoingMessage): void {
    this.clients.forEach((session, ws) => {
      if (session.deviceId === deviceId) {
        this.send(ws, message);
      }
    });
  }

  /**
   * Get list of available serial ports via WebSocket
   */
  async getAvailablePorts(): Promise<Array<{ path: string; manufacturer?: string }>> {
    const ports = await serialService.listPorts();
    return ports.map(p => ({ path: p.path, manufacturer: p.manufacturer }));
  }

  /**
   * Close all connections and shutdown
   */
  async shutdown(): Promise<void> {
    await serialService.closeAll();
    
    this.clients.forEach((_, ws) => {
      ws.close();
    });
    
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const wsTerminalServer = new WebSocketTerminalServer();
export default wsTerminalServer;
