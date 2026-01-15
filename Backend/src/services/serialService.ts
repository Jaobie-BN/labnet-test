import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { EventEmitter } from 'events';

export interface SerialConnection {
  port: SerialPort;
  parser: ReadlineParser;
  deviceId: string;
  portPath: string;
  baudRate: number;
}

export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

class SerialService extends EventEmitter {
  private connections: Map<string, SerialConnection> = new Map();

  constructor() {
    super();
  }

  /**
   * List all available serial ports
   */
  async listPorts(): Promise<SerialPortInfo[]> {
    try {
      const ports = await SerialPort.list();
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        locationId: port.locationId,
        vendorId: port.vendorId,
        productId: port.productId,
      }));
    } catch (error) {
      console.error('[SerialService] Failed to list ports:', error);
      return [];
    }
  }

  /**
   * Open a serial port connection for a device
   */
  async openPort(deviceId: string, portPath: string, baudRate: number = 9600): Promise<boolean> {
    // Close existing connection if any
    if (this.connections.has(deviceId)) {
      await this.closePort(deviceId);
    }

    return new Promise((resolve) => {
      try {
        const port = new SerialPort({
          path: portPath,
          baudRate: baudRate,
          dataBits: 8,
          parity: 'none',
          stopBits: 1,
          autoOpen: false,
        });

        const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        // Handle port open
        port.open((err) => {
          if (err) {
            console.error(`[SerialService] Failed to open ${portPath}:`, err.message);
            this.emit('error', { deviceId, error: err.message });
            resolve(false);
            return;
          }

          console.log(`[SerialService] Port opened: ${portPath} for device: ${deviceId}`);
          
          const connection: SerialConnection = {
            port,
            parser,
            deviceId,
            portPath,
            baudRate,
          };

          this.connections.set(deviceId, connection);

          // Emit connection open event
          this.emit('open', { deviceId, portPath });
          resolve(true);
        });

        // Handle incoming data
        parser.on('data', (data: string) => {
          this.emit('data', { deviceId, data });
        });

        // Handle raw data (for binary/special characters)
        port.on('data', (buffer: Buffer) => {
          this.emit('rawData', { deviceId, data: buffer.toString('utf8') });
        });

        // Handle port errors
        port.on('error', (err) => {
          console.error(`[SerialService] Port error on ${portPath}:`, err.message);
          this.emit('error', { deviceId, error: err.message });
        });

        // Handle port close
        port.on('close', () => {
          console.log(`[SerialService] Port closed: ${portPath}`);
          this.connections.delete(deviceId);
          this.emit('close', { deviceId });
        });

      } catch (error) {
        console.error(`[SerialService] Exception opening port:`, error);
        resolve(false);
      }
    });
  }

  /**
   * Close a serial port connection
   */
  async closePort(deviceId: string): Promise<void> {
    const connection = this.connections.get(deviceId);
    if (!connection) {
      return;
    }

    return new Promise((resolve) => {
      connection.port.close((err) => {
        if (err) {
          console.error(`[SerialService] Error closing port:`, err.message);
        }
        this.connections.delete(deviceId);
        resolve();
      });
    });
  }

  /**
   * Send data to a device
   */
  async sendData(deviceId: string, data: string): Promise<boolean> {
    const connection = this.connections.get(deviceId);
    if (!connection) {
      console.error(`[SerialService] No connection for device: ${deviceId}`);
      return false;
    }

    return new Promise((resolve) => {
      // Append carriage return for Cisco devices
      const dataToSend = data.endsWith('\r') ? data : data + '\r';
      
      connection.port.write(dataToSend, (err) => {
        if (err) {
          console.error(`[SerialService] Write error:`, err.message);
          resolve(false);
          return;
        }
        
        connection.port.drain((drainErr) => {
          if (drainErr) {
            console.error(`[SerialService] Drain error:`, drainErr.message);
          }
          resolve(true);
        });
      });
    });
  }

  /**
   * Check if a device is connected
   */
  isConnected(deviceId: string): boolean {
    const connection = this.connections.get(deviceId);
    return connection?.port.isOpen ?? false;
  }

  /**
   * Get all active connections
   */
  getActiveConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.connections.keys()).map(id => 
      this.closePort(id)
    );
    await Promise.all(closePromises);
  }
}

// Export singleton instance
export const serialService = new SerialService();
export default serialService;
