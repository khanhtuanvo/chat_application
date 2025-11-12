export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  // Handle both snake_case and camelCase field names
  isActive?: boolean;
  is_active?: boolean;
  canChat?: boolean;
  can_chat?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  lastLoginAt?: string | null;
  last_login_at?: string | null;
}

// Helper function to get the correct field value
export const getUserField = (user: User, fieldName: string): unknown => {
  const camelCase = user[fieldName as keyof User];
  const snakeCase = user[fieldName.replace(/([A-Z])/g, '_$1').toLowerCase() as keyof User];
  return camelCase !== undefined ? camelCase : snakeCase;
};

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserData {
  id: number;
  role?: 'admin' | 'user';
  isActive?: boolean;
  canChat?: boolean;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
} 