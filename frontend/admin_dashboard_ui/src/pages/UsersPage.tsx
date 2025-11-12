import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import type { User, CreateUserData } from '../types/user';
import { getUserField } from '../types/user';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';

const UsersPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedUsers = await userService.getUsers();
      console.log('Fetched users from backend:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleToggle = async (userId: number, currentRole: 'admin' | 'user') => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await userService.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      console.error('Error updating user role:', err);
    }
  };

  const handleLoginPermissionToggle = async (userId: number, currentIsActive: boolean) => {
    try {
      const newIsActive = !currentIsActive;
      await userService.updateUserLoginPermission(userId, newIsActive);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive: newIsActive, is_active: newIsActive }
          : user
      ));

      // If current user was deactivated, logout immediately
      if (user && user.id === userId && !newIsActive) {
        logout();
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user login permission');
      console.error('Error updating user login permission:', err);
    }
  };

  const handleCanChatPermissionToggle = async (userId: number, currentCanChat: boolean) => {
    try {
      const newCanChat = !currentCanChat;
      await userService.updateUserCanChatPermission(userId, newCanChat);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, canChat: newCanChat, can_chat: newCanChat }
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user can chat permission');
      console.error('Error updating user can chat permission:', err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    // Check if trying to delete own account
    if (user && user.id === userId) {
      setError('You cannot delete your own account here. If you want to delete, please reach your profile');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setIsCreating(true);
      setError('');
      
      const newUser = await userService.createUser(userData);
      
      // Add new user to local state
      setUsers(prev => [...prev, newUser]);
      
      // Close modal
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      console.error('Error creating user:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the user management page.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout title="User Management" subtitle="Manage users and their permissions">
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={fetchUsers}
                disabled={loading}
                variant="secondary"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loading size="lg" text="Loading users..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Chat Access
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          (getUserField(user, 'isActive') as boolean) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(getUserField(user, 'isActive') as boolean) ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          (getUserField(user, 'canChat') as boolean)
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {(getUserField(user, 'canChat') as boolean) ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(() => {
                          const createdAt = getUserField(user, 'createdAt');
                          return createdAt ? new Date(createdAt as string).toLocaleDateString() : 'N/A';
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(() => {
                          const lastLoginAt = getUserField(user, 'lastLoginAt');
                          return lastLoginAt ? new Date(lastLoginAt as string).toLocaleDateString() : 'Never';
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleRoleToggle(user.id, user.role)}
                            variant="secondary"
                            size="sm"
                          >
                            Role
                          </Button>
                          <Button
                            onClick={() => handleLoginPermissionToggle(user.id, getUserField(user, 'isActive') as boolean)}
                            variant="secondary"
                            size="sm"
                          >
                            Login
                          </Button>
                          <Button
                            onClick={() => handleCanChatPermissionToggle(user.id, getUserField(user, 'canChat') as boolean)}
                            variant="secondary"
                            size="sm"
                          >
                            Chat
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="md"
      >
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          isLoading={isCreating}
        />
      </Modal>
    </Layout>
  );
};

// Create User Modal Component
interface CreateUserModalProps {
  onClose: () => void;
  onSubmit: (userData: CreateUserData) => Promise<void>;
  isLoading: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter password"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UsersPage;
