'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import { useValetBookingStore } from '@/store/useValetBookingStore';
import { useSidebarStore } from '@/store/useSidebarStore';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Building2,
  Users,
  CreditCard,
  Crown,
  Ticket,
  Award,
  Radio,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronRight,
  Receipt,
  Banknote,
  SlidersHorizontal,
  LifeBuoy,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
  X,
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
    drivers,
    customers,
    supportTickets,
    valetStaff,
  } = useRentalStore();
  const { valetBookings, counts: valetCounts } = useValetBookingStore();

  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    setMobileOpen,
    setCollapsed,
  } = useSidebarStore();

  const [isDriversExpanded, setIsDriversExpanded] = useState(true);

  // Restore saved collapse preference on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('drivepulse_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to read sidebar preference', e);
    }
  }, [setCollapsed]);

  const pendingDriverBookings = driverBookings.filter(
    (b) => b.status === 'Searching Driver' || b.status === 'Pending'
  ).length;
  const pendingValetBookings =
    valetCounts != null
      ? (valetCounts.newRequests ?? 0) + (valetCounts.pendingAssignment ?? 0)
      : (valetBookings || []).filter(
          (b) =>
            b.status === 'New Request' ||
            b.status === 'Pending Assignment' ||
            b.status === 'Partially Assigned' ||
            (b.status as string) === 'Pending'
        ).length;
  const pendingDriversCount = drivers.filter((d) => d.status === 'Pending Approval').length;
  const approvedDriversCount = drivers.filter((d) => d.status === 'Approved').length;
  const onlineDriversCount = drivers.filter((d) => d.dutyStatus === 'Online').length;
  const suspendedDriversCount = drivers.filter((d) => d.status === 'Suspended').length;
  const openSupportTicketsCount = supportTickets?.filter((t) => t.status === 'Open').length || 0;

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
        {
          href: '/admin/valet-bookings',
          label: 'Valet Bookings',
          icon: Building2,
          badge: pendingValetBookings > 0 ? pendingValetBookings : undefined,
        },
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
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen bg-white border-r border-stone-200/80 flex flex-col select-none shadow-xs transition-all duration-300 ease-in-out shrink-0 ${isCollapsed ? 'w-20' : 'w-64'
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-[#e7dbc5]/60 flex items-center justify-between px-3 bg-gradient-to-r from-emerald-950 to-[#023526]">
          <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'mx-auto' : ''}`}>
            <button
              onClick={() => {
                if (isCollapsed) toggleCollapse();
              }}
              className={`w-9 h-9 rounded-lg bg-gradient-to-br from-[#c5a880] via-[#b4966c] to-[#7e6542] flex items-center justify-center text-white shadow-md ring-2 ring-[#c5a880]/30 shrink-0 ${isCollapsed ? 'cursor-pointer hover:scale-105 transition-transform' : ''
                }`}
              title={isCollapsed ? 'Click to open sidebar' : 'DrivePulse Admin'}
            >
              <Crown className="w-5 h-5 text-amber-100 fill-amber-100" />
            </button>

            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <h1 className="font-bold text-white text-sm leading-tight tracking-tight truncate">
                  DrivePulse <span className="text-[#c5a880] font-extrabold">& Valet</span>
                </h1>
                <p className="text-[10px] font-semibold text-[#c5a880]/80 truncate">
                  Admin Control Portal
                </p>
              </div>
            )}
          </div>

          {/* Toggle / Close Buttons */}
          <div className="flex items-center">
            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900/60"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse button */}
            {!isCollapsed && (
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 text-white hover:text-white rounded-lg  transition-colors"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] px-2 py-4 space-y-4">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed ? (
                <h2 className="px-3 text-[10px] font-bold tracking-widest text-[#9c7f56] uppercase mb-1.5 truncate">
                  {group.groupTitle}
                </h2>
              ) : (
                <div
                  className="my-2 border-t border-slate-100 mx-2"
                  title={group.groupTitle}
                />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                // Driver Management Item (accordion in expanded mode, direct link in collapsed)
                if (item.id === 'drivers') {
                  const isDriversGroupActive = pathname.startsWith('/admin/drivers');

                  if (isCollapsed) {
                    return (
                      <Link
                        key={item.href}
                        href="/admin/drivers"
                        onClick={() => setMobileOpen(false)}
                        title="Driver Management"
                        className={`relative flex items-center justify-center w-12 h-10 mx-auto rounded-lg text-xs font-semibold transition-all group ${isDriversGroupActive
                          ? 'bg-[#023526] text-white shadow-xs'
                          : 'text-slate-700 hover:text-[#023526] hover:bg-emerald-50/60'
                          }`}
                      >
                        <Icon
                          className={`w-5 h-5 transition-transform group-hover:scale-105 ${isDriversGroupActive ? 'text-[#c5a880]' : 'text-slate-400 group-hover:text-primary'
                            }`}
                        />
                        {pendingDriversCount > 0 && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-[9px] font-extrabold bg-amber-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                            {pendingDriversCount}
                          </span>
                        )}
                      </Link>
                    );
                  }

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
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 transition-transform group-hover:scale-105 shrink-0 ${isDriversGroupActive ? 'text-[#c5a880]' : 'text-slate-400 group-hover:text-primary'
                              }`}
                          />
                          <span className="tracking-tight truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
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
                                className={`w-3.5 h-3.5 ${isDriversGroupActive ? 'text-[#c5a880]' : 'text-slate-400'
                                  }`}
                              />
                            ) : (
                              <ChevronRight
                                className={`w-3.5 h-3.5 ${isDriversGroupActive ? 'text-[#c5a880]' : 'text-slate-400'
                                  }`}
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
                                onClick={() => setMobileOpen(false)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${isSubActive
                                  ? 'bg-[#faf8f5] text-[#023526] font-bold border-l-2 border-[#c5a880] shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                  }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-[#c5a880]' : 'bg-slate-300'
                                      }`}
                                  />
                                  <span className="truncate">{sub.label}</span>
                                </span>
                                {sub.count > 0 && (
                                  <span
                                    className={`px-1.5 py-0.2 text-[9.5px] font-bold rounded shrink-0 ${isSubActive
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

                // Collapsed Item View
                if (isCollapsed) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={item.label}
                      className={`relative flex items-center justify-center w-12 h-10 mx-auto rounded-lg text-xs font-semibold transition-all group ${isActive
                        ? 'bg-[#023526] text-white shadow-xs'
                        : 'text-slate-700 hover:text-[#023526] hover:bg-emerald-50/60'
                        }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-[#c5a880]' : 'text-slate-400 group-hover:text-primary'
                          }`}
                      />
                      {item.badge !== undefined && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-[9px] font-extrabold bg-orange-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                // Expanded Item View
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all group ${isActive
                      ? 'bg-[#023526] text-white font-bold shadow-xs border-l-4 border-[#c5a880]'
                      : 'text-slate-700 hover:text-[#023526] hover:bg-emerald-50/60'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-105 shrink-0 ${isActive ? 'text-[#c5a880]' : 'text-slate-400 group-hover:text-primary'
                          }`}
                      />
                      <span className="tracking-tight truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md shrink-0 ${isActive
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

        {/* Footer System Status & Collapse Toggle */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-slate-700">Services Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">v3.4.0</span>
                <button
                  onClick={toggleCollapse}
                  className="hidden lg:flex p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                  title="Close / Collapse Sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={toggleCollapse}
              className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-primary hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Open / Expand Sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-slate-600 hover:text-primary" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
