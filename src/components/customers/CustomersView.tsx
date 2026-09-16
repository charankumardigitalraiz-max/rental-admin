'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Search, Eye, Phone, Mail, UserX, UserCheck } from 'lucide-react';

import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Customer } from '@/types';

export default function CustomersView() {
  const { customers, toggleCustomerStatus, setActiveTab, setSelectedCustomerId } = useRentalStore();

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
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/customers/${c.id}`}
            className="p-1.5 text-primary hover:bg-primary-light rounded transition-colors inline-block"
            title="View Customer Profile & History"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => toggleCustomerStatus(c.id)}
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
            <span className="text-[10px] text-slate-400 font-medium">Registered Accounts</span>
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
    </div>
  );
}
