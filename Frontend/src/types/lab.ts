import type { User } from './auth';

export type DeviceType = 'ROUTER' | 'SWITCH' | 'PC';
export type DeviceStatus = 'AVAILABLE' | 'BUSY';

export interface Device {
  id: string;
  name: string; // e.g., R1, SW1
  type: DeviceType;
  status: DeviceStatus;
  connectedUsers?: User[];
}

export interface Lab {
  id: string;
  name: string; // e.g., Set 1 - Lab 01
  set: number; // 1 or 2
  status: 'AVAILABLE' | 'BUSY';
  devices: Device[];
}
