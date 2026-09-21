'use client';

import React from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
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
} from 'lucide-react';

export default function DashboardView() {
  const {
    driverBookings,
    valetBookings,
    drivers,
    valetStaff,
    driverSubscriptions,
    transactions,
    setActiveTab,
    setSelectedDriverBookingId,
    setSelectedValetBookingId,
    setSelectedDriverId,
  } = useRentalStore();

  // Metrics Calculations
  const totalDriverBookings = driverBookings.length;
  const totalValetBookings = valetBookings.length;
  const totalBookings = totalDriverBookings + totalValetBookings;

  const activeDriverTrips = driverBookings.filter(
    (b) => b.status === 'Driver Assigned' || b.status === 'Driver Arriving' || b.status === 'Service Started'
  ).length;

  const searchingDriverBookings = driverBookings.filter((b) => b.status === 'Searching Driver' || b.status === 'Pending');

  const completedBookingsCount =
    driverBookings.filter((b) => b.status === 'Completed').length +
    valetBookings.filter((v) => v.status === 'Completed').length;

  const cancelledBookingsCount =
    driverBookings.filter((b) => b.status === 'Cancelled').length +
    valetBookings.filter((v) => v.status === 'Cancelled').length;

  const localDriverBookings = driverBookings.filter((b) => b.bookingType === 'Local').length;
  const outstationDriverBookings = driverBookings.filter((b) => b.bookingType === 'Outstation').length;

  const totalGrossRevenue = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPlatformCommission = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, curr) => acc + curr.platformCommission, 0);

  const activeDriversCount = drivers.filter((d) => d.status === 'Approved').length;
  const availableDriversCount = drivers.filter((d) => d.dutyStatus === 'Online' && d.availability === 'Available').length;
  const busyDriversCount = drivers.filter((d) => d.availability === 'Busy').length;

  const activeSubscribedDrivers = drivers.filter(
    (d) => d.subscription.status === 'Active' || d.subscription.status === 'Expiring Soon'
  ).length;

  const expiredSubscribedDrivers = drivers.filter((d) => d.subscription.status === 'Expired').length;

  const availableValetStaffCount = valetStaff.filter((s) => s.status === 'Available').length;
  const assignedValetStaffCount = valetStaff.filter((s) => s.status === 'Assigned' || s.status === 'On Duty').length;

  const pendingValetEvents = valetBookings.filter(
    (v) => v.status === 'New Request' || v.status === 'Pending Assignment' || v.status === 'Partially Assigned'
  );

  const expiredOrExpiringSubscriptions = driverSubscriptions.filter(
    (s) => s.subscriptionStatus === 'Expired' || s.subscriptionStatus === 'Expiring Soon'
  );

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
      subtext: '+16.4% this month',
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
          ₹{b.pricing.totalCustomerAmount.toLocaleString('en-IN')}
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
            className="p-1.5 bg-primary-light hover:bg-primary text-primary hover:text-white rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
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
            className="w-7 h-7 rounded-full object-cover shrink-0"
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
            href={`/admin/drivers/${sub.driverId}`}
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
      </div>

      {/* Single Unified Stats Card Band */}
      <div className="card-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
          {statsMetrics.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className={`sm:px-3 space-y-1 ${idx > 0 ? 'pt-3 sm:pt-0' : ''}`}>
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
      </div>

      {/* Grid 2: Service Breakdown & Subscription Health */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {/* Service Split & Driver Subscription Status */}
        {/* <div className="card-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Driver Subscription Eligibility
            </h3>
            <button
              onClick={() => setActiveTab('driver-subscriptions')}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
              <span className="text-[10px] text-emerald-800 font-bold block">Active Subscriptions</span>
              <span className="text-lg font-bold text-emerald-700">{activeSubscribedDrivers} Drivers</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Eligible for incoming requests</span>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
              <span className="text-[10px] text-rose-800 font-bold block">Expired Subscriptions</span>
              <span className="text-lg font-bold text-rose-700">{expiredSubscribedDrivers} Drivers</span>
              <span className="text-[10px] text-rose-600 block mt-0.5">Blocked from new requests</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Local Driver Bookings:</span>
              <span className="font-bold text-slate-900">{localDriverBookings} orders</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Outstation Driver Bookings:</span>
              <span className="font-bold text-slate-900">{outstationDriverBookings} orders</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-slate-200">
              <span className="text-slate-600">Valet Event Bookings:</span>
              <span className="font-bold text-primary">{totalValetBookings} events</span>
            </div>
          </div>
        </div> */}

        {/* Expiring & Expired Driver Passes Table */}
        <DataTable<DriverSubscription>
          columns={subscriptionPassColumns}
          data={expiredOrExpiringSubscriptions}
          keyExtractor={(sub) => sub.id}
          pageSize={5}
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
                <span>View All Subscriptions ({driverSubscriptions.length})</span>
              </Link>
            </div>
          }
        />
      </div>

      {/* Grid 3: Recent Driver Bookings */}
      <div className="space-y-4">
        <DataTable<DriverBooking>
          columns={recentBookingColumns}
          data={driverBookings.slice(0, 5)}
          keyExtractor={(b) => b.id}
          pageSize={5}
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
                <span>View All Driver Bookings ({driverBookings.length})</span>
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
