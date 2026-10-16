'use client';

import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import { Eye, UserX, UserCheck, RefreshCw, Filter } from 'lucide-react';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Customer } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function CustomersView() {
  const { toast } = useToast();
  const {
    customers,
    isLoading,
    error,
    counts,
    pagination,
    fetchCustomers,
    toggleCustomerStatus,
  } = useCustomerStore();

  const [statusConfirmCustomer, setStatusConfirmCustomer] = useState<Customer | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const PAGE_LIMIT = 10;

  // Debounce search query to prevent excessive backend queries (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Dynamic server fetch — runs on mount and whenever page, filter, or search changes
  useEffect(() => {
    fetchCustomers({
      page: currentPage,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    });
  }, [currentPage, statusFilter, debouncedSearch, fetchCustomers]);

  const handleStatusFilter = (val: 'all' | 'true' | 'false') => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  // Stats from API response counts
  const totalCustomers = counts?.total ?? customers.length;
  const activeCustomersCount = counts?.active ?? customers.filter((c) => c.status === 'Active').length;
  const inactiveCustomersCount = counts?.inactive ?? customers.filter((c) => c.status !== 'Active').length;
  const newThisMonth = counts?.newThisMonth ?? 0;

  const columns: Column<Customer>[] = [
    {
      key: 'id',
      header: 'Customer ID',
      render: (c) => <span className="font-mono font-bold text-slate-800 text-[11px]">{c.custId || c.id}</span>,
    },
    {
      key: 'name',
      header: 'Name & Phone',
      className: 'min-w-[180px]',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <img
            src={c.avatar}
            alt={c.name}
            className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-emerald-100"
          />
          <div>
            <div className="font-bold text-slate-900">{c.name}</div>
            <div className="text-[10px] text-slate-400 font-medium">{c.phone || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      render: (c) => <span className="text-slate-600 font-medium">{c.email}</span>,
    },
    {
      key: 'joinedDate',
      header: 'Joined On',
      render: (c) => <span className="text-slate-500 text-[11px] font-medium">{c.joinedDate || 'N/A'}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      render: (c) => (
        <span className="text-slate-600 text-[11px] max-w-[160px] truncate block" title={c.address}>
          {c.address || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (c) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'Active'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
        >
          {c.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (c) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/admin/customers/${c.mongoId || c.id}`}
            className="px-2.5 py-1 bg-primary hover:bg-primary text-white hover:text-white text-[11px] font-bold rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center gap-1 shadow-2xs"
            title="View Customer Profile and History"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setStatusConfirmCustomer(c)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${c.status === 'Active'
              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
          >
            {c.status === 'Active' ? 'Suspend' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Individual Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total Customers</span>
          <div className="text-xl font-bold text-slate-900">{totalCustomers}</div>
          <span className="text-[10px] font-medium text-slate-400">Registered Accounts</span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Active Accounts</span>
          <div className="text-xl font-bold text-emerald-700">{activeCustomersCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Good Standing</span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700 block">Suspended Accounts</span>
          <div className="text-xl font-bold text-rose-700">{inactiveCustomersCount}</div>
          <span className="text-[10px] text-rose-600 font-medium">Restricted Access</span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary block">New This Month</span>
          <div className="text-xl font-bold text-primary">{newThisMonth}</div>
          <span className="text-[10px] text-slate-500 font-medium">Recent Registrations</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={customers}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        searchPlaceholder="Search customer name, phone, email, customer ID..."
        serverSearch={true}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        emptyMessage="No customer records found matching your search."
        serverPagination={{
          currentPage,
          totalPages: pagination?.totalPages ?? 1,
          totalItems: pagination?.total ?? customers.length,
          onPageChange: (page) => setCurrentPage(page),
        }}
        headerActions={
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchCustomers({
                  page: 1,
                  limit: PAGE_LIMIT,
                  search: debouncedSearch.trim() || undefined,
                  ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
                });
              }}
              disabled={isLoading}
              className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh Customers"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as 'all' | 'true' | 'false')}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Customers</option>
              <option value="true">Active Only</option>
              <option value="false">Suspended Only</option>
            </select>
          </div>
        }
      />

      {statusConfirmCustomer && (
        <Modal
          isOpen={!!statusConfirmCustomer}
          onClose={() => setStatusConfirmCustomer(null)}
          title={
            statusConfirmCustomer.status === 'Active'
              ? 'Confirm Customer Suspension'
              : 'Confirm Customer Activation'
          }
          subtitle="Account Status Management"
          icon={statusConfirmCustomer.status === 'Active' ? UserX : UserCheck}
          maxWidth="md"
          footer={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusConfirmCustomer(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const c = statusConfirmCustomer;
                  await toggleCustomerStatus(c.id);
                  const nextStatus = c.status === 'Active' ? 'Suspended' : 'Active';
                  if (nextStatus === 'Active') {
                    toast.success('Customer Activated', `Account for ${c.name} is now active.`);
                  } else {
                    toast.warning('Customer Suspended', `Account for ${c.name} has been suspended.`);
                  }
                  setStatusConfirmCustomer(null);
                }}
                className={`px-4 py-2 text-white font-bold rounded-lg text-xs shadow-xs transition-colors ${statusConfirmCustomer.status === 'Active'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
              >
                {statusConfirmCustomer.status === 'Active' ? 'Proceed with Suspension' : 'Proceed with Activation'}
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
              <img
                src={statusConfirmCustomer.avatar}
                alt={statusConfirmCustomer.name}
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-emerald-100"
              />
              <div>
                <div className="font-bold text-slate-900">{statusConfirmCustomer.name}</div>
                <div className="text-[11px] text-slate-500">
                  {statusConfirmCustomer.email} {statusConfirmCustomer.phone || 'N/A'}
                </div>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {statusConfirmCustomer.status === 'Active'
                ? `Are you sure you want to suspend the account for ${statusConfirmCustomer.name}? The customer will not be able to place new bookings while suspended.`
                : `Are you sure you want to activate the account for ${statusConfirmCustomer.name}? The customer will be restored to active status.`}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
