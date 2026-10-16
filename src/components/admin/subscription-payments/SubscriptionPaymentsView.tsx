'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSubscriptionPaymentStore } from '@/store/useSubscriptionPaymentStore';
import { useToast } from '@/context/ToastContext';
import DataTable, { Column } from '@/components/ui/DataTable';
import { SubscriptionPayment } from '@/types';
import {
  CreditCard,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';

export default function SubscriptionPaymentsView() {
  const { toast } = useToast();
  const {
    subscriptionPayments,
    stats,
    pagination,
    isLoading,
    statusFilter,
    setStatusFilter,
    fetchSubscriptionPayments,
  } = useSubscriptionPaymentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load/re-fetch subscription payments dynamically
  useEffect(() => {
    fetchSubscriptionPayments({
      page: 1,
      limit: pagination?.limit || 8,
      search: debouncedSearch.trim(),
      status: statusFilter,
    });
  }, [debouncedSearch, statusFilter, fetchSubscriptionPayments]);

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
  };

  const handleRefresh = async () => {
    const res = await fetchSubscriptionPayments(
      {
        page: 1,
        limit: pagination?.limit || 8,
        search: debouncedSearch.trim(),
        status: statusFilter,
      },
      false
    );
    if (res.success) {
      toast.success('Payments Refreshed', 'Latest subscription payments loaded.');
    } else {
      toast.error('Refresh Failed', res.error || 'Failed to refresh records.');
    }
  };

  // Stat metrics with fallback to local calculations
  const totalPassRevenue =
    stats?.totalPassRevenue ??
    subscriptionPayments
      .filter((sp) => sp.status === 'Successful')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const completedCount =
    stats?.completedCount ??
    subscriptionPayments.filter((sp) => sp.status === 'Successful').length;

  const pendingCount =
    stats?.pendingCount ??
    subscriptionPayments.filter((sp) => sp.status === 'Pending').length;

  const activePlanName = stats?.activePlanName || 'Driver Monthly Pass';
  const activePlanPrice = stats?.activePlanPrice || 999;

  const getStatusBadge = (status: SubscriptionPayment['status']) => {
    switch (status) {
      case 'Successful':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Refunded':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const columns: Column<SubscriptionPayment>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (sp) => (
        <Link
          href={`/admin/transactions/${sp.id || (sp as any)._id || sp.transactionId}`}
          className="font-mono font-bold text-slate-900 hover:text-primary hover:underline text-xs flex items-center gap-1 cursor-pointer"
        >
          {sp.transactionId}
        </Link>
      ),
    },
    {
      key: 'driverName',
      header: 'Driver Name',
      render: (sp) => {
        const profileId = sp.driverId;
        return profileId ? (
          <Link
            href={`/admin/drivers/${profileId}`}
            className="font-bold text-slate-900 hover:text-primary hover:underline text-xs"
          >
            {sp.driverName}
          </Link>
        ) : (
          <span className="font-bold text-slate-900 text-xs">{sp.driverName}</span>
        );
      },
    },
    {
      key: 'planName',
      header: 'Subscription Plan',
      render: (sp) => (
        <span className="font-semibold text-slate-800 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded text-[11px]">
          {sp.planName}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (sp) => (
        <span className="font-bold text-slate-900 text-xs">
          ₹{(sp.amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (sp) => (
        <span className="text-slate-700 font-medium text-xs">
          {sp.paymentMethod || 'UPI'}
        </span>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Date & Time',
      render: (sp) => (
        <span className="text-slate-500 font-medium text-[11px]">
          {sp.paymentDate || '--'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (sp) => (
        <span
          className={`px-2.5 py-1 rounded text-[10.5px] font-bold border ${getStatusBadge(
            sp.status
          )}`}
        >
          {sp.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (sp) => (
        <Link
          href={`/admin/transactions/${sp.id || (sp as any)._id || sp.transactionId}`}
          className="p-1.5 bg-primary-light hover:bg-primary text-primary hover:text-white rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
          title="View Transaction Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Standalone Interactive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pass Revenue */}
        <div className="card-white p-4 flex items-center justify-between hover:shadow-xs transition-all">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Pass Revenue
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              ₹{totalPassRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              100% Platform Retained
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Transactions */}
        <div
          // onClick={() => handleStatusFilterChange('Successful')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Successful'
            ? 'ring-2 ring-emerald-600 border-transparent shadow-xs'
            : 'hover:border-emerald-200'
            }`}
          title="Click to filter completed payments"
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Completed Passes
            </span>
            <div className="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              <span>{completedCount} Paid</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Razorpay UPI / Cards
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Clearance */}
        <div
          // onClick={() => handleStatusFilterChange('Pending')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Pending'
            ? 'ring-2 ring-amber-500 border-transparent shadow-xs'
            : 'hover:border-amber-200'
            }`}
          title="Click to filter pending payments"
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Pending Clearance
            </span>
            <div className="text-xl font-bold text-amber-700 mt-1 flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-amber-600" />
              <span>{pendingCount} Pending</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Awaiting Gateway Callback
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Primary Pass Plan */}
        <div className="card-white p-4 flex items-center justify-between hover:shadow-xs transition-all">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Primary Active Plan
            </span>
            <div className="text-base font-bold text-slate-900 mt-1 truncate max-w-[160px]">
              {activePlanName}
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              ₹{activePlanPrice.toLocaleString('en-IN')} / Month Standard
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Subscription Payments DataTable */}
      <DataTable<SubscriptionPayment>
        columns={columns}
        data={subscriptionPayments}
        keyExtractor={(sp) => sp.id || (sp as any)._id || sp.transactionId || String(Math.random())}
        pageSize={pagination?.limit || 8}
        pageSizeOptions={[5, 8, 15, 30, 50]}
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
                fetchSubscriptionPayments({
                  page: newPage,
                  limit: pagination.limit,
                  search: debouncedSearch.trim(),
                  status: statusFilter,
                }),
              onPageSizeChange: (newLimit) =>
                fetchSubscriptionPayments({
                  page: 1,
                  limit: newLimit,
                  search: debouncedSearch.trim(),
                  status: statusFilter,
                }),
            }
            : undefined
        }
        searchPlaceholder="Search transaction ID, driver name, plan, method..."
        emptyMessage="No subscription payment records match the selected criteria."
        headerActions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
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

            {/* Configure Subscription Rates Shortcut */}
            {/* <Link
              href="/admin/driver-subscription-plans"
              className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-light hover:bg-primary/10 border border-primary/20 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Configure Plans</span>
            </Link> */}
          </div>
        }
      />
    </div>
  );
}
