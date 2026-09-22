'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
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
  ArrowUpRight,
  Download,
} from 'lucide-react';

export default function TransactionsView() {
  const { transactions, customers } = useRentalStore();
  const [serviceFilter, setServiceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const totalRevenue = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalCommission = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, curr) => acc + curr.platformCommission, 0);

  const totalPayout = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, curr) => acc + curr.payoutAmount, 0);

  const filteredTxns = transactions.filter((t) => {
    const matchesService = serviceFilter === 'All' || t.serviceType === serviceFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesService && matchesStatus;
  });

  const getServiceBadgeStyle = (serviceType: string) => {
    switch (serviceType) {
      case 'Driver Local':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      case 'Driver Outstation':
        return 'bg-sky-50 text-sky-800 border-sky-200 font-bold';
      case 'Valet Staff':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'Subscription':
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
          href={`/admin/transactions/${t.id}`}
          className="font-mono font-bold text-slate-900 hover:text-primary hover:underline text-xs flex items-center gap-1"
        >
          {t.transactionId}
        </Link>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service Category',
      render: (t) => (
        <span className={`px-2.5 py-1 rounded text-[10.5px] border ${getServiceBadgeStyle(t.serviceType)}`}>
          {t.serviceType}
        </span>
      ),
    },
    {
      key: 'customerOrDriverName',
      header: 'Customer / Driver',
      render: (t) => {
        const matchedCust = customers.find((c) => c.name === t.customerOrDriverName);
        return matchedCust ? (
          <Link
            href={`/admin/customers/${matchedCust.id}`}
            className="font-bold text-slate-900 hover:text-primary hover:underline text-xs"
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
      render: (t) => <span className="text-slate-700 font-medium text-xs">{t.method}</span>,
    },
    {
      key: 'date',
      header: 'Date & Timestamp',
      render: (t) => <span className="text-slate-500 font-medium text-[11px]">{t.date}</span>,
    },
    {
      key: 'amount',
      header: 'Total Amount',
      align: 'right',
      render: (t) => (
        <span className="font-bold text-slate-900 text-xs">
          ₹{t.amount.toLocaleString('en-IN')}
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
            +₹{t.platformCommission.toLocaleString('en-IN')} Comm
          </span>
          <span className="text-slate-500 text-[10px]">
            Payout: ₹{t.payoutAmount.toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (t) => (
        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${getStatusBadge(t.status)}`}>
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
          href={`/admin/transactions/${t.id}`}
          className="p-1.5 bg-primary hover:bg-primary-light text-white hover:text-primary rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
          title="View Transaction Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Metrics Band */}
      <div className="card-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
          <div className="sm:px-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Total Volume Processed</span>
            <div className="text-xl font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-600 font-semibold block">{transactions.length} Total Logs</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-700 block">Platform Net Commission</span>
            <div className="text-xl font-bold text-indigo-700">₹{totalCommission.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500 font-medium block">20% Average Revenue Retained</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Driver & Valet Payouts</span>
            <div className="text-xl font-bold text-emerald-700">₹{totalPayout.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500 font-medium block">Direct Earnings Disbursed</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Success Verification</span>
            <div className="text-xl font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 100% Verified
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">Razorpay Gateway Integration</span>
          </div>
        </div>
      </div>

      {/* Transactions DataTable */}
      <DataTable<Transaction>
        columns={columns}
        data={filteredTxns}
        keyExtractor={(t) => t.id}
        pageSize={8}
        searchPlaceholder="Search transaction ID, customer name, payment method..."
        searchFilterKeys={['transactionId', 'customerOrDriverName', 'method', 'serviceType']}
        emptyMessage="No payment transactions match the selected criteria."
        headerActions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
              >
                <option value="All">All Services</option>
                <option value="Driver Local">Driver Local</option>
                <option value="Driver Outstation">Driver Outstation</option>
                <option value="Valet Staff">Valet Staff</option>
                <option value="Subscription">Subscription</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
              >
                <option value="All">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
