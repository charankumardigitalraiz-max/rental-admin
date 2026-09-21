'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Search, Eye, Phone, Mail, UserX, UserCheck } from 'lucide-react';

import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Customer } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function CustomersView() {
  const { toast } = useToast();
  const { customers, toggleCustomerStatus, setActiveTab, setSelectedCustomerId } = useRentalStore();
  const [statusConfirmCustomer, setStatusConfirmCustomer] = useState<Customer | null>(null);

  const totalCustomers = customers.length;
  const activeCustomersCount = customers.filter((c) => c.status === 'Active').length;
  const totalLifetimeRevenue = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const onTripCustomersCount = customers.filter((c) => c.currentBooking).length;

  const columns: Column<Customer>[] = [
    {
      key: 'id',
      header: 'Customer ID',
      render: (c) => <span className="font-mono font-bold text-slate-800">{c.id}</span>,
    },
    {
      key: 'name',
      header: 'Name & Phone',
      className: 'min-w-[180px]',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-emerald-100" />
          <div>
            <div className="font-bold text-slate-900">{c.name}</div>
            <div className="text-[10px] text-slate-400 font-medium">{c.phone}</div>
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
      key: 'totalBookings',
      header: 'Total Orders',
      render: (c) => (
        <span className="font-bold text-slate-900">
          {c.totalBookings} ({c.completedBookings} Completed • {c.cancelledBookings} Cancelled)
        </span>
      ),
    },
    {
      key: 'totalSpent',
      header: 'Total Spent (₹)',
      render: (c) => (
        <span className="font-bold text-primary">
          ₹{c.totalSpent.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'currentBooking',
      header: 'Current Booking',
      render: (c) =>
        c.currentBooking ? (
          <span className="font-mono font-bold text-xs text-primary bg-primary-light px-2 py-0.5 rounded">
            {c.currentBooking}
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">No active booking</span>
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
            href={`/admin/customers/${c.id}`}
            className="px-2.5 py-1 bg-primary-light hover:bg-primary text-primary hover:text-white text-[11px] font-bold rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center gap-1 shadow-2xs"
            title="View Customer Profile & History"
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
      {/* Single Unified Stats Card Band */}
      <div className="card-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
          <div className="sm:px-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total Customers</span>
            <div className="text-xl font-bold text-slate-900">{totalCustomers}</div>
            <span className="text-[10px] font-medium text-slate-400 ">Registered Accounts</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Active Accounts</span>
            <div className="text-xl font-bold text-emerald-700">{activeCustomersCount}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Good Standing</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary block">Lifetime Revenue</span>
            <div className="text-xl font-bold text-primary">₹{totalLifetimeRevenue.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500 font-medium">Total Customer Spend</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-sky-700 block">Active On-Trip</span>
            <div className="text-xl font-bold text-sky-700">{onTripCustomersCount}</div>
            <span className="text-[10px] text-sky-600 font-medium">Currently Booking</span>
          </div>
        </div>
      </div>

      <DataTable<Customer>
        columns={columns}
        data={customers}
        keyExtractor={(c) => c.id}
        pageSize={8}
        searchPlaceholder="Search customer name, phone, email..."
        searchFilterKeys={['name', 'phone', 'email']}
        emptyMessage="No customer records found matching your search."
      />

      {/* Account Status Change Confirmation Modal */}
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
                onClick={() => {
                  const c = statusConfirmCustomer;
                  toggleCustomerStatus(c.id);
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
                {statusConfirmCustomer.status === 'Active'
                  ? 'Proceed with Suspension'
                  : 'Proceed with Activation'}
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
                  {statusConfirmCustomer.email} • {statusConfirmCustomer.phone}
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
