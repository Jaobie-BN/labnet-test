import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import routes from './routes';
import { wsTerminalServer } from './services/websocketServer';
import { serialService } from './services/serialService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server for both Express and WebSocket
const server = createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  res.send('Network Lab Backend is running!');
});

// API endpoint to list available serial ports
app.get('/api/devices/ports', async (req: Request, res: Response) => {
  try {
    const ports = await serialService.listPorts();
    res.json({ 
      success: true, 
      ports: ports.map(p => ({
        path: p.path,
        manufacturer: p.manufacturer,
        serialNumber: p.serialNumber
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to list ports' });
  }
});

// Initialize WebSocket server
wsTerminalServer.initialize(server);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing connections...');
  await wsTerminalServer.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing connections...');
  await wsTerminalServer.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Use server.listen instead of app.listen for WebSocket support
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`WebSocket Terminal available at ws://localhost:${port}/ws/terminal`);
});
