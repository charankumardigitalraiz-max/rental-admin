'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import {
  ArrowLeft,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  CreditCard,
  Building2,
  CalendarCheck,
  ShieldCheck,
  RotateCcw,
  DollarSign,
  FileText,
  ExternalLink,
  Eye
} from 'lucide-react';

interface TransactionDetailsViewProps {
  transactionId?: string;
}

export default function TransactionDetailsView({ transactionId }: TransactionDetailsViewProps = {}) {
  const router = useRouter();
  const { transactions, driverBookings, customers, valetBookings } = useRentalStore();

  const targetId = transactionId;
  const transaction =
    transactions.find((t) => t.id === targetId || t.transactionId === targetId) ||
    transactions[0];

  if (!transaction) {
    return (
      <div className="card-white p-8 text-center text-slate-500">
        Transaction record not found.{' '}
        <button onClick={() => router.back()} className="text-primary font-bold underline">
          Back
        </button>
      </div>
    );
  }

  // Related booking or customer match
  const relatedBooking = driverBookings.find(
    (b) => b.id === transaction.bookingId || b.bookingNumber === transaction.bookingId
  );
  const relatedCustomer = customers.find(
    (c) => c.name === transaction.customerOrDriverName
  );

  const getStatusBadge = (status: string) => {
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

  const auditTimeline = [
    { label: 'Payment Initiated', date: transaction.date, completed: true },
    { label: 'Payment Gateway Authorized', date: transaction.date, completed: true },
    {
      label: 'Merchant Settlement Completed',
      date: transaction.status === 'Success' ? transaction.date : 'Pending',
      completed: transaction.status === 'Success' || transaction.status === 'Refunded',
    },
    {
      label: transaction.status === 'Refunded' ? 'Refund Processed' : 'Tax Invoice & Receipt Issued',
      date: transaction.date,
      completed: transaction.status === 'Success' || transaction.status === 'Refunded',
    },
  ];

  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-2xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Transactions
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
            {transaction.transactionId}
          </span>
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusBadge(
              transaction.status
            )}`}
          >
            {transaction.status}
          </span>
        </div>
      </div>

      {/* Main Highlights Card */}
      <div className="p-6 bg-primary rounded-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Payment Transaction Overview
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              ₹{transaction.amount.toLocaleString('en-IN')}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                Paid
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Processed via {transaction.method} • {transaction.date}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <FileText className="w-4 h-4 text-slate-500" /> Print Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2/3): Core Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Transaction Metadata Card */}
          <div className="card-white p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Receipt className="w-4.5 h-4.5 text-primary" /> Transaction Metadata & Context
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Reference ID</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{transaction.transactionId}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Service Category</span>
                <span className="font-bold text-primary">{transaction.serviceType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Payment Method</span>
                <span className="font-semibold text-slate-800">{transaction.method}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Booking Reference</span>
                <span className="font-mono font-bold text-slate-900">
                  {transaction.bookingId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Timestamp</span>
                <span className="font-medium text-slate-700">{transaction.date}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Settlement Status</span>
                <span className="font-bold text-emerald-700">Settled to Account</span>
              </div>
            </div>

            {relatedBooking && (
              <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <CalendarCheck className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold text-slate-800">
                    Linked to Booking: <strong className="font-mono text-slate-900">{relatedBooking.bookingNumber}</strong>
                  </span>
                </div>
                <Link
                  href={`/admin/driver-bookings/${relatedBooking.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View Booking <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Customer / Payer Details Card */}
          <div className="card-white p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-primary" /> Payer / Account Details
            </h3>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Customer / Driver Name</span>
                <span className="font-bold text-slate-900 text-sm">{transaction.customerOrDriverName}</span>
                {relatedCustomer && (
                  <p className="text-[11px] text-slate-500 font-medium">{relatedCustomer.email}</p>
                )}
              </div>

              {relatedCustomer && (
                <Link
                  href={`/admin/customers/${relatedCustomer.id}`}
                  className="px-3 py-1.5 bg-primary hover:bg-primary text-white hover:text-white rounded-lg font-bold text-xs border border-primary/20 transition-all flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Customer Profile
                </Link>
              )}
            </div>
          </div>

          {/* Payment Gateway Audit Trail */}
          <div className="card-white p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Gateway Audit & Verification Logs
            </h3>

            <div className="space-y-3 text-xs">
              {auditTimeline.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 ${step.completed ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                    />
                    <span className={`font-bold ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{step.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Financial Breakdown */}
        <div className="space-y-6">
          {/* Revenue Breakdown Card */}
          <div className="card-white p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <DollarSign className="w-4.5 h-4.5 text-primary" /> Revenue & Payout Split
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Gross Customer Paid:</span>
                <span className="font-bold text-slate-900">₹{transaction.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Driver / Provider Payout:</span>
                <span className="font-bold">₹{transaction.payoutAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>Platform Commission:</span>
                <span className="font-bold">₹{transaction.platformCommission.toLocaleString('en-IN')}</span>
              </div>
              {transaction.refundAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold border-t border-slate-100 pt-2">
                  <span>Refund Amount:</span>
                  <span>-₹{transaction.refundAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>Net Platform Retained:</span>
                <span className="text-primary">₹{transaction.platformCommission.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Details Card */}
          <div className="card-white p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <CreditCard className="w-4.5 h-4.5 text-primary" /> Gateway Channel
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-semibold text-slate-800">Razorpay / Bank API</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method Type:</span>
                <span className="font-semibold text-slate-800">{transaction.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Currency:</span>
                <span className="font-semibold text-slate-800">INR (₹)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
