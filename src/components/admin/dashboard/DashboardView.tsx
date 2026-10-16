'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDashboardStore } from '@/store/useDashboardStore';
import DataTable, { Column } from '@/components/ui/DataTable';
import { DriverBooking, DriverSubscription } from '@/types';
import {
  CalendarCheck,
  Car,
  Users,
  Award,
  DollarSign,
  UserCheck,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Radio,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function DashboardView() {
  const { data, isLoading, error, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = data?.stats;
  const recentDriverBookings = data?.recentDriverBookings || [];
  const expiredOrExpiringSubscriptions = data?.expiredOrExpiringSubscriptions || [];

  // Metrics from unified API
  const totalBookings = stats?.totalBookings ?? 0;
  const totalDriverBookings = stats?.totalDriverBookings ?? 0;
  const totalValetBookings = stats?.totalValetBookings ?? 0;

  const activeDriverTrips = stats?.activeDriverTrips ?? 0;
  const localDriverBookings = stats?.localDriverBookings ?? 0;
  const outstationDriverBookings = stats?.outstationDriverBookings ?? 0;

  const activeDriversCount = stats?.activeDriversCount ?? 0;
  const availableDriversCount = stats?.availableDriversCount ?? 0;
  const busyDriversCount = stats?.busyDriversCount ?? 0;

  const totalGrossRevenue = stats?.totalGrossRevenue ?? 0;
  const totalPlatformCommission = stats?.totalPlatformCommission ?? 0;
  const revenueGrowthText = stats?.revenueGrowthText ?? '+16.4% this month';

  const totalSubscriptions = stats?.totalSubscriptions ?? 0;

  const statsMetrics = [
    {
      id: 'total-bookings',
      label: 'Total Bookings',
      value: totalBookings,
      subtext: `${totalDriverBookings} Driver • ${totalValetBookings} Valet`,
      icon: CalendarCheck,
      iconColor: 'text-primary',
      valueColor: 'text-slate-900',
    },
    {
      id: 'active-bookings',
      label: 'Active Bookings',
      value: `${activeDriverTrips} Trips`,
      subtext: `${localDriverBookings} Local • ${outstationDriverBookings} Outstation`,
      icon: Radio,
      iconColor: 'text-emerald-600 animate-pulse',
      valueColor: 'text-emerald-600',
    },
    {
      id: 'active-drivers',
      label: 'Active Drivers',
      value: activeDriversCount,
      subtext: `${availableDriversCount} Online • ${busyDriversCount} On Trip`,
      icon: Car,
      iconColor: 'text-primary',
      valueColor: 'text-slate-900',
    },
    {
      id: 'gross-value',
      label: 'Gross Booking Value',
      value: `₹${totalGrossRevenue.toLocaleString('en-IN')}`,
      subtext: revenueGrowthText,
      subtextColor: 'text-emerald-600 font-semibold',
      icon: DollarSign,
      iconColor: 'text-indigo-600',
      valueColor: 'text-slate-900',
    },
    {
      id: 'net-revenue',
      label: 'Platform Net Revenue',
      value: `₹${totalPlatformCommission.toLocaleString('en-IN')}`,
      subtext: 'Commission & Subscriptions',
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
  ];

  const recentBookingColumns: Column<DriverBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      render: (b) => <span className="font-mono font-bold text-slate-900">{b.bookingNumber}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (b) => (
        <div>
          <div className="font-bold text-slate-900">{b.customerName}</div>
          <div className="text-[10px] text-slate-400">{b.customerPhone}</div>
        </div>
      ),
    },
    {
      key: 'bookingType',
      header: 'Type',
      render: (b) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-light text-primary border border-primary/20">
          {b.bookingType} ({b.durationHours}h)
        </span>
      ),
    },
    {
      key: 'driverName',
      header: 'Assigned Driver',
      render: (b) =>
        b.driverName ? (
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-primary shrink-0" /> {b.driverName}
          </span>
        ) : (
          <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
            Searching Driver
          </span>
        ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (b) => (
        <span className="font-bold text-slate-900">
          ₹{(b.pricing?.totalCustomerAmount ?? (b as any).totalAmount ?? 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap inline-block ${b.status === 'Completed'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : b.status === 'Searching Driver' || b.status === 'Pending'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : b.status === 'Cancelled'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-sky-50 text-sky-700 border border-sky-200'
            }`}
        >
          ● {b.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (b) => (
        <div className="flex justify-center">
          <Link
            href={`/admin/driver-bookings/${b.id}`}
            className="p-1.5 bg-primary hover:bg-primary text-white hover:text-white rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
            title="View Booking Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  const subscriptionPassColumns: Column<DriverSubscription>[] = [
    {
      key: 'driverName',
      header: 'Driver Name',
      render: (sub) => (
        <div className="flex items-center gap-2">
          <img
            src={sub.driverAvatar}
            alt={sub.driverName}
            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
          />
          <div>
            <span className="font-bold text-slate-900 block">{sub.driverName}</span>
            <span className="text-[10px] text-slate-400">Driver ID: {sub.driverId}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Subscription Plan',
      render: (sub) => <span className="font-medium text-slate-700">{sub.planName}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (sub) => <span className="font-bold text-slate-900">₹{sub.amount}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (sub) => <span className="text-slate-600 font-mono text-[11px]">{sub.expiryDate}</span>,
    },
    {
      key: 'subscriptionStatus',
      header: 'Pass Status',
      render: (sub) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap inline-block ${sub.subscriptionStatus === 'Expired'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
        >
          {sub.subscriptionStatus}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (sub) => (
        <div className="flex justify-center">
          <Link
            href={`/admin/drivers/${sub.driverMongoId || sub.driverId || sub.id}`}
            className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-md shadow-2xs hover:shadow-xs transition-all inline-flex items-center gap-1"
          >
            <UserCheck className="w-3 h-3 text-gold-300" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner & Quick Shortcuts */}
      <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-primary text-white rounded-xl shadow-md border border-emerald-600/40 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            On-Demand Driver <span className="text-gold-400 font-extrabold">& Valet</span> Operations Control
          </h2>
          <p className="text-xs text-gold-300/90 mt-1 font-medium">
            Real-time driver matching, active subscription enforcement, and valet staff event allocation
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isLoading}
          className="relative z-10 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs self-start md:self-auto"
          title="Refresh Dashboard"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-gold-300' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsMetrics.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="card-white p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10.5px] font-bold uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              <h3 className={`text-xl font-bold mt-1 ${stat.valueColor}`}>{stat.value}</h3>
              <p className={`text-[10px] mt-0.5 ${stat.subtextColor || 'text-slate-500'}`}>{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Grid 2: Expiring & Expired Driver Passes */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <DataTable<DriverSubscription>
          columns={subscriptionPassColumns}
          data={expiredOrExpiringSubscriptions}
          keyExtractor={(sub) => sub.id}
          pageSize={5}
          isLoading={isLoading}
          serverPagination={{
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            onPageChange: (page) => { },
          }}
          emptyMessage="No expired or expiring driver passes found."
          rowClassName={(sub) =>
            sub.subscriptionStatus === 'Expiring Soon'
              ? 'bg-amber-50/70 hover:bg-amber-100/80 border-l-4 border-l-amber-500'
              : sub.subscriptionStatus === 'Expired'
                ? 'bg-rose-50/70 hover:bg-rose-100/80 border-l-4 border-l-rose-500'
                : sub.subscriptionStatus === 'Active'
                  ? 'bg-emerald-50/40 hover:bg-emerald-100/60 border-l-4 border-l-emerald-500'
                  : 'bg-slate-100/70 hover:bg-slate-200/70 border-l-4 border-l-slate-400'
          }
          headerActions={
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Expiring & Expired Driver Passes
              </h3>
              <Link
                href="/admin/driver-subscriptions"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 hover:underline transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>View All Subscriptions </span>
              </Link>
            </div>
          }
        />
      </div>

      {/* Grid 3: Recent Driver Bookings */}
      <div className="space-y-4">
        <DataTable<DriverBooking>
          columns={recentBookingColumns}
          data={recentDriverBookings}
          keyExtractor={(b) => b.id}
          pageSize={5}
          isLoading={isLoading}
          serverPagination={{
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            onPageChange: (page) => { },
          }}
          emptyMessage="No recent driver bookings recorded."
          headerActions={
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary" /> Recent Driver Bookings
              </h3>
              <Link
                href="/admin/driver-bookings"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 hover:underline transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>View All Driver Bookings</span>
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
