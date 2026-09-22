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
  User,
  ChevronDown,
  ChevronRight,
  Receipt,
  Wallet,
  Building2,
  SlidersHorizontal,
  LifeBuoy,
  Star,
  Banknote,
  CarFront,
  ShieldAlert,
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
    supportTickets,
    valetStaff,
    customerVehicles,
    damageClaims,
  } = useRentalStore();

  const [isDriversExpanded, setIsDriversExpanded] = useState(true);

  const pendingDriverBookings = driverBookings.filter((b) => b.status === 'Searching Driver' || b.status === 'Pending').length;
  const pendingDriversCount = drivers.filter((d) => d.status === 'Pending Approval').length;
  const approvedDriversCount = drivers.filter((d) => d.status === 'Approved').length;
  const onlineDriversCount = drivers.filter((d) => d.dutyStatus === 'Online').length;
  const suspendedDriversCount = drivers.filter((d) => d.status === 'Suspended').length;
  const openSupportTicketsCount = supportTickets?.filter((t) => t.status === 'Open').length || 0;
  const openDamageClaimsCount = damageClaims?.filter((c) => c.status === 'Open' || c.status === 'Under Review').length || 0;

  const driverSubItems: { href: string; label: string; count: number; badgeColor?: string }[] = [
    { href: '/admin/drivers', label: 'All Drivers', count: drivers.length },
    {
      href: '/admin/drivers/pending',
      label: 'Pending Approval',
      count: pendingDriversCount,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-200',
    },
    {
      href: '/admin/drivers/approved',
      label: 'Approved',
      count: approvedDriversCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    {
      href: '/admin/drivers/online',
      label: 'Online Duty',
      count: onlineDriversCount,
      badgeColor: 'bg-sky-100 text-sky-800 border border-sky-200',
    },
    {
      href: '/admin/drivers/suspended',
      label: 'Suspended',
      count: suspendedDriversCount,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
  ];

  const menuGroups: { groupTitle: string; items: MenuItem[] }[] = [
    {
      groupTitle: 'OVERVIEW & LIVE OPERATORS',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { href: '/admin/live-operations', label: 'Live Operations Center', icon: Radio },
      ],
    },
    {
      groupTitle: 'CUSTOMER MANAGEMENT',
      items: [
        {
          href: '/admin/customers',
          label: 'Customers',
          icon: Users,
          badge: customers?.length > 0 ? customers.length : undefined,
        },
        {
          href: '/admin/customer-vehicles',
          label: 'Customer Vehicles',
          icon: CarFront,
          badge: customerVehicles?.length > 0 ? customerVehicles.length : undefined,
        },
      ],
    },
    {
      groupTitle: 'DRIVER-ON-DEMAND SERVICE',
      items: [
        {
          href: '/admin/driver-bookings',
          label: 'Driver Bookings',
          icon: CalendarCheck,
          badge: pendingDriverBookings > 0 ? pendingDriverBookings : undefined,
        },
        { href: '/admin/drivers', label: 'Driver Management', icon: Car, id: 'drivers' },
        { href: '/admin/driver-subscriptions', label: 'Subscribed Drivers', icon: Award },
      ],
    },
    {
      groupTitle: 'VALET EVENT SERVICE',
      items: [
        { href: '/admin/valet-bookings', label: 'Valet Event Bookings', icon: Building2 },
        { href: '/admin/valet-staff', label: 'Valet Staff Roster', icon: Users, badge: valetStaff?.length },
      ],
    },
    {
      groupTitle: 'PRICING & DISPATCH RULES',
      items: [
        { href: '/admin/pricing', label: 'Pricing & Dynamic Surge', icon: SlidersHorizontal },
      ],
    },
    {
      groupTitle: 'FINANCE & TRANSACTIONS',
      items: [
        { href: '/admin/wallet', label: 'User Wallet & Savings', icon: Wallet },
        { href: '/admin/payouts', label: 'Driver & Staff Payouts', icon: Banknote },
        { href: '/admin/transactions', label: 'Transactions & Logs', icon: Receipt },
        { href: '/admin/subscription-payments', label: 'Subscription Payments', icon: CreditCard },
        { href: '/admin/driver-subscription-plans', label: 'Subscription Plans', icon: Ticket },
      ],
    },
    {
      groupTitle: 'SUPPORT & QUALITY',
      items: [
        {
          href: '/admin/damage-claims',
          label: 'Damage Claims Desk',
          icon: ShieldAlert,
          badge: openDamageClaimsCount > 0 ? openDamageClaimsCount : undefined,
        },
        {
          href: '/admin/disputes',
          label: 'Support & Disputes',
          icon: LifeBuoy,
          badge: openSupportTicketsCount > 0 ? openSupportTicketsCount : undefined,
        },
        { href: '/admin/reviews', label: 'Reviews & Ratings', icon: Star },
      ],
    },
    {
      groupTitle: 'ADMINISTRATIVE',
      items: [
        { href: '/admin/admin-users', label: 'Staff & Admin Team', icon: ShieldCheck },
        { href: '/admin/roles-permissions', label: 'Roles & Permissions', icon: Lock },
        // { href: '/admin/settings', label: 'System Configurations', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200/80 flex flex-col h-screen sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-16 border-b border-[#e7dbc5]/60 flex items-center justify-between px-5 bg-gradient-to-r from-emerald-950 to-[#023526]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#c5a880] via-[#b4966c] to-[#7e6542] flex items-center justify-center text-white shadow-md ring-2 ring-[#c5a880]/30 shrink-0">
            <Crown className="w-5 h-5 text-amber-100 fill-amber-100" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight tracking-tight">
              DrivePulse <span className="text-[#c5a880] font-extrabold">& Valet</span>
            </h1>
            <p className="text-[10px] font-semibold text-[#c5a880]/80">Admin Control Portal</p>
          </div>
        </div>
        {/* <Link
          href="/"
          className="text-[10px] font-bold text-emerald-200 bg-emerald-900/60 hover:bg-emerald-800 hover:text-white px-2 py-1 rounded border border-emerald-700/50 transition-colors"
          title="Visit Customer Website"
        >
          Website
        </Link> */}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] px-3 py-4 space-y-5">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold tracking-widest text-[#9c7f56] uppercase mb-1.5">
              {group.groupTitle}
            </h2>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.id === 'drivers') {
                const isDriversGroupActive = pathname.startsWith('/admin/drivers');

                return (
                  <div key={item.href} className="space-y-1">
                    <Link
                      href="/admin/drivers"
                      onClick={() => setIsDriversExpanded(true)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all group ${isDriversGroupActive
                        ? 'bg-[#023526] text-white font-bold shadow-xs border-l-4 border-[#c5a880]'
                        : 'text-slate-700 hover:text-[#023526] hover:bg-emerald-50/60'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-105 ${isDriversGroupActive ? 'text-[#c5a880]' : 'text-slate-400 group-hover:text-primary'
                            }`}
                        />
                        <span className="tracking-tight">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {pendingDriversCount > 0 && !isDriversExpanded && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${isDriversGroupActive
                              ? 'bg-[#c5a880] text-slate-900 shadow-xs'
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
                              className={`w-3.5 h-3.5 ${isDriversGroupActive ? 'text-[#c5a880]' : 'text-slate-400'}`}
                            />
                          ) : (
                            <ChevronRight
                              className={`w-3.5 h-3.5 ${isDriversGroupActive ? 'text-[#c5a880]' : 'text-slate-400'}`}
                            />
                          )}
                        </span>
                      </div>
                    </Link>

                    {isDriversExpanded && (
                      <div className="pl-3 py-1 space-y-1 border-l-2 border-[#c5a880]/40 ml-4 my-1">
                        {driverSubItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${isSubActive
                                ? 'bg-[#faf8f5] text-[#023526] font-bold border-l-2 border-[#c5a880] shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-[#c5a880]' : 'bg-slate-300'
                                    }`}
                                ></span>
                                {sub.label}
                              </span>
                              {sub.count > 0 && (
                                <span
                                  className={`px-1.5 py-0.2 text-[9.5px] font-bold rounded ${isSubActive
                                    ? 'bg-[#023526] text-[#c5a880]'
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all group ${isActive
                    ? 'bg-[#023526] text-white font-bold shadow-xs border-l-4 border-[#c5a880]'
                    : 'text-slate-700 hover:text-[#023526] hover:bg-emerald-50/60'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-[#c5a880]' : 'text-slate-400 group-hover:text-primary'
                        }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${isActive
                        ? 'bg-[#c5a880] text-slate-900 shadow-xs'
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
