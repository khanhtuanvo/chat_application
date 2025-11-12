import React, { useState, useEffect } from 'react';
import type { User, CreateUserData } from '../../types/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: User | CreateUserData) => void;
  user?: User;
  mode: 'create' | 'edit';
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user, mode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
  }, [user, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {mode === 'create' ? 'Create New User' : 'Edit User'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {mode === 'create' && (
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            )}

            <div>
              <label className="form-label">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="input-field"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mode === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
