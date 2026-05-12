export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
