import type { User, CreateUserData } from '../types/user';

const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const userService = {
  // Get all users (Admin only)
  async getUsers(): Promise<User[]> {
    console.log('Fetching users from backend...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });

      console.log('Get users response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Get users error:', error);
        throw new Error(error.detail || 'Failed to fetch users');
      }

      const data = await response.json();
      console.log('Raw response from backend:', data);
      console.log('Users fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Get users request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  // Create new user (Admin only)
  async createUser(userData: CreateUserData): Promise<User> {
    console.log('Creating user:', userData.username);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      console.log('Create user response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Create user error:', error);
        throw new Error(error.detail || 'Failed to create user');
      }

      const data = await response.json();
      console.log('User created successfully:', data);
      return data;
    } catch (error) {
      console.error('Create user request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  // Update user role (Admin only)
  async updateUserRole(userId: number, role: 'admin' | 'user'): Promise<User> {
    console.log(`Updating user ${userId} role to:`, role);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      });

      console.log('Update user role response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Update user role error:', error);
        throw new Error(error.detail || 'Failed to update user role');
      }

      const data = await response.json();
      console.log('User role updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Update user role request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  // Update user login permission (Admin only)
  async updateUserLoginPermission(userId: number, isActive: boolean): Promise<User> {
    console.log(`Updating user ${userId} login permission to:`, isActive);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/login_permission`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: isActive }),
      });

      console.log('Update user login permission response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Update user login permission error:', error);
        throw new Error(error.detail || 'Failed to update user login permission');
      }

      const data = await response.json();
      console.log('User login permission updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Update user login permission request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  // Update user can chat permission (Admin only)
  async updateUserCanChatPermission(userId: number, canChat: boolean): Promise<User> {
    console.log(`Updating user ${userId} can chat permission to:`, canChat);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/can_chat`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ can_chat: canChat }),
      });

      console.log('Update user can chat permission response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Update user can chat permission error:', error);
        throw new Error(error.detail || 'Failed to update user can chat permission');
      }

      const data = await response.json();
      console.log('User can chat permission updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Update user can chat permission request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  // Delete user (Admin only)
  async deleteUser(userId: number): Promise<void> {
    console.log(`Deleting user ${userId}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      console.log('Delete user response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Delete user error:', error);
        throw new Error(error.detail || 'Failed to delete user');
      }

      console.log('User deleted successfully');
    } catch (error) {
      console.error('Delete user request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },
};
