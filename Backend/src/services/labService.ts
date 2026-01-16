import db from '../database/db';

export interface Device {
  id: string;
  labId: string;
  name: string;
  type: 'ROUTER' | 'SWITCH' | 'PC';
  status: 'AVAILABLE' | 'UNAVAILABLE';
  serialPort?: string;
  baudRate?: number;
  connectedUsers?: { id: string; name: string; email: string }[];
}

export interface Lab {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  devices: Device[];
}

export interface SystemStats {
  activeUsers: number;
  totalUsers: number;
  availableLabs: number;
  unavailableLabs: number;
}

// Get connected users for a device
const getDeviceConnections = (deviceId: string): { id: string; name: string; email: string }[] => {
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.email
    FROM device_connections dc
    JOIN users u ON dc.user_id = u.id
    WHERE dc.device_id = ?
  `);
  return stmt.all(deviceId) as { id: string; name: string; email: string }[];
};

// Convert DB device to API device
const mapDevice = (dbDevice: any): Device => ({
  id: dbDevice.id,
  labId: dbDevice.lab_id,
  name: dbDevice.name,
  type: dbDevice.type,
  status: dbDevice.status,
  serialPort: dbDevice.serial_port,
  baudRate: dbDevice.baud_rate,
  connectedUsers: getDeviceConnections(dbDevice.id)
});

// Get all labs with devices
export const getAllLabs = (): Lab[] => {
  const labsStmt = db.prepare('SELECT * FROM labs ORDER BY name');
  const devicesStmt = db.prepare('SELECT * FROM devices WHERE lab_id = ? ORDER BY name');
  
  const labs = labsStmt.all() as any[];
  
  return labs.map(lab => {
    const devices = devicesStmt.all(lab.id) as any[];
    return {
      id: lab.id,
      name: lab.name,
      status: lab.status,
      devices: devices.map(mapDevice)
    };
  });
};

// Get lab by ID
export const getLabById = (id: string): Lab | undefined => {
  const labStmt = db.prepare('SELECT * FROM labs WHERE id = ?');
  const lab = labStmt.get(id) as any;
  
  if (!lab) return undefined;
  
  const devicesStmt = db.prepare('SELECT * FROM devices WHERE lab_id = ? ORDER BY name');
  const devices = devicesStmt.all(id) as any[];
  
  return {
    id: lab.id,
    name: lab.name,
    status: lab.status,
    devices: devices.map(mapDevice)
  };
};

// Get device by ID
export const getDeviceById = (deviceId: string): Device | undefined => {
  const stmt = db.prepare('SELECT * FROM devices WHERE id = ?');
  const device = stmt.get(deviceId) as any;
  return device ? mapDevice(device) : undefined;
};

// Update lab status
export const updateLabStatus = (labId: string, status: 'AVAILABLE' | 'UNAVAILABLE'): boolean => {
  const stmt = db.prepare('UPDATE labs SET status = ? WHERE id = ?');
  const result = stmt.run(status, labId);
  return result.changes > 0;
};

// Update device status
export const updateDeviceStatus = (deviceId: string, status: 'AVAILABLE' | 'UNAVAILABLE'): boolean => {
  const stmt = db.prepare('UPDATE devices SET status = ? WHERE id = ?');
  const result = stmt.run(status, deviceId);
  return result.changes > 0;
};

// Connect user to device
export const connectUserToDevice = (deviceId: string, userId: string): boolean => {
  const { v4: uuidv4 } = require('uuid');
  
  // Check if already connected
  const checkStmt = db.prepare('SELECT * FROM device_connections WHERE device_id = ? AND user_id = ?');
  if (checkStmt.get(deviceId, userId)) {
    return true; // Already connected
  }
  
  const insertStmt = db.prepare(`
    INSERT INTO device_connections (id, device_id, user_id, connected_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
  
  try {
    insertStmt.run(uuidv4(), deviceId, userId);
    
    // Update device status to UNAVAILABLE
    updateDeviceStatus(deviceId, 'UNAVAILABLE');
    
    // Check and update lab status if needed
    const device = getDeviceById(deviceId);
    if (device) {
      updateLabStatus(device.labId, 'UNAVAILABLE');
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting user to device:', error);
    return false;
  }
};

// Disconnect user from device
export const disconnectUserFromDevice = (deviceId: string, userId: string): boolean => {
  const deleteStmt = db.prepare('DELETE FROM device_connections WHERE device_id = ? AND user_id = ?');
  const result = deleteStmt.run(deviceId, userId);
  
  if (result.changes > 0) {
    // Check if device still has connections
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM device_connections WHERE device_id = ?');
    const count = (countStmt.get(deviceId) as any).count;
    
    if (count === 0) {
      updateDeviceStatus(deviceId, 'AVAILABLE');
      
      // Check if all devices in lab are available
      const device = getDeviceById(deviceId);
      if (device) {
        const lab = getLabById(device.labId);
        if (lab && lab.devices.every(d => d.status === 'AVAILABLE')) {
          updateLabStatus(device.labId, 'AVAILABLE');
        }
      }
    }
  }
  
  return result.changes > 0;
};

// Disconnect all users from device
export const disconnectAllFromDevice = (deviceId: string): void => {
  const deleteStmt = db.prepare('DELETE FROM device_connections WHERE device_id = ?');
  deleteStmt.run(deviceId);
  updateDeviceStatus(deviceId, 'AVAILABLE');
};

// Get system stats
export const getSystemStats = (): SystemStats => {
  const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const activeUsers = (db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM device_connections').get() as any).count;
  const availableLabs = (db.prepare("SELECT COUNT(*) as count FROM labs WHERE status = 'AVAILABLE'").get() as any).count;
  const unavailableLabs = (db.prepare("SELECT COUNT(*) as count FROM labs WHERE status = 'UNAVAILABLE'").get() as any).count;
  
  return {
    activeUsers,
    totalUsers,
    availableLabs,
    unavailableLabs
  };
};

// Force release lab (admin function)
export const forceReleaseLab = (labId: string): boolean => {
  const lab = getLabById(labId);
  if (!lab) return false;
  
  // Disconnect all users from all devices in the lab
  for (const device of lab.devices) {
    disconnectAllFromDevice(device.id);
  }
  
  // Update lab status
  updateLabStatus(labId, 'AVAILABLE');
  
  return true;
};
