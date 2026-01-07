import type { Lab, SystemStats } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Fetch all labs from Backend
export const getAllLabs = async (): Promise<Lab[]> => {
  const response = await fetch(`${API_URL}/api/labs`);
  if (!response.ok) {
    throw new Error('Failed to fetch labs');
  }
  return response.json();
};

// Fetch single lab by ID from Backend
export const getLabById = async (id: string): Promise<Lab | undefined> => {
  const response = await fetch(`${API_URL}/api/labs/${id}`);
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch lab');
  }
  return response.json();
};

// Fetch system stats from Backend
export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await fetch(`${API_URL}/api/labs/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
};

