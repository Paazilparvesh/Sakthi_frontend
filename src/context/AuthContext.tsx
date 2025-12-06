import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/user.type.ts';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ Restore user on app load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.username) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error restoring user from localStorage:', error);
      localStorage.removeItem('user');
    } finally {
      // ✅ Important: end loading
      setIsLoading(false);
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<User | null> => {
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) return null;

      const data = await response.json();

      // Accept common success formats
      const success =
        data.message?.toLowerCase() === 'login successful' ||
        response.status === 200;

      if (!success) return null;

      const loggedUser: User = {
        username: data.username,
        roles: data.roles,
        isAdmin: data.isAdmin,
      };

      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);

      return loggedUser;
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !isLoading && !!user, // FIXED
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>

  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
