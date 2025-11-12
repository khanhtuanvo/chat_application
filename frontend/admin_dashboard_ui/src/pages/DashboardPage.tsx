import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getUserField } from '../types/user';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const StatCard = ({ title, value, icon, color, description }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    description?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, onClick, color, iconColor }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
    iconColor: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full ${color} p-5 rounded-xl transition-all duration-200 text-left hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-base leading-tight">{title}</div>
          <div className="text-sm text-white/90 mt-1 leading-tight">{description}</div>
        </div>
      </div>
    </button>
  );


  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.username}!`}>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Account Status"
            value={(getUserField(user!, 'isActive') as boolean) ? 'Active' : 'Inactive'}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-green-500"
          />
          
          <StatCard
            title="User Role"
            value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            color={user?.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}
          />
          
          <StatCard
            title="Chat Access"
            value={(getUserField(user!, 'canChat') as boolean) ? 'Enabled' : 'Disabled'}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            color={(getUserField(user!, 'canChat') as boolean) ? 'bg-green-500' : 'bg-gray-500'}
          />
          
          <StatCard
            title="Account Created"
            value={(() => {
              const createdAt = getUserField(user!, 'createdAt');
              return createdAt ? new Date(createdAt as string).toLocaleDateString() : 'N/A';
            })()}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="bg-indigo-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Username:</span>
                        <span className="text-sm text-gray-900 font-mono">{user?.username}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <span className="text-sm text-gray-900">{user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Role:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user?.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user?.role}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          (getUserField(user!, 'isActive') as boolean)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(getUserField(user!, 'isActive') as boolean) ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {(() => {
                        const lastLoginAt = getUserField(user!, 'lastLoginAt');
                        return lastLoginAt ? (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-gray-600">Last Login:</span>
                            <span className="text-sm text-gray-500">
                              {new Date(lastLoginAt as string).toLocaleString()}
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Account Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Chat Access</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          (getUserField(user!, 'canChat') as boolean)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-300 text-gray-900'
                        }`}>
                          {(getUserField(user!, 'canChat') as boolean) ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Email Verified</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          (getUserField(user!, 'isVerified') as boolean)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {(getUserField(user!, 'isVerified') as boolean) ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Account Type</span>
                        <span className="text-sm text-gray-600">
                          {user?.role === 'admin' ? 'Administrator' : 'Regular User'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
                            
              <div className="p-6 space-y-4">
                <QuickActionCard
                  title="Edit Profile"
                  description="Update your account information"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  }
                  onClick={() => navigate('/profile')}
                  color="bg-gradient-to-r from-blue-500 to-blue-600"
                  iconColor="text-blue-600"
                />

                {user?.role === 'admin' && (
                  <QuickActionCard
                    title="Manage Users"
                    description="Admin user management"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                    onClick={() => navigate('/users')}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                    iconColor="text-purple-600"
                  />
                )}

                <QuickActionCard
                  title="Logout"
                  description="Sign out of your account"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  }
                  onClick={handleLogout}
                  color="bg-gradient-to-r from-red-500 to-red-600"
                  iconColor="text-red-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage; 