'use client';

import React, { useEffect } from 'react';
import { useAuthStore, AuthUser } from '@/store/useAuthStore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
};

export const useAuth = () => {
  const { isAuthenticated, user, isLoading, login, logout } = useAuthStore();
  return { isAuthenticated, user, isLoading, login, logout };
};

export type { AuthUser };
