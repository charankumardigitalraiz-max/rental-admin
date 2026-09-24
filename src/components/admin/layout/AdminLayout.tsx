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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#023526] animate-spin mb-3" />
        <p className="text-xs text-slate-600 font-medium tracking-wide">Checking security authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#023526] animate-spin mb-3" />
        <p className="text-xs text-slate-600 font-medium tracking-wide">Redirecting to administrator login...</p>
      </div>
    );
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
