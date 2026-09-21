'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { CreditCard, Search, Download, CheckCircle2, SlidersHorizontal } from 'lucide-react';

import DataTable, { Column } from '@/components/ui/DataTable';
import { SubscriptionPayment } from '@/types';

export default function SubscriptionPaymentsView() {
  const { subscriptionPayments, setActiveTab, setSelectedDriverId } = useRentalStore();

  const totalPassRevenue = subscriptionPayments
    .filter((sp) => sp.status === 'Successful')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const columns: Column<SubscriptionPayment>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (sp) => <span className="font-mono font-bold text-slate-900">{sp.transactionId}</span>,
    },
    {
      key: 'driverName',
      header: 'Driver Name',
      render: (sp) => (
        <button
          onClick={() => {
            setSelectedDriverId(sp.driverId);
            setActiveTab('driver-details');
          }}
          className="font-bold text-slate-900 hover:text-primary hover:underline text-left"
        >
          {sp.driverName}
        </button>
      ),
    },
    {
      key: 'planName',
      header: 'Subscription Plan',
      render: (sp) => <span className="font-semibold text-slate-800">{sp.planName}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (sp) => (
        <span className="font-bold text-slate-900">
          ₹{sp.amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (sp) => <span className="text-slate-600 font-medium">{sp.paymentMethod}</span>,
    },
    {
      key: 'paymentDate',
      header: 'Date & Time',
      render: (sp) => <span className="text-slate-500">{sp.paymentDate}</span>,
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (sp) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${sp.status === 'Successful'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
        >
          {sp.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Single Unified Stats Card Band */}
      <div className="card-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
          <div className="sm:px-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total Pass Revenue</span>
            <div className="text-xl font-bold text-slate-900">
              ₹{totalPassRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Platform Retained</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Completed Transactions</span>
            <div className="text-xl font-bold text-emerald-700">
              {subscriptionPayments.filter((sp) => sp.status === 'Successful').length} Paid
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Razorpay UPI / Cards</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary block">Active Pass Plan</span>
            <div className="text-xl font-bold text-primary">Driver Monthly Pass</div>
            <span className="text-[10px] text-slate-500 font-medium">₹999 / Month</span>
          </div>
        </div>
      </div>

      {/* Filter & Table */}
      <DataTable<SubscriptionPayment>
        columns={columns}
        data={subscriptionPayments}
        keyExtractor={(sp) => sp.id}
        pageSize={8}
        searchPlaceholder="Search transaction ID, driver, plan..."
        searchFilterKeys={['transactionId', 'driverName', 'planName']}
        emptyMessage="No subscription payment records found."
      // headerActions={
      //   <button
      //     onClick={() => setActiveTab('driver-subscription-plans')}
      //     className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 hover:underline transition-colors"
      //   >
      //     <SlidersHorizontal className="w-3.5 h-3.5" />
      //     <span>Configure Subscription Rates</span>
      //   </button>
      // }
      />
    </div>
  );
}
