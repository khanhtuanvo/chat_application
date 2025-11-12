import React from 'react';
import type { User } from '../../types/user';
import UserCard from './UserCard';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onRoleToggle: (userId: number, newRole: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, onRoleToggle }) => {
  if (users.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={onEdit}
              onDelete={onDelete}
              onRoleToggle={onRoleToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
