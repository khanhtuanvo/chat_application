import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import TestPage from './pages/TestPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Redirect based on role
  if (user.role === 'admin') {
    return <Navigate to="/users" />;
  } else {
    return <Navigate to="/dashboard" />;
  }
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/test" element={<TestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Role-based redirect */}
        <Route path="/" element={<RoleBasedRedirect />} />
        
        {/* Admin-only routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        
        {/* User routes (both admin and regular users) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
