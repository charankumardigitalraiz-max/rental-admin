'use client';

import React from 'react';
import Sidebar from '@/components/admin/layout/Sidebar';
import Header from '@/components/admin/layout/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
