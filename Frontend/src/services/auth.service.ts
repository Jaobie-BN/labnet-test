import type { AuthResponse, LoginCredentials } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate basic validation (Mock)
  if (credentials.email === 'error@example.com') {
    throw new Error('Invalid email or password');
  }

  // Return mock success response
  return {
    user: {
      id: '1',
      email: credentials.email,
      name: 'Mock User',
    },
    token: 'mock-jwt-token-12345',
  };
};
