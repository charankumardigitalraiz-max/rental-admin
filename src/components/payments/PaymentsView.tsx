'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Payment } from '@/types';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Download } from 'lucide-react';

export default function PaymentsView() {
  const { payments } = useRentalStore();

  const totalSuccessAmount = payments
    .filter((p) => p.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const paymentColumns: Column<Payment>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (p) => <span className="font-mono font-bold text-slate-800">{p.transactionId}</span>,
    },
    {
      key: 'bookingId',
      header: 'Order Ref',
      render: (p) => <span className="font-semibold text-slate-900">{p.bookingId}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (p) => <span className="font-medium text-slate-800">{p.customerName}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      render: (p) => (
        <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px]">
          {p.method}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      render: (p) => <span className="font-bold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            p.status === 'Success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (p) => <span className="text-slate-500">{p.date}</span>,
    },
    {
      key: 'actions',
      header: 'Invoice',
      align: 'right',
      render: () => (
        <button className="text-primary hover:text-primary-hover font-semibold flex items-center justify-end gap-1 ml-auto">
          <Download className="w-3.5 h-3.5" /> Receipt
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Processed Revenue</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ₹{totalSuccessAmount.toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Primary Gateway</span>
          <h3 className="text-xl font-bold text-primary mt-1">Razorpay UPI / Cards</h3>
        </div>
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Success Rate</span>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">98.4% Transactions</h3>
        </div>
      </div>

      <DataTable
        columns={paymentColumns}
        data={payments}
        keyExtractor={(p) => p.id}
        pageSize={5}
        searchPlaceholder="Search transaction ID, order ref, customer name..."
        searchFilterKeys={['transactionId', 'bookingId', 'customerName', 'method']}
      />
    </div>
  );
}
