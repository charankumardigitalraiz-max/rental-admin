'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useToast } from '@/context/ToastContext';
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
  Eye,
  RefreshCw,
  Copy,
  Check,
  Phone,
  Mail,
  Car,
  Award,
  ChevronRight,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Transaction } from '@/types';

interface TransactionDetailsViewProps {
  transactionId?: string;
}

export default function TransactionDetailsView({ transactionId }: TransactionDetailsViewProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const { customers, driverBookings } = useRentalStore();
  const {
    currentTransaction,
    isDetailLoading,
    isUpdating,
    fetchTransactionById,
    updateTransactionStatus,
  } = useTransactionStore();

  const [copiedId, setCopiedId] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer Request / Dispute');
  const [refundAmountInput, setRefundAmountInput] = useState<string>('');

  // Fetch transaction details on mount / ID change
  useEffect(() => {
    if (transactionId) {
      loadData(transactionId);
    }
  }, [transactionId]);

  const loadData = async (id: string) => {
    setLoadError(null);
    const res = await fetchTransactionById(id);
    if (!res.success) {
      setLoadError(res.error || 'Failed to load transaction details.');
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(true);
      toast.success('Copied to Clipboard', `Transaction ID "${text}" copied.`);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus: Transaction['status']) => {
    if (!currentTransaction || currentTransaction.status === newStatus || isUpdating) return;

    const res = await updateTransactionStatus(
      currentTransaction.id || (currentTransaction as any)._id || currentTransaction.transactionId,
      newStatus
    );

    if (res.success) {
      toast.success('Status Updated', `Transaction status changed to "${newStatus}".`);
    } else {
      toast.error('Update Failed', res.error || 'Could not update status.');
    }
  };

  const handleConfirmRefund = async () => {
    if (!currentTransaction || isUpdating) return;

    const amountNum = refundAmountInput ? Number(refundAmountInput) : currentTransaction.amount;
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid Amount', 'Please specify a valid refund amount.');
      return;
    }
    if (amountNum > currentTransaction.amount) {
      toast.error(
        'Amount Too High',
        `Refund cannot exceed original amount of ₹${currentTransaction.amount.toLocaleString('en-IN')}.`
      );
      return;
    }

    const res = await updateTransactionStatus(
      currentTransaction.id || (currentTransaction as any)._id || currentTransaction.transactionId,
      'Refunded',
      amountNum
    );

    if (res.success) {
      toast.success(
        'Refund Processed',
        `₹${amountNum.toLocaleString('en-IN')} refund completed for ${currentTransaction.transactionId}.`
      );
      setShowRefundModal(false);
    } else {
      toast.error('Refund Failed', res.error || 'Could not process refund.');
    }
  };

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

  const getServiceBadgeStyle = (service: string) => {
    switch (service) {
      case 'Driver Local':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Driver Outstation':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Valet Staff':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Subscription':
      case 'Driver Subscription':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Loading skeleton view
  if (isDetailLoading && !currentTransaction) {
    return (
      <div className="space-y-6 pb-10 max-w-6xl mx-auto animate-pulse">
        {/* Navigation Card placeholder */}
        <div className="h-14 bg-slate-200 rounded-xl" />

        {/* Hero Card placeholder */}
        <div className="h-36 bg-slate-200 rounded-xl" />

        {/* Grid placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-56 bg-slate-200 rounded-xl" />
            <div className="h-40 bg-slate-200 rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-40 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not found state
  if (loadError || !currentTransaction) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="card-white p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Transaction Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {loadError || `Could not find any financial record matching ID "${transactionId}". It may have been archived or removed.`}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => transactionId && loadData(transactionId)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
            <Link
              href="/admin/transactions"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const transaction = currentTransaction;

  // Fallback linked customer from client store if not returned in API payload
  const relatedCustomer =
    transaction.customer ||
    customers.find(
      (c) =>
        c.name?.toLowerCase() === transaction.customerOrDriverName?.toLowerCase() ||
        c.id === (transaction as any).customerId
    );

  // Fallback linked booking from client store if not returned in API payload
  const relatedBooking =
    transaction.booking ||
    driverBookings.find(
      (b) => b.id === transaction.bookingId || b.bookingNumber === transaction.bookingId
    );

  const displayDate = transaction.date || (transaction as any).paymentDate || 'Just now';

  const auditTimeline = [
    {
      label: 'Payment Initiated',
      desc: 'Customer checked out and initiated gateway session',
      date: displayDate,
      completed: true,
    },
    {
      label: 'Payment Gateway Authorized',
      desc: `Authorized via ${transaction.method || 'Online Channel'}`,
      date: displayDate,
      completed: transaction.status !== 'Failed',
    },
    {
      label: 'Merchant Settlement Completed',
      desc: transaction.status === 'Success' ? 'Funds confirmed & settled' : 'Awaiting settlement reconciliation',
      date: transaction.status === 'Success' || transaction.status === 'Refunded' ? displayDate : 'Pending',
      completed: transaction.status === 'Success' || transaction.status === 'Refunded',
    },
    {
      label: transaction.status === 'Refunded' ? 'Refund Disbursed' : 'Tax Invoice & Receipt Generated',
      desc: transaction.status === 'Refunded' ? `Full refund of ₹${transaction.refundAmount || transaction.amount} completed` : 'Electronic receipt available',
      date: transaction.status === 'Success' || transaction.status === 'Refunded' ? displayDate : 'Pending',
      completed: transaction.status === 'Success' || transaction.status === 'Refunded',
    },
  ];

  const totalAmount = transaction.amount || 0;
  const payoutAmount = transaction.payoutAmount || 0;
  const commissionAmount = transaction.platformCommission || 0;
  const payoutRatio = totalAmount > 0 ? Math.round((payoutAmount / totalAmount) * 100) : 0;
  const commissionRatio = totalAmount > 0 ? Math.round((commissionAmount / totalAmount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Breadcrumb Navigation & Top Action Card */}
      <div className="card-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/transactions"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" /> Back
          </Link>
          {/* <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
            {transaction.transactionId}
          </span> */}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={() => transactionId && loadData(transactionId)}
            disabled={isDetailLoading}
            className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Details"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDetailLoading ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Print / Export Receipt */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Print Receipt"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Receipt</span>
          </button>

          {/* Status Quick Changer Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 ml-1">Status:</span>
            <select
              value={transaction.status}
              disabled={isUpdating}
              onChange={(e) => {
                const newStatus = e.target.value as Transaction['status'];
                if (newStatus === 'Refunded') {
                  setRefundAmountInput(String(transaction.amount));
                  setShowRefundModal(true);
                } else {
                  handleStatusChange(newStatus);
                }
              }}
              className="text-xs bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5"
            >
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Highlights Hero Banner */}
      <div className="p-6 bg-primary rounded-xl text-white shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-[1]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                Payment Transaction Overview
              </span>
              <span className="text-white/40">•</span>
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                  transaction.status
                )}`}
              >
                {transaction.status}
              </span>
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              ₹{totalAmount.toLocaleString('en-IN')}
              <span className="text-xs font-bold text-emerald-900 bg-emerald-300 px-2.5 py-0.5 rounded-full">
                {transaction.status === 'Success' ? 'Fully Paid' : transaction.status}
              </span>
            </h2>

            <p className="text-xs text-white/80 font-medium">
              Processed via {transaction.method || 'Online Gateway'} • {displayDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCopy(transaction.transactionId)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'Copied ID' : 'Copy Transaction ID'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2/3): Core Details & Context */}
        <div className="md:col-span-2 space-y-6">
          {/* Transaction Metadata Card */}
          <div className="card-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-primary" /> Transaction Metadata & Context
              </h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${getServiceBadgeStyle(
                  transaction.serviceType
                )}`}
              >
                {transaction.serviceType}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Reference ID</span>
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1 mt-0.5">
                  {transaction.transactionId}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Service Category</span>
                <span className="font-bold text-slate-800 block mt-0.5">{transaction.serviceType}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Payment Method</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{transaction.method || 'UPI'}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Booking Reference</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">
                  {transaction.bookingId || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Timestamp</span>
                <span className="font-medium text-slate-700 block mt-0.5">{displayDate}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Settlement Status</span>
                <span
                  className={`font-bold block mt-0.5 ${transaction.status === 'Success'
                    ? 'text-emerald-700'
                    : transaction.status === 'Pending'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                    }`}
                >
                  {transaction.status === 'Success' ? 'Settled to Account' : `${transaction.status} Record`}
                </span>
              </div>
            </div>
          </div>

          {/* Payer / Account Details Card */}
          <div className="card-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-primary" /> Payer / Account Information
              </h3>
              {relatedCustomer?.id && (
                <Link
                  href={`/admin/customers/${relatedCustomer.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Customer Profile <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="flex items-start gap-4 text-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-base shrink-0 overflow-hidden">
                {relatedCustomer?.avatar ? (
                  <img src={relatedCustomer.avatar} alt="Payer" className="w-full h-full object-cover" />
                ) : (
                  transaction.customerOrDriverName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{transaction.customerOrDriverName}</h4>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    Account Payer
                  </span>
                </div>

                {relatedCustomer?.phone && (
                  <p className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {relatedCustomer.phone}
                  </p>
                )}

                {relatedCustomer?.email && (
                  <p className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {relatedCustomer.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Linked Driver Account Card (if present) */}
          {transaction.driver && (
            <div className="card-white p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Car className="w-4.5 h-4.5 text-primary" /> Assigned Driver Partner
                </h3>
                {transaction.driver.id && (
                  <Link
                    href={`/admin/drivers/${transaction.driver.id}`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Driver Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3.5 text-xs">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0 overflow-hidden">
                  {transaction.driver.avatar ? (
                    <img src={transaction.driver.avatar} alt="Driver" className="w-full h-full object-cover" />
                  ) : (
                    transaction.driver.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{transaction.driver.name}</h4>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                    <span className="font-mono">{transaction.driver.driverId}</span>
                    {transaction.driver.phone && <span>• {transaction.driver.phone}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Linked Booking Context Card (if present) */}
          {relatedBooking && (
            <div className="card-white p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CalendarCheck className="w-4.5 h-4.5 text-emerald-600" /> Linked Booking Details
                </h3>
                {relatedBooking.id && (
                  <Link
                    href={`/admin/driver-bookings/${relatedBooking.id}`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Booking Record <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Booking ID</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {relatedBooking.bookingNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Trip Type</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {(relatedBooking as any).tripType || (relatedBooking as any).bookingType || 'Local'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Booking Status</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{relatedBooking.status || 'Completed'}</span>
                </div>
                {relatedBooking.pickupLocation && (
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 text-[10.5px] font-bold uppercase block">Route</span>
                    <span className="font-medium text-slate-700 mt-0.5 block truncate">
                      {relatedBooking.pickupLocation}{' '}
                      {(relatedBooking as any).dropLocation || (relatedBooking as any).destinationLocation
                        ? `➔ ${(relatedBooking as any).dropLocation || (relatedBooking as any).destinationLocation}`
                        : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gateway Verification & Audit Trail Card */}
          {/* <div className="card-white p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Gateway Audit & Verification Logs
            </h3>

            <div className="space-y-3 text-xs">
              {auditTimeline.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        step.completed ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <div>
                      <span className={`font-bold block ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      <span className="text-[10.5px] text-slate-400">{step.desc}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">{step.date}</span>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Right Column (1/3): Financial Breakdown & Actions */}
        <div className="space-y-6">
          {/* Revenue Breakdown Card */}
          <div className="card-white p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign className="w-4.5 h-4.5 text-primary" /> Revenue & Payout Split
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Customer Paid:</span>
                <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-emerald-700">
                <span className="flex items-center gap-1">
                  <span>Driver / Provider Payout:</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded font-bold">
                    {payoutRatio}%
                  </span>
                </span>
                <span className="font-bold">₹{payoutAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-indigo-700">
                <span className="flex items-center gap-1">
                  <span>Platform Commission:</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-800 px-1 py-0.2 rounded font-bold">
                    {commissionRatio}%
                  </span>
                </span>
                <span className="font-bold">₹{commissionAmount.toLocaleString('en-IN')}</span>
              </div>

              {transaction.refundAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold border-t border-slate-100 pt-2.5">
                  <span>Refund Disbursed:</span>
                  <span>-₹{transaction.refundAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Visual Split Ratio Progress Bar */}
              <div className="pt-2">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${payoutRatio}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Payout: ${payoutRatio}%`}
                  />
                  <div
                    style={{ width: `${commissionRatio}%` }}
                    className="bg-indigo-600 h-full"
                    title={`Commission: ${commissionRatio}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span className="text-emerald-700">Payout ({payoutRatio}%)</span>
                  <span className="text-indigo-700">Commission ({commissionRatio}%)</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>Net Platform Retained:</span>
                <span className="text-primary font-bold">₹{commissionAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Details Card */}
          <div className="card-white p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4.5 h-4.5 text-primary" /> Gateway Channel
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-semibold text-slate-800">Razorpay / Bank API</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method Type:</span>
                <span className="font-semibold text-slate-800">{transaction.method || 'Online'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Currency:</span>
                <span className="font-semibold text-slate-800">INR (₹)</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-slate-400">Status Verification:</span>
                <span className="font-bold text-emerald-700">256-Bit SSL Encrypted</span>
              </div> */}
            </div>
          </div>

          {/* Administrative Actions Quick Card */}
          <div className="card-white p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <RotateCcw className="w-4.5 h-4.5 text-primary" /> Administrative Controls
            </h3>

            <div className="space-y-2">
              {transaction.status !== 'Success' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('Success')}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Verified Success
                </button>
              )}

              {transaction.status !== 'Refunded' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    setRefundAmountInput(String(transaction.amount));
                    setShowRefundModal(true);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Process Full Refund
                </button>
              )}

              {transaction.status !== 'Failed' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('Failed')}
                  className="w-full py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Mark as Failed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transition-all animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Confirm Transaction Refund</h3>
                  <p className="text-[11px] text-slate-500 font-mono font-medium">
                    {transaction.transactionId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isUpdating && setShowRefundModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Transaction Highlight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payer / Customer:</span>
                  <span className="font-bold text-slate-900">{transaction.customerOrDriverName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Original Paid Amount:</span>
                  <span className="font-bold text-slate-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Gateway / Method:</span>
                  <span className="font-semibold text-slate-800">{transaction.method || 'Online'}</span>
                </div>
              </div>

              {/* Refund Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Refund Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    max={totalAmount}
                    min={1}
                    value={refundAmountInput}
                    onChange={(e) => setRefundAmountInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder={String(totalAmount)}
                  />
                </div>
                <div className="flex justify-between text-[10.5px] text-slate-400 pt-0.5">
                  <span>Max Refundable: ₹{totalAmount.toLocaleString('en-IN')}</span>
                  <button
                    type="button"
                    onClick={() => setRefundAmountInput(String(totalAmount))}
                    className="text-purple-600 font-bold hover:underline cursor-pointer"
                  >
                    Set Full Amount
                  </button>
                </div>
              </div>

              {/* Refund Reason Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Refund Reason / Notes
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                >
                  <option value="Customer Request / Dispute">Customer Request / Dispute</option>
                  <option value="Booking Cancelled by Customer">Booking Cancelled by Customer</option>
                  <option value="Driver / Service Unavailable">Driver / Service Unavailable</option>
                  <option value="Duplicate or Incorrect Payment">Duplicate or Incorrect Payment</option>
                  <option value="Service Quality Concern">Service Quality Concern</option>
                  <option value="Administrative Discretion">Administrative Discretion</option>
                </select>
              </div>

              {/* Warning Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-[11.5px] text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Processing this refund will change the transaction status to{' '}
                  <strong className="font-bold text-purple-900">Refunded</strong> and record a disbursement
                  in financial accounts.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmRefund}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Refund...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm & Process Refund</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
