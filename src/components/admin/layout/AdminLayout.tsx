'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/layout/Sidebar';
import Header from '@/components/admin/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // For login page, render full screen without sidebar/header wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If unauthenticated, return null to immediately jump to login screen without continuous loader
  if (!isAuthenticated && !isLoading) {
    router.replace('/admin/login');
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
