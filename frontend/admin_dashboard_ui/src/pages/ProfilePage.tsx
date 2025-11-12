import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { UpdateProfileData } from '../types/user';
import { getUserField } from '../types/user';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<UpdateProfileData>({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUpdating(true);

    try {
      // Only send fields that have changed
      const changes: UpdateProfileData = {};
      if (formData.username !== user?.username) {
        changes.username = formData.username;
      }
      if (formData.email !== user?.email) {
        changes.email = formData.email;
      }

      if (Object.keys(changes).length === 0) {
        setError('No changes to save');
        setIsUpdating(false);
        return;
      }

      await updateProfile(changes);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setIsDeleting(true);
    setShowDeleteModal(false);

    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (!user) {
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
              You need to be logged in to access your profile.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              size="lg"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Profile Settings" subtitle="Manage your account information">
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Success Display */}
        {success && (
          <Alert type="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex space-x-2 mt-2">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  (getUserField(user, 'isActive') as boolean)
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {(getUserField(user, 'isActive') as boolean) ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div>
              <Button
                onClick={handleEdit}
                variant="secondary"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
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
                      pattern="^[a-zA-Z0-9_]+$"
                      title="Username can only contain letters, numbers, and underscores"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
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
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      loading={isUpdating}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      variant="secondary"
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <p className="text-gray-900 font-mono">{user.username}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                    <p className="text-gray-900">
                      {(() => {
                        const createdAt = getUserField(user, 'createdAt');
                        return createdAt ? new Date(createdAt as string).toLocaleDateString() : 'N/A';
                      })()}
                    </p>
                  </div>
                  
                  {(() => {
                    const lastLoginAt = getUserField(user, 'lastLoginAt');
                    return lastLoginAt ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                        <p className="text-gray-900">{new Date(lastLoginAt as string).toLocaleString()}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Account Status</h4>
                    <p className="text-sm text-gray-600">Your account login status</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    (getUserField(user, 'isActive') as boolean)
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(getUserField(user, 'isActive') as boolean) ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Chat Access</h4>
                    <p className="text-sm text-gray-600">Permission to use chat features</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    (getUserField(user, 'canChat') as boolean)
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(getUserField(user, 'canChat') as boolean) ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Verified</h4>
                    <p className="text-sm text-gray-600">Email verification status</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    (getUserField(user, 'isVerified') as boolean)
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(getUserField(user, 'isVerified') as boolean) ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Danger Zone
            </h3>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h4>
                <p className="text-sm text-gray-600 max-w-md">
                  Permanently delete your account and all associated data. This action cannot be undone and will immediately log you out.
                </p>
              </div>
              <div>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  loading={isDeleting}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. This will permanently delete your account and remove all data from our servers.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="danger"
              className="flex-1"
              loading={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default ProfilePage; 