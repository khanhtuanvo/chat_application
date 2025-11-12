import type { User, LoginCredentials, RegisterCredentials, UpdateProfileData, AuthResponse } from '../types/user';

const API_BASE_URL = 'http://localhost:8000/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Attempting login with:', credentials.email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error:', errorData);
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);
      return data;
    } catch (error) {
      console.error('Login request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    console.log('Attempting registration with:', credentials.email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Register response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error:', errorData);
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      return data;
    } catch (error) {
      console.error('Registration request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    try {
      // Updated to use the correct endpoint path
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      return response.json();
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  },

  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      return response.json();
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  async deleteAccount(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete account');
      }

      // Clear local storage after successful deletion
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Delete account failed:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
  },

  // Setup admin user for testing
  async setupAdmin(): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/setup`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to setup admin user');
      }

      return response.json();
    } catch (error) {
      console.error('Setup admin failed:', error);
      throw error;
    }
  },
}; 