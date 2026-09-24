'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import { useToast } from '@/context/ToastContext';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import {
  ArrowLeft,
  Wallet,
  CheckCircle2,
  DollarSign,
  User,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Phone,
  Mail,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

interface WalletDetailsViewProps {
  walletId?: string;
}

interface WalletLedgerItem {
  id: string;
  walletId: string;
  userName: string;
  type: 'Top-up' | 'Ride Payment' | 'Refund Credit' | 'Cashback Bonus' | 'Admin Adjustment';
  amount: number;
  direction: 'Credit' | 'Debit';
  description: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

const mockWalletDetails = [
  {
    id: 'wlet-01',
    userId: 'cust-1',
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@example.com',
    userPhone: '+91 98765 43210',
    userRole: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    balance: 4500,
    totalCredited: 18000,
    totalSpent: 13500,
    promotionalBonus: 1500,
    lastUpdated: '2026-09-15 14:10',
    status: 'Active',
  },
  {
    id: 'wlet-02',
    userId: 'cust-2',
    userName: 'Priya Sundaram',
    userEmail: 'priya.s@example.com',
    userPhone: '+91 99887 76655',
    userRole: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    balance: 8200,
    totalCredited: 35000,
    totalSpent: 26800,
    promotionalBonus: 2500,
    lastUpdated: '2026-09-16 06:00',
    status: 'Active',
  },
  {
    id: 'wlet-03',
    userId: 'drv-101',
    userName: 'Vikram Singh',
    userEmail: 'vikram.singh@drivers.com',
    userPhone: '+91 91234 56789',
    userRole: 'Driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    balance: 12400,
    totalCredited: 48500,
    totalSpent: 36100,
    promotionalBonus: 3000,
    lastUpdated: '2026-09-15 16:30',
    status: 'Active',
  },
];

const mockUserLedger: WalletLedgerItem[] = [
  {
    id: 'wl-101',
    walletId: 'wlet-01',
    userName: 'Aarav Sharma',
    type: 'Top-up',
    amount: 2000,
    direction: 'Credit',
    description: 'UPI Wallet Re-charge via Razorpay',
    date: '2026-09-15 14:10',
    status: 'Completed',
  },
  {
    id: 'wl-102',
    walletId: 'wlet-01',
    userName: 'Aarav Sharma',
    type: 'Ride Payment',
    amount: 1298,
    direction: 'Debit',
    description: 'Payment for Local Driver booking DRV-2026-8801',
    date: '2026-09-15 14:12',
    status: 'Completed',
  },
  {
    id: 'wl-103',
    walletId: 'wlet-01',
    userName: 'Aarav Sharma',
    type: 'Cashback Bonus',
    amount: 500,
    direction: 'Credit',
    description: 'Festive Season Promotional Wallet Bonus',
    date: '2026-09-14 18:00',
    status: 'Completed',
  },
  {
    id: 'wl-104',
    walletId: 'wlet-01',
    userName: 'Aarav Sharma',
    type: 'Refund Credit',
    amount: 450,
    direction: 'Credit',
    description: 'Ride cancellation refund credit',
    date: '2026-09-13 11:30',
    status: 'Completed',
  },
];

export default function WalletDetailsView({ walletId }: WalletDetailsViewProps = {}) {
  const router = useRouter();
  const { customers, drivers } = useRentalStore();
  const { toast } = useToast();

  const targetId = walletId;
  const wallet =
    mockWalletDetails.find((w) => w.id === targetId || w.userId === targetId) ||
    mockWalletDetails[0];

  const [walletBalance, setWalletBalance] = useState(wallet.balance);
  const [userLedger, setUserLedger] = useState<WalletLedgerItem[]>(mockUserLedger);

  // Modal State for Balance Adjustment
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    actionType: 'Credit' as 'Credit' | 'Debit',
    amount: '',
    reasonType: 'Cashback Bonus' as WalletLedgerItem['type'],
    notes: '',
  });

  if (!wallet) {
    return (
      <div className="card-white p-8 text-center text-slate-500">
        Wallet profile not found.{' '}
        <button onClick={() => router.back()} className="text-primary font-bold underline">
          Back
        </button>
      </div>
    );
  }

  const matchedCustomer = customers.find((c) => c.name === wallet.userName || c.id === wallet.userId);
  const matchedDriver = drivers.find((d) => d.name === wallet.userName || d.id === wallet.userId);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustData.amount || Number(adjustData.amount) <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid credit or debit amount.');
      return;
    }

    const val = Number(adjustData.amount);
    const newBal =
      adjustData.actionType === 'Credit'
        ? walletBalance + val
        : Math.max(0, walletBalance - val);

    setWalletBalance(newBal);

    const newLedgerItem: WalletLedgerItem = {
      id: `wl-${Date.now()}`,
      walletId: wallet.id,
      userName: wallet.userName,
      type: adjustData.reasonType,
      amount: val,
      direction: adjustData.actionType,
      description: adjustData.notes || `${adjustData.actionType} of ₹${val} by Admin`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Completed',
    };

    setUserLedger((prev) => [newLedgerItem, ...prev]);

    toast.success(
      'Wallet Updated',
      `Successfully ${adjustData.actionType.toLowerCase()}ed ₹${val} to ${wallet.userName}'s wallet.`
    );

    setIsAdjustModalOpen(false);
    setAdjustData({
      actionType: 'Credit',
      amount: '',
      reasonType: 'Cashback Bonus',
      notes: '',
    });
  };

  const getLedgerTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Top-up':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      case 'Ride Payment':
        return 'bg-sky-50 text-sky-800 border-sky-200 font-bold';
      case 'Refund Credit':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
      case 'Cashback Bonus':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'Admin Adjustment':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 font-medium';
    }
  };

  const ledgerColumns: Column<WalletLedgerItem>[] = [
    {
      key: 'id',
      header: 'Txn Ref',
      render: (l) => <span className="font-mono font-bold text-slate-900 text-xs">{l.id}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (l) => (
        <span className={`px-2.5 py-1 rounded text-[10.5px] border ${getLedgerTypeBadgeStyle(l.type)}`}>
          {l.type}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Transaction Details',
      render: (l) => <span className="text-slate-700 font-semibold text-xs">{l.description}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (l) => (
        <span
          className={`font-bold text-xs ${l.direction === 'Credit' ? 'text-emerald-700' : 'text-rose-600'
            }`}
        >
          {l.direction === 'Credit' ? '+' : '-'}₹{l.amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (l) => <span className="text-slate-500 font-medium text-[11px]">{l.date}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (l) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {l.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-2xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wallets
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
            Wallet ID: {wallet.id}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {wallet.status}
          </span>
        </div>
      </div>

      {/* Primary Wallet Hero Card */}
      <div className="p-6 bg-primary rounded-xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Digital Savings Wallet Balance
          </span>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            ₹{walletBalance.toLocaleString('en-IN')}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Associated Account: {wallet.userName} ({wallet.userRole})
          </p>
        </div>

        <button
          onClick={() => setIsAdjustModalOpen(true)}
          className="px-4 py-2.5 bg-white text-primary hover:bg-slate-100 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Credit / Debit Balance
        </button>
      </div>

      {/* Vertical Column Stack Layout */}
      <div className="space-y-6">
        {/* Wallet Holder Profile Card */}
        <div className="card-white p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <img
                src={wallet.avatar}
                alt={wallet.userName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-100 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base">{wallet.userName}</h4>
                  <span className="text-[10.5px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded border border-primary/20">
                    {wallet.userRole}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-0.5 font-medium">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {wallet.userEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {wallet.userPhone}
                  </span>
                </div>
              </div>
            </div>

            {matchedCustomer && (
              <Link
                href={`/admin/customers/${matchedCustomer.id}`}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs w-fit"
              >
                View Customer Profile <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            {matchedDriver && (
              <Link
                href={`/admin/drivers/${matchedDriver.id}`}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs w-fit"
              >
                View Driver Profile <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lifetime Credited</span>
              <div className="text-xl font-bold text-emerald-700">₹{wallet.totalCredited.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-slate-500 font-medium">Cumulative deposits & top-ups</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Spent / Debited</span>
              <div className="text-xl font-bold text-slate-900">₹{wallet.totalSpent.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-slate-500 font-medium">Fulfilled ride payments</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Promotional Cashbacks</span>
              <div className="text-xl font-bold text-indigo-700">₹{wallet.promotionalBonus.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-slate-500 font-medium">Promo campaign credits</span>
            </div>
          </div>
        </div>

        {/* Wallet Ledger Table */}
        <DataTable<WalletLedgerItem>
          columns={ledgerColumns}
          data={userLedger}
          keyExtractor={(l) => l.id}
          pageSize={6}
          searchPlaceholder="Search wallet ledger transactions..."
          searchFilterKeys={['id', 'description', 'type']}
          emptyMessage="No wallet ledger entries recorded."
          headerActions={
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Wallet Statement & Activity Ledger
            </h3>
          }
        />
      </div>

      {/* Wallet Adjustment Modal */}
      {isAdjustModalOpen && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Wallet: ${wallet.userName}`}
          subtitle={`Current Savings Balance: ₹${walletBalance.toLocaleString('en-IN')}`}
          icon={Wallet}
          maxWidth="md"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Action Type</label>
                <select
                  value={adjustData.actionType}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, actionType: e.target.value as 'Credit' | 'Debit' })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Credit">+ Credit (Add Amount)</option>
                  <option value="Debit">- Debit (Deduct Amount)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 500"
                  value={adjustData.amount}
                  onChange={(e) => setAdjustData({ ...adjustData, amount: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason / Category</label>
              <select
                value={adjustData.reasonType}
                onChange={(e) =>
                  setAdjustData({
                    ...adjustData,
                    reasonType: e.target.value as WalletLedgerItem['type'],
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Cashback Bonus">Cashback Bonus</option>
                <option value="Top-up">Top-up Deposit</option>
                <option value="Refund Credit">Refund Credit</option>
                <option value="Admin Adjustment">Admin Adjustment</option>
                <option value="Ride Payment">Ride Payment Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Notes / Description</label>
              <textarea
                rows={2}
                placeholder="Reason for crediting/deducting balance..."
                value={adjustData.notes}
                onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Submit Wallet Update
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
