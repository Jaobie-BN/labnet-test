import type { User } from '../types/auth';
import { API_URL } from './labService';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface SystemStats {
  activeUsers: number;
  totalUsers: number;
  availableLabs: number;
  unavailableLabs: number;
}

export const getDashboardStats = async (): Promise<SystemStats> => {
  const response = await fetch(`${API_URL}/api/admin/dashboard-stats`, {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  
  return response.json();
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    headers: getAuthHeader()
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
};

export const forceReleaseLab = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/admin/labs/${id}/force-release`, {
    method: 'POST',
    headers: getAuthHeader()
  });

  if (!response.ok) {
    throw new Error('Failed to force release lab');
  }
};
