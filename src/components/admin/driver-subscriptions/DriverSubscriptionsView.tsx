'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import { DriverSubscription } from '@/types';
import { useDriverSubscriptionStore } from '@/store/useDriverSubscriptionStore';
import { useToast } from '@/context/ToastContext';
import {
  Award,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Phone,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export default function DriverSubscriptionsView() {
  const { toast } = useToast();
  const {
    subscriptions,
    stats,
    pagination,
    isLoading,
    isUpdating,
    statusFilter,
    setStatusFilter,
    fetchDriverSubscriptions,
    updateSubscriptionStatus,
  } = useDriverSubscriptionStore();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input (350ms) to ensure smooth live typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load/re-fetch subscriptions dynamically whenever debouncedSearch or statusFilter changes
  useEffect(() => {
    fetchDriverSubscriptions({
      page: 1,
      limit: pagination?.limit || 8,
      search: debouncedSearch.trim(),
      status: statusFilter,
    });
  }, [debouncedSearch, statusFilter, fetchDriverSubscriptions]);

  // Handle filter dropdown changes
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  // Manual refresh
  const handleRefresh = async () => {
    const res = await fetchDriverSubscriptions(
      {
        page: 1,
        limit: pagination?.limit || 8,
        search: debouncedSearch.trim(),
        status: statusFilter,
      },
      false
    );
    if (res.success) {
      toast.success('Subscriptions Refreshed', 'Latest driver passes loaded.');
    } else {
      toast.error('Refresh Failed', res.error || 'Failed to refresh subscriptions.');
    }
  };

  // Quick status update for a subscription
  const handleStatusUpdate = async (sub: DriverSubscription, newStatus: DriverSubscription['subscriptionStatus']) => {
    if (sub.subscriptionStatus === newStatus) return;
    setUpdatingId(sub.id);
    const res = await updateSubscriptionStatus(sub.id, newStatus);
    setUpdatingId(null);
    if (res.success) {
      toast.success('Pass Status Updated', `${sub.driverName}'s pass is now "${newStatus}"`);
    } else {
      toast.error('Update Failed', res.error || 'Could not update subscription status');
    }
  };

  // Metric stats (using global stats from API, with fallback to calculating from current list)
  const totalSubscriptions = stats?.totalSubscriptions ?? subscriptions.length;
  const activePasses =
    stats?.activePasses ?? subscriptions.filter((s) => s.subscriptionStatus === 'Active').length;
  const expiringSoonPasses =
    stats?.expiringSoonPasses ?? subscriptions.filter((s) => s.subscriptionStatus === 'Expiring Soon').length;
  const expiredPasses =
    stats?.expiredPasses ?? subscriptions.filter((s) => s.subscriptionStatus === 'Expired').length;

  const totalPassRevenue =
    stats?.totalPassRevenue ??
    subscriptions
      .filter((s) => s.paymentStatus === 'Successful')
      .reduce((acc, s) => acc + (s.amount || 0), 0);

  const activePassRevenue =
    stats?.activePassRevenue ??
    subscriptions
      .filter((s) => s.subscriptionStatus === 'Active' && s.paymentStatus === 'Successful')
      .reduce((acc, s) => acc + (s.amount || 0), 0);

  const statuses = ['All', 'Active', 'Expiring Soon', 'Expired', 'Cancelled', 'Suspended'];

  const columns: Column<DriverSubscription>[] = [
    {
      key: 'driverName',
      header: 'Driver',
      render: (sub) => (
        <div className="flex items-center gap-2.5">
          <img
            src={
              sub.driverAvatar ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
            }
            alt={sub.driverName}
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
          />
          <div>
            <span className="font-bold text-slate-900 block leading-tight">{sub.driverName}</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
              <span>{sub.driverId || 'ID: --'}</span>
              {(sub as any).driverPhone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                    {(sub as any).driverPhone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Subscription Plan',
      render: (sub) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">{sub.planName}</span>
          {(sub as any).transactionId && (
            <span className="text-[10px] text-slate-400 font-mono block">
              {(sub as any).transactionId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (sub) => <span className="text-slate-600 text-xs">{sub.startDate || '--'}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (sub) => {
        const isExpiringSoon = sub.subscriptionStatus === 'Expiring Soon';
        const isExpired = sub.subscriptionStatus === 'Expired';
        return (
          <div>
            <span className="font-semibold text-slate-800 text-xs block">{sub.expiryDate || '--'}</span>
            {isExpiringSoon && (
              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 mt-0.5">
                <Clock className="w-2.5 h-2.5" /> Renew soon
              </span>
            )}
            {isExpired && (
              <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5 mt-0.5">
                <AlertCircle className="w-2.5 h-2.5" /> Expired
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: 'Pass Fee',
      render: (sub) => (
        <span className="font-bold text-slate-900 text-xs">
          ₹{(sub.amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (sub) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.paymentStatus === 'Successful'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : sub.paymentStatus === 'Pending'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
        >
          {sub.paymentStatus}
        </span>
      ),
    },
    {
      key: 'subscriptionStatus',
      header: 'Pass Status',
      render: (sub) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.subscriptionStatus === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : sub.subscriptionStatus === 'Expiring Soon'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : sub.subscriptionStatus === 'Expired'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : sub.subscriptionStatus === 'Suspended'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
        >
          {sub.subscriptionStatus}
        </span>
      ),
    },
    {
      key: 'tripActivity',
      header: 'Trip Activity',
      render: (sub) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">
            {sub.completedBookings || 0} Completed
          </div>
          <div className="text-[10px] text-slate-400">
            {sub.bookingsReceived || 0} Requests Received
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (sub) => {
        const profileId = sub.driverMongoId || (sub as any).driverMongoId || sub.id;
        return (
          <div className="flex justify-center">
            <Link
              href={`/admin/drivers/${profileId}`}
              className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-md shadow-2xs transition-all inline-flex items-center gap-1 cursor-pointer"
              title="View Driver Profile"
            >
              <Eye className="w-3.5 h-3.5 text-gold-300" /> Profile
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Individual Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscriptions */}
        <div
          onClick={() => handleStatusFilterChange('All')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'All'
            ? 'ring-2 ring-primary border-transparent shadow-xs'
            : 'hover:border-slate-300'
            }`}
          title="Click to view all enrolled passes"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pass Revenue
            </p>
            <h4 className="text-xl font-bold text-slate-900 mt-1">
              ₹{totalPassRevenue.toLocaleString('en-IN')}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {totalSubscriptions} Enrolled Passes
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Active Passes */}
        <div
          onClick={() => handleStatusFilterChange('Active')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Active'
            ? 'ring-2 ring-emerald-600 border-transparent shadow-xs'
            : 'hover:border-emerald-200'
            }`}
          title="Click to filter active passes"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Passes
            </p>
            <h4 className="text-xl font-bold text-emerald-700 mt-1">{activePasses} Active</h4>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              ₹{activePassRevenue.toLocaleString('en-IN')} Active Revenue
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => handleStatusFilterChange('Expiring Soon')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Expiring Soon'
            ? 'ring-2 ring-amber-500 border-transparent shadow-xs'
            : 'hover:border-amber-200'
            }`}
          title="Click to filter passes expiring soon"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Expiring Soon
            </p>
            <h4 className="text-xl font-bold text-amber-700 mt-1">{expiringSoonPasses}</h4>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Requires pass renewal</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Expired Passes */}
        <div
          onClick={() => handleStatusFilterChange('Expired')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Expired'
            ? 'ring-2 ring-rose-500 border-transparent shadow-xs'
            : 'hover:border-rose-200'
            }`}
          title="Click to filter expired passes"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Expired Passes
            </p>
            <h4 className="text-xl font-bold text-rose-700 mt-1">{expiredPasses}</h4>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">
              Ineligible for dispatches
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Driver Subscriptions Data Table */}
      <DataTable<DriverSubscription>
        columns={columns}
        data={subscriptions}
        keyExtractor={(sub) => sub.id || (sub as any)._id || String(Math.random())}
        pageSize={pagination?.limit || 8}
        pageSizeOptions={[5, 8, 15, 30]}
        isLoading={isLoading}
        minLoadingDurationMs={300}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
        }}
        serverSearch={true}
        serverPagination={
          pagination
            ? {
              currentPage: pagination.page,
              totalPages: pagination.totalPages,
              totalItems: pagination.total,
              onPageChange: (newPage) =>
                fetchDriverSubscriptions({
                  page: newPage,
                  limit: pagination.limit,
                  search: debouncedSearch.trim(),
                  status: statusFilter,
                }),
              onPageSizeChange: (newLimit) =>
                fetchDriverSubscriptions({
                  page: 1,
                  limit: newLimit,
                  search: debouncedSearch.trim(),
                  status: statusFilter,
                }),
            }
            : undefined
        }
        rowClassName={(sub) =>
          sub.subscriptionStatus === 'Expiring Soon'
            ? 'bg-amber-50/60 hover:bg-amber-100/70 border-l-4 border-l-amber-500'
            : sub.subscriptionStatus === 'Expired'
              ? 'bg-rose-50/60 hover:bg-rose-100/70 border-l-4 border-l-rose-500'
              : sub.subscriptionStatus === 'Active'
                ? 'bg-emerald-50/30 hover:bg-emerald-100/50 border-l-4 border-l-emerald-500'
                : 'bg-slate-100/60 hover:bg-slate-200/60 border-l-4 border-l-slate-400'
        }
        searchPlaceholder="Search driver name, phone, plan or ID..."
        searchFilterKeys={['driverName', 'planName', 'driverId'] as any}
        emptyMessage="No driver subscription records match the selected criteria."
        headerActions={
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Manage Subscription Plans */}
            {/* <Link
              href="/admin/driver-subscription-plans"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all w-full sm:w-auto justify-center cursor-pointer"
            >
              <Award className="w-4 h-4 text-gold-300" />
              <span>Subscription Plans</span>
            </Link> */}
          </div>
        }
      />
    </div>
  );
}

