'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { ActiveTab } from '@/types';
import {
  LayoutDashboard,
  Car,
  Layers,
  CalendarCheck,
  Users,
  CreditCard,
  RotateCcw,
  Boxes,
  Tag,
  Ticket,
  Star,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  ChevronRight,
  Crown,
} from 'lucide-react';

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export default function Sidebar() {
  const { activeTab, setActiveTab, bookings, notifications } = useRentalStore();

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const menuGroups: { groupTitle: string; items: MenuItem[] }[] = [
    {
      groupTitle: 'MAIN DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products / Vehicles', icon: Car },
        { id: 'categories', label: 'Categories', icon: Layers },
        {
          id: 'bookings',
          label: 'Rental Orders',
          icon: CalendarCheck,
          badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
        },
        { id: 'customers', label: 'Customers', icon: Users },
      ],
    },
    {
      groupTitle: 'OPERATIONS',
      items: [
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'returns', label: 'Returns & Inspection', icon: RotateCcw },
        { id: 'inventory', label: 'Inventory Matrix', icon: Boxes },
        { id: 'pricing', label: 'Pricing Plans', icon: Tag },
        { id: 'coupons', label: 'Coupons & Promo', icon: Ticket },
        { id: 'reviews', label: 'Reviews & Feedback', icon: Star },
      ],
    },
    {
      groupTitle: 'ADMIN & SYSTEM',
      items: [
        { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
        },
        { id: 'admin-users', label: 'Admin Users & Roles', icon: ShieldCheck },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none shadow-sm">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-100 flex items-center px-5 gap-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">Royal Wheels</h1>
          <p className="text-[11px] text-blue-600 font-semibold tracking-wider uppercase">Car Rental Admin</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
              {group.groupTitle}
            </h2>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Quick Footer / Currency Badge */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">Currency:</span>
          </div>
          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">INR (₹)</span>
        </div>
      </div>
    </aside>
  );
}
