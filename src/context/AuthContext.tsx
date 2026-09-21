'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'drivepulse_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsedUser = JSON.parse(savedSession);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Failed to parse saved auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, pass: string): boolean => {
    // Demo credential check or default admin allow
    if (email && pass) {
      const authUser: AuthUser = {
        email: email,
        name: email.split('@')[0].replace('.', ' ').toUpperCase() || 'Admin User',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
