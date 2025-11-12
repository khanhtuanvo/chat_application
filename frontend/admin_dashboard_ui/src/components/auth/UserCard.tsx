import React, { useState } from 'react';
import type { User } from '../../types/user';
import { getUserField } from '../../types/user';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onRoleToggle: (userId: number, newRole: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, onRoleToggle }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleRoleToggle = () => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    onRoleToggle(user.id, newRole);
  };

  const handleDelete = () => {
    onDelete(user.id);
    setShowConfirmDelete(false);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.username}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            (getUserField(user, 'isActive') as boolean)
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {(getUserField(user, 'isActive') as boolean) ? 'Active' : 'Inactive'}
          </span>
          {(getUserField(user, 'isVerified') as boolean) && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              Verified
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {(() => {
          const createdAt = getUserField(user, 'createdAt');
          return createdAt ? new Date(createdAt as string).toLocaleDateString() : 'N/A';
        })()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors duration-200"
          >
            Edit
          </button>
          <button
            onClick={handleRoleToggle}
            className="text-purple-600 hover:text-purple-900"
          >
            Toggle Role
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      </td>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {user.username}? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </tr>
  );
};

export default UserCard;
