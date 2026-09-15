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
  Crown,
  Sparkles,
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
        // { id: 'coupons', label: 'Coupons & Promo', icon: Ticket },
        // { id: 'reviews', label: 'Reviews & Feedback', icon: Star },
      ],
    },
    {
      groupTitle: 'ADMIN & SYSTEM',
      items: [
        // { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
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
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-20 border-b border-slate-100 flex items-center px-5 gap-3 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 border border-blue-400/20 shrink-0">
          <Crown className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1">
            Royal Wheels <Sparkles className="w-3 h-3 text-amber-500 inline-block" />
          </h1>
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
            Car Rental Admin
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h2 className="px-3 text-[10.5px] font-extrabold tracking-widest text-slate-400 uppercase mb-2">
              {group.groupTitle}
            </h2>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[12.5px] transition-all group ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                        }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-md ${isActive
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
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
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200/80 rounded-md shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-semibold text-xs">Currency:</span>
          </div>
          <span className="font-extrabold text-slate-900 bg-slate-100/90 px-2 py-0.5 rounded-md text-[11px] border border-slate-200">
            INR (₹)
          </span>
        </div>
      </div>
    </aside>
  );
}
