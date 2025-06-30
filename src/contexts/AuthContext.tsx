import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateUserProfile: (data: Partial<User>) => void;
  updateProfilePhoto: (photoUrl: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  loading: true,
  updateUserProfile: () => {},
  updateProfilePhoto: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Mock users for demo
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@sonaged.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    password: 'admin123',
    photoUrl: '',
  },
  {
    id: '2',
    username: 'geomaticien',
    email: 'geo@sonaged.com',
    role: 'geomaticien',
    firstName: 'Geo',
    lastName: 'Specialist',
    password: 'geo123',
    photoUrl: '',
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('sonaged_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('sonaged_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, role: string) => {
    try {
      const foundUser = MOCK_USERS.find(
        (u) => u.username === username && u.password === password && u.role === role
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        localStorage.setItem('sonaged_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('sonaged_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('sonaged_user', JSON.stringify(updatedUser));
  };

  const updateProfilePhoto = (photoUrl: string) => {
    if (!user) return;
    
    const updatedUser = { ...user, photoUrl };
    setUser(updatedUser);
    localStorage.setItem('sonaged_user', JSON.stringify(updatedUser));

    // Force a re-render by updating the timestamp
    updateUserProfile({ ...user, lastUpdated: new Date().toISOString() });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        updateUserProfile,
        updateProfilePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};