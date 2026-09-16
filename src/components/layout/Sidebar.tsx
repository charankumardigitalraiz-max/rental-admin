'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  CreditCard,
  Crown,
  Ticket,
  Award,
  Radio,
  ShieldCheck,
  Lock,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  id?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const {
    driverBookings,
    valetBookings,
    drivers,
    notifications,
    customers,
  } = useRentalStore();

  const [isDriversExpanded, setIsDriversExpanded] = useState(true);

  const pendingDriverBookings = driverBookings.filter((b) => b.status === 'Searching Driver' || b.status === 'Pending').length;
  const pendingDriversCount = drivers.filter((d) => d.status === 'Pending Approval').length;
  const approvedDriversCount = drivers.filter((d) => d.status === 'Approved').length;
  const onlineDriversCount = drivers.filter((d) => d.dutyStatus === 'Online').length;
  const suspendedDriversCount = drivers.filter((d) => d.status === 'Suspended').length;

  const driverSubItems: { href: string; label: string; count: number; badgeColor?: string }[] = [
    { href: '/drivers', label: 'All Drivers', count: drivers.length },
    {
      href: '/drivers/pending',
      label: 'Pending Approval',
      count: pendingDriversCount,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-200',
    },
    {
      href: '/drivers/approved',
      label: 'Approved',
      count: approvedDriversCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    {
      href: '/drivers/online',
      label: 'Online Duty',
      count: onlineDriversCount,
      badgeColor: 'bg-sky-100 text-sky-800 border border-sky-200',
    },
    {
      href: '/drivers/suspended',
      label: 'Suspended',
      count: suspendedDriversCount,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
  ];

  const menuGroups: { groupTitle: string; items: MenuItem[] }[] = [
    {
      groupTitle: 'OVERVIEW & LIVE OPERATORS',
      items: [
        { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { href: '/live-operations', label: 'Live Operations Center', icon: Radio },
      ],
    },
    {
      groupTitle: 'CUSTOMER MANAGEMENT',
      items: [
        {
          href: '/customers',
          label: 'Customers',
          icon: Users,
          badge: customers?.length > 0 ? customers.length : undefined,
        },
      ],
    },
    {
      groupTitle: 'DRIVER-ON-DEMAND SERVICE',
      items: [
        {
          href: '/driver-bookings',
          label: 'Driver Bookings',
          icon: CalendarCheck,
          badge: pendingDriverBookings > 0 ? pendingDriverBookings : undefined,
        },
        { href: '/drivers', label: 'Driver Management', icon: Car, id: 'drivers' },
        { href: '/driver-subscription-plans', label: 'Subscription Plans', icon: Ticket },
        { href: '/driver-subscriptions', label: 'Subscribed Drivers', icon: Award },
        { href: '/subscription-payments', label: 'Subscription Payments', icon: CreditCard },
      ],
    },

    {
      groupTitle: 'ADMINISTRATIVE',
      items: [
        { href: '/admin-users', label: 'Admin Team', icon: ShieldCheck },
        { href: '/roles-permissions', label: 'Roles & Permissions', icon: Lock },
        { href: '/settings', label: 'System Configurations', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200/80 flex flex-col h-screen sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-16 border-b border-stone-100 flex items-center px-5 gap-3 bg-gradient-to-r from-emerald-50/60 to-white">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
          <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
        </div>
        <div>
          <h1 className="font-bold text-[#064e3b] text-sm leading-tight tracking-tight">
            DrivePulse <span className="text-primary">& Valet</span>
          </h1>
          <p className="text-[10px] font-semibold text-emerald-800/60">Admin Control Portal</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold tracking-widest text-[#064e3b]/70 uppercase mb-1.5">
              {group.groupTitle}
            </h2>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.id === 'drivers') {
                const isDriversGroupActive = pathname.startsWith('/drivers');

                return (
                  <div key={item.href} className="space-y-1">
                    <Link
                      href="/drivers"
                      onClick={() => setIsDriversExpanded(true)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all group ${
                        isDriversGroupActive
                          ? 'bg-primary text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:text-[#064e3b] hover:bg-emerald-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                            isDriversGroupActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                          }`}
                        />
                        <span className="tracking-tight">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {pendingDriversCount > 0 && !isDriversExpanded && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                              isDriversGroupActive
                                ? 'bg-white text-primary shadow-xs'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {pendingDriversCount}
                          </span>
                        )}
                        <span
                          onClick={(e) => {
                            if (isDriversGroupActive) {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDriversExpanded((prev) => !prev);
                            }
                          }}
                          className="p-0.5 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          {isDriversExpanded ? (
                            <ChevronDown
                              className={`w-3.5 h-3.5 ${isDriversGroupActive ? 'text-white' : 'text-slate-400'}`}
                            />
                          ) : (
                            <ChevronRight
                              className={`w-3.5 h-3.5 ${isDriversGroupActive ? 'text-white' : 'text-slate-400'}`}
                            />
                          )}
                        </span>
                      </div>
                    </Link>

                    {isDriversExpanded && (
                      <div className="pl-3 py-1 space-y-1 border-l-2 border-emerald-500/30 ml-4 my-1">
                        {driverSubItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                isSubActive
                                  ? 'bg-emerald-100/90 text-primary font-bold shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isSubActive ? 'bg-primary' : 'bg-slate-300'
                                  }`}
                                ></span>
                                {sub.label}
                              </span>
                              {sub.count > 0 && (
                                <span
                                  className={`px-1.5 py-0.2 text-[9.5px] font-bold rounded ${
                                    isSubActive
                                      ? 'bg-primary text-white'
                                      : sub.badgeColor || 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {sub.count}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:text-[#064e3b] hover:bg-emerald-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                        isActive
                          ? 'bg-white text-primary shadow-xs'
                          : 'bg-orange-100 text-orange-900 border border-orange-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-semibold text-slate-700">Services Online</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">v3.4.0</span>
      </div>
    </aside>
  );
}
