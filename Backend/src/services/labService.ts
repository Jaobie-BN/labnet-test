import fs from 'fs';
import path from 'path';

// Define types (matching Frontend types)
export interface Device {
  id: string;
  name: string;
  type: 'ROUTER' | 'SWITCH' | 'PC';
  status: 'AVAILABLE' | 'UNAVAILABLE';
  connectedUsers?: { id: string; name: string; email: string }[];
}

export interface Lab {
  id: string;
  name: string;
  set: number;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  devices: Device[];
}

export interface SystemStats {
  activeUsers: number;
  totalUsers: number;
  availableLabs: number;
  unavailableLabs: number;
}

const DATA_PATH = path.join(process.cwd(), 'data', 'labs.json');

export const getAllLabs = (): Lab[] => {
  try {
    const fileData = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading labs database:', error);
    return [];
  }
};

export const getLabById = (id: string): Lab | undefined => {
  const labs = getAllLabs();
  return labs.find(lab => lab.id === id);
};

export const getSystemStats = (): SystemStats => {
  const labs = getAllLabs();
  const availableLabs = labs.filter(l => l.status === 'AVAILABLE').length;
  const unavailableLabs = labs.filter(l => l.status === 'UNAVAILABLE').length;
  
  return {
    activeUsers: 42,  // Mock for now
    totalUsers: 156,  // Mock for now
    availableLabs,
    unavailableLabs
  };
};
