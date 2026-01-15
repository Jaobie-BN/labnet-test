

export type DeviceType = 'ROUTER' | 'SWITCH' | 'PC';
export type DeviceStatus = 'AVAILABLE' | 'UNAVAILABLE';


export interface ConnectedUser {
  id: string;
  name: string;
}

export interface Device {
  id: string;
  name: string; // e.g., R1, SW1
  type: DeviceType;
  status: DeviceStatus;
  connectedUsers?: ConnectedUser[];
  serialPort?: string; // e.g., /dev/netlab_router1
  baudRate?: number;   // e.g., 9600
}

export interface Lab {
  id: string;
  name: string; // e.g., Set 1 - Lab 01
  set: number; // 1 or 2
  status: 'AVAILABLE' | 'UNAVAILABLE';
  devices: Device[];
}
