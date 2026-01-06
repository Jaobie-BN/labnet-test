export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'student' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
