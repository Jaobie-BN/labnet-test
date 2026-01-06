import type { Lab, SystemStats } from '../types';

// Mock Data
export const MOCK_STATS: SystemStats = {
  activeUsers: 42,
  totalUsers: 156,
  availableLabs: 4,
  busyLabs: 2,
};

export const MOCK_LABS: Lab[] = [
  // Set 1
  {
    id: 'lab-01',
    name: 'Lab 01',
    set: 1,
    status: 'AVAILABLE',
    devices: [
      { 
        id: '1-r1', 
        name: 'R1', 
        type: 'ROUTER', 
        status: 'AVAILABLE',
        connectedUsers: [
          { id: '2', name: 'John Doe', email: 'john@example.com' },
          { id: '3', name: 'Jane Smith', email: 'jane@example.com' }
        ]
      },
      { id: '1-r2', name: 'R2', type: 'ROUTER', status: 'AVAILABLE' },
      { 
        id: '1-sw1', 
        name: 'SW1', 
        type: 'SWITCH', 
        status: 'AVAILABLE',
         connectedUsers: [
          { id: '4', name: 'Bob Wilson', email: 'bob@example.com' }
        ]
      },
      { id: '1-sw2', name: 'SW2', type: 'SWITCH', status: 'AVAILABLE' },
      { id: '1-pc1', name: 'PC1', type: 'PC', status: 'AVAILABLE' },
      { id: '1-pc2', name: 'PC2', type: 'PC', status: 'AVAILABLE' },
    ]
  },
  {
    id: 'lab-02',
    name: 'Lab 02',
    set: 1,
    status: 'BUSY',
    devices: [
      { id: '2-r1', name: 'R1', type: 'ROUTER', status: 'BUSY' },
      { id: '2-r2', name: 'R2', type: 'ROUTER', status: 'BUSY' },
      { id: '2-sw1', name: 'SW1', type: 'SWITCH', status: 'BUSY' },
      { id: '2-sw2', name: 'SW2', type: 'SWITCH', status: 'AVAILABLE' },
      { id: '2-pc1', name: 'PC1', type: 'PC', status: 'BUSY' },
      { id: '2-pc2', name: 'PC2', type: 'PC', status: 'AVAILABLE' },
    ]
  },
  {
    id: 'lab-03',
    name: 'Lab 03',
    set: 1,
    status: 'AVAILABLE',
    devices: [
      { id: '3-r1', name: 'R1', type: 'ROUTER', status: 'AVAILABLE' },
      { id: '3-r2', name: 'R2', type: 'ROUTER', status: 'AVAILABLE' },
      { id: '3-sw1', name: 'SW1', type: 'SWITCH', status: 'AVAILABLE' },
      { id: '3-sw2', name: 'SW2', type: 'SWITCH', status: 'AVAILABLE' },
      { id: '3-pc1', name: 'PC1', type: 'PC', status: 'AVAILABLE' },
      { id: '3-pc2', name: 'PC2', type: 'PC', status: 'AVAILABLE' },
    ]
  },
  // Set 2
  {
    id: 'lab-04',
    name: 'Lab 04',
    set: 2,
    status: 'AVAILABLE',
    devices: [
      { id: '4-r1', name: 'R1', type: 'ROUTER', status: 'AVAILABLE' },
      { id: '4-r2', name: 'R2', type: 'ROUTER', status: 'AVAILABLE' },
      { id: '4-sw1', name: 'SW1', type: 'SWITCH', status: 'AVAILABLE' },
      { id: '4-sw2', name: 'SW2', type: 'SWITCH', status: 'AVAILABLE' },
      { id: '4-pc1', name: 'PC1', type: 'PC', status: 'AVAILABLE' },
      { id: '4-pc2', name: 'PC2', type: 'PC', status: 'AVAILABLE' },
    ]
  },
  {
    id: 'lab-05',
    name: 'Lab 05',
    set: 2,
    status: 'BUSY',
    devices: [
      { id: '5-r1', name: 'R1', type: 'ROUTER', status: 'BUSY' },
      { id: '5-r2', name: 'R2', type: 'ROUTER', status: 'BUSY' },
      { id: '5-sw1', name: 'SW1', type: 'SWITCH', status: 'BUSY' },
      { id: '5-sw2', name: 'SW2', type: 'SWITCH', status: 'BUSY' },
      { id: '5-pc1', name: 'PC1', type: 'PC', status: 'BUSY' },
      { id: '5-pc2', name: 'PC2', type: 'PC', status: 'BUSY' },
    ]
  },
  {
    id: 'lab-06',
    name: 'Lab 06',
    set: 2,
    status: 'AVAILABLE',
    devices: [
      { id: '6-r1', name: 'R1', type: 'ROUTER', status: 'AVAILABLE' },
      { id: '6-r2', name: 'R2', type: 'ROUTER', status: 'AVAILABLE' },
      { id: '6-sw1', name: 'SW1', type: 'SWITCH', status: 'AVAILABLE' },
      { id: '6-sw2', name: 'SW2', type: 'SWITCH', status: 'AVAILABLE' },
      { id: '6-pc1', name: 'PC1', type: 'PC', status: 'AVAILABLE' },
      { id: '6-pc2', name: 'PC2', type: 'PC', status: 'AVAILABLE' },
    ]
  },
];

export const getAllLabs = (): Lab[] => {
  return MOCK_LABS;
};

export const getLabById = (id: string): Lab | undefined => {
  return MOCK_LABS.find(lab => lab.id === id);
};

export const getSystemStats = (): SystemStats => {
  return MOCK_STATS;
};
