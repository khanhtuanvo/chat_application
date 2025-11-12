import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials, UpdateProfileData } from '../types/user';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  updateProfile: (profileData: UpdateProfileData) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  checkUserStatus: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(userData => {
          setUser(userData);
          // Check if user is active immediately after fetch
          if (userData && !userData.isActive && !userData.is_active) {
            localStorage.removeItem('token');
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.access_token);
    setUser(response.user);
    
    // Check if user is active after login
    if (response.user && !response.user.isActive && !response.user.is_active) {
      localStorage.removeItem('token');
      setUser(null);
      throw new Error('Your account has been deactivated. Please contact an administrator.');
    }
    
    // Role-based routing will be handled by the RoleBasedRedirect component
    // Users will be automatically redirected based on their role
  };

  const register = async (credentials: RegisterCredentials) => {
    await authService.register(credentials);
  };

  const updateProfile = async (profileData: UpdateProfileData) => {
    const updatedUser = await authService.updateProfile(profileData);
    setUser(updatedUser);
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if current user is active and logout if inactive
  const checkUserStatus = async () => {
    if (user && !user.isActive && !user.is_active) {
      logout();
      return false;
    }
    return true;
  };

  // Check user status periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        await checkUserStatus();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    updateProfile,
    deleteAccount,
    logout,
    checkUserStatus,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider }; 