'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useToast } from '@/context/ToastContext';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Transaction } from '@/types';
import {
  Receipt,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Eye,
  Filter,
  RefreshCw,
  Clock,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export default function TransactionsView() {
  const { customers } = useRentalStore();
  const { toast } = useToast();
  const {
    transactions,
    stats,
    pagination,
    isLoading,
    serviceFilter,
    statusFilter,
    setServiceFilter,
    setStatusFilter,
    fetchTransactions,
  } = useTransactionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input (350ms) to ensure smooth live typing and prevent backend overloading
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load/re-fetch transactions dynamically whenever search, category, or status changes
  useEffect(() => {
    fetchTransactions({
      page: 1,
      limit: pagination?.limit || 8,
      search: debouncedSearch.trim(),
      serviceType: serviceFilter,
      status: statusFilter,
    });
  }, [debouncedSearch, serviceFilter, statusFilter, fetchTransactions]);

  // Handle service filter change
  const handleServiceFilterChange = (val: string) => {
    setServiceFilter(val);
  };

  // Handle status filter change
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
  };

  // Manual refresh
  const handleRefresh = async () => {
    const res = await fetchTransactions(
      {
        page: 1,
        limit: pagination?.limit || 8,
        search: debouncedSearch.trim() || undefined,
        serviceType: serviceFilter,
        status: statusFilter,
      },
      false
    );
    if (res.success) {
      toast.success('Transactions Refreshed', 'Latest financial logs loaded.');
    } else {
      toast.error('Refresh Failed', res.error || 'Failed to refresh transactions.');
    }
  };

  // Stats calculation (from API stats or fallback to current list)
  const totalRevenue =
    stats?.totalRevenue ??
    transactions.filter((t) => t.status === 'Success').reduce((acc, curr) => acc + curr.amount, 0);

  const totalCommission =
    stats?.totalCommission ??
    transactions
      .filter((t) => t.status === 'Success')
      .reduce((acc, curr) => acc + curr.platformCommission, 0);

  const totalPayout =
    stats?.totalPayout ??
    transactions.filter((t) => t.status === 'Success').reduce((acc, curr) => acc + curr.payoutAmount, 0);

  const totalCount = stats?.totalCount ?? (pagination?.total || transactions.length);
  const successCount =
    stats?.successCount ?? transactions.filter((t) => t.status === 'Success').length;
  const successRate =
    stats?.successRate ?? (totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100);

  const getServiceBadgeStyle = (serviceType: string) => {
    switch (serviceType) {
      case 'Driver Local':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      case 'Driver Outstation':
        return 'bg-sky-50 text-sky-800 border-sky-200 font-bold';
      case 'Valet Staff':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'Subscription':
      case 'Driver Subscription':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 font-medium';
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'Success':
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

  const columns: Column<Transaction>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (t) => (
        <Link
          href={`/admin/transactions/${t.id || (t as any)._id}`}
          className="font-mono font-bold text-slate-900 hover:text-primary hover:underline text-xs flex items-center gap-1 cursor-pointer"
        >
          {t.transactionId}
        </Link>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service Category',
      render: (t) => (
        <span
          className={`px-2.5 py-1 rounded text-[10.5px] border ${getServiceBadgeStyle(
            t.serviceType
          )}`}
        >
          {t.serviceType}
        </span>
      ),
    },
    {
      key: 'customerOrDriverName',
      header: 'Customer / Driver',
      render: (t) => {
        const matchedCust = customers.find(
          (c) =>
            c.name?.toLowerCase() === t.customerOrDriverName?.toLowerCase() ||
            c.id === (t as any).customerId
        );
        return matchedCust ? (
          <Link
            href={`/admin/customers/${matchedCust.id}`}
            className="font-bold text-slate-900 hover:text-primary hover:underline text-xs cursor-pointer"
          >
            {t.customerOrDriverName}
          </Link>
        ) : (
          <span className="font-bold text-slate-900 text-xs">{t.customerOrDriverName}</span>
        );
      },
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (t) => <span className="text-slate-700 font-medium text-xs">{t.method || 'Online'}</span>,
    },
    {
      key: 'date',
      header: 'Date & Timestamp',
      render: (t) => (
        <span className="text-slate-500 font-medium text-[11px]">{t.date || (t as any).paymentDate || '--'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Total Amount',
      align: 'right',
      render: (t) => (
        <span className="font-bold text-slate-900 text-xs">
          ₹{(t.amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'platformCommission',
      header: 'Commission / Payout',
      align: 'right',
      render: (t) => (
        <div className="text-right text-[11px]">
          <span className="font-bold text-indigo-700 block">
            +₹{(t.platformCommission || 0).toLocaleString('en-IN')} Comm
          </span>
          <span className="text-slate-500 text-[10px]">
            Payout: ₹{(t.payoutAmount || 0).toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (t) => (
        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold border ${getStatusBadge(t.status)}`}
        >
          {t.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (t) => (
        <Link
          href={`/admin/transactions/${t.id || (t as any)._id}`}
          className="p-1.5 bg-primary hover:bg-primary-hover text-white rounded-md border border-primary/20 transition-all inline-flex items-center justify-center shadow-2xs cursor-pointer"
          title="View Transaction Details"
        >
          <Eye className="w-3.5 h-3.5 text-gold-300" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Individual Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div
          onClick={() => handleStatusFilterChange('All')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'All'
            ? 'ring-2 ring-primary border-transparent shadow-xs'
            : 'hover:border-slate-300'
            }`}
          title="Click to view all transaction records"
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Volume Processed
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              {totalCount} Total Logs
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Platform Net Commission */}
        <div className="card-white p-4 flex items-center justify-between hover:shadow-xs transition-all">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-700 block">
              Platform Net Commission
            </span>
            <div className="text-xl font-bold text-indigo-700 mt-1">
              ₹{totalCommission.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Net Revenue Retained
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Driver & Valet Payouts */}
        <div className="card-white p-4 flex items-center justify-between hover:shadow-xs transition-all">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 block">
              Driver & Valet Payouts
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              ₹{totalPayout.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Direct Earnings Disbursed
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Success Verification */}
        <div
          onClick={() => handleStatusFilterChange('Success')}
          className={`card-white p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Success'
            ? 'ring-2 ring-emerald-600 border-transparent shadow-xs'
            : 'hover:border-emerald-200'
            }`}
          title="Click to filter successful transactions"
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Success Verification
            </span>
            <div className="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{successCount} Success</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              {successRate}% Gateway Rate
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Transactions DataTable */}
      <DataTable<Transaction>
        columns={columns}
        data={transactions}
        keyExtractor={(t) => t.id || (t as any)._id || t.transactionId || String(Math.random())}
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
                fetchTransactions({
                  page: newPage,
                  limit: pagination.limit,
                  search: debouncedSearch.trim(),
                  serviceType: serviceFilter,
                  status: statusFilter,
                }),
              onPageSizeChange: (newLimit) =>
                fetchTransactions({
                  page: 1,
                  limit: newLimit,
                  search: debouncedSearch.trim(),
                  serviceType: serviceFilter,
                  status: statusFilter,
                }),
            }
            : undefined
        }
        searchPlaceholder="Search transaction ID, customer/driver name, payment method, service..."
        emptyMessage="No payment transactions match the selected criteria."
        headerActions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Category:
            </div>
            <select
              value={serviceFilter}
              onChange={(e) => handleServiceFilterChange(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
            >
              <option value="All">All Services</option>
              <option value="Driver Local">Driver Local</option>
              <option value="Driver Outstation">Driver Outstation</option>
              <option value="Valet Staff">Valet Staff</option>
              <option value="Subscription">Subscription</option>
            </select>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 ml-1">
              Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
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
          </div>
        }
      />
    </div>
  );
}

