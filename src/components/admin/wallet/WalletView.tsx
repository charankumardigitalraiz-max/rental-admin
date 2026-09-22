'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import { useToast } from '@/context/ToastContext';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  CheckCircle2,
  DollarSign,
  User,
  Search,
  Filter,
  RotateCcw,
  CreditCard,
  Gift,
  AlertCircle,
  X,
  Check,
  Eye,
} from 'lucide-react';

interface WalletAccount {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userRole: 'Customer' | 'Driver';
  avatar: string;
  balance: number;
  totalCredited: number;
  totalSpent: number;
  lastUpdated: string;
  status: 'Active' | 'Frozen';
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

const mockWalletAccounts: WalletAccount[] = [
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
    lastUpdated: '2026-09-15 16:30',
    status: 'Active',
  },
  {
    id: 'wlet-04',
    userId: 'drv-102',
    userName: 'Suresh Kumar',
    userEmail: 'suresh.k@drivers.com',
    userPhone: '+91 98450 12345',
    userRole: 'Driver',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    balance: 6800,
    totalCredited: 36200,
    totalSpent: 29400,
    lastUpdated: '2026-09-15 11:24',
    status: 'Active',
  },
];

const mockLedgerItems: WalletLedgerItem[] = [
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
    walletId: 'wlet-02',
    userName: 'Priya Sundaram',
    type: 'Cashback Bonus',
    amount: 500,
    direction: 'Credit',
    description: 'Festive Season Promotional Wallet Bonus',
    date: '2026-09-14 18:00',
    status: 'Completed',
  },
  {
    id: 'wl-104',
    walletId: 'wlet-03',
    userName: 'Vikram Singh',
    type: 'Refund Credit',
    amount: 450,
    direction: 'Credit',
    description: 'Toll fee reimbursement for Outstation trip',
    date: '2026-09-13 11:30',
    status: 'Completed',
  },
];

export default function WalletView() {
  const { customers, drivers } = useRentalStore();
  const { toast } = useToast();

  const [wallets, setWallets] = useState<WalletAccount[]>(mockWalletAccounts);
  const [ledger, setLedger] = useState<WalletLedgerItem[]>(mockLedgerItems);
  const [activeTab, setActiveTab] = useState<'wallets' | 'ledger'>('wallets');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State for Adding/Adjusting Balance
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletAccount | null>(null);
  const [adjustData, setAdjustData] = useState({
    actionType: 'Credit' as 'Credit' | 'Debit',
    amount: '',
    reasonType: 'Cashback Bonus' as WalletLedgerItem['type'],
    notes: '',
  });

  const totalPoolBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalCreditsIssued = wallets.reduce((acc, w) => acc + w.totalCredited, 0);
  const activeWalletsCount = wallets.filter((w) => w.status === 'Active').length;

  const filteredWallets = wallets.filter((w) => {
    return roleFilter === 'All' || w.userRole === roleFilter;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || !adjustData.amount || Number(adjustData.amount) <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid credit or debit amount.');
      return;
    }

    const val = Number(adjustData.amount);
    const updatedBalance =
      adjustData.actionType === 'Credit'
        ? selectedWallet.balance + val
        : Math.max(0, selectedWallet.balance - val);

    // Update Wallet Balance
    setWallets((prev) =>
      prev.map((w) =>
        w.id === selectedWallet.id
          ? {
            ...w,
            balance: updatedBalance,
            totalCredited:
              adjustData.actionType === 'Credit' ? w.totalCredited + val : w.totalCredited,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
          }
          : w
      )
    );

    // Create Ledger entry
    const newLedgerItem: WalletLedgerItem = {
      id: `wl-${Date.now()}`,
      walletId: selectedWallet.id,
      userName: selectedWallet.userName,
      type: adjustData.reasonType,
      amount: val,
      direction: adjustData.actionType,
      description: adjustData.notes || `${adjustData.actionType} of ₹${val} by Admin`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Completed',
    };

    setLedger((prev) => [newLedgerItem, ...prev]);

    toast.success(
      'Wallet Updated',
      `Successfully ${adjustData.actionType.toLowerCase()}ed ₹${val} to ${selectedWallet.userName}'s wallet.`
    );

    setIsAdjustModalOpen(false);
    setSelectedWallet(null);
    setAdjustData({
      actionType: 'Credit',
      amount: '',
      reasonType: 'Cashback Bonus',
      notes: '',
    });
  };

  const walletColumns: Column<WalletAccount>[] = [
    {
      key: 'userName',
      header: 'Account User',
      render: (w) => (
        <div className="flex items-center gap-3">
          <img src={w.avatar} alt={w.userName} className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-100" />
          <div>
            <div className="font-bold text-slate-900">{w.userName}</div>
            <div className="text-[10px] text-slate-400 font-medium">{w.userEmail}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'userRole',
      header: 'Account Role',
      render: (w) => (
        <span
          className={`px-2.5 py-1 rounded text-[10.5px] font-bold border ${w.userRole === 'Customer'
            ? 'bg-sky-50 text-sky-800 border-sky-200'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
        >
          {w.userRole}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Wallet Savings Balance',
      render: (w) => (
        <div className="font-bold text-slate-900 text-sm">
          ₹{w.balance.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      key: 'totalCredited',
      header: 'Total Lifetime Credited',
      render: (w) => (
        <span className="font-bold text-emerald-700 text-xs">
          ₹{w.totalCredited.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'lastUpdated',
      header: 'Last Activity',
      render: (w) => <span className="text-slate-500 font-medium text-[11px]">{w.lastUpdated}</span>,
    },
    {
      key: 'status',
      header: 'Wallet Status',
      render: (w) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'Active'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
        >
          {w.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (w) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/admin/wallet/${w.id}`}
            className="p-1.5 bg-primary hover:bg-primary-hover text-white rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
            title="View Full Wallet Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              setSelectedWallet(w);
              setIsAdjustModalOpen(true);
            }}
            className="px-3 py-1.5 bg-primary hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-2xs active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" /> Adjust
          </button>
        </div>
      ),
    },
  ];

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
      header: 'Txn ID',
      render: (l) => <span className="font-mono font-bold text-slate-900 text-xs">{l.id}</span>,
    },
    {
      key: 'userName',
      header: 'User Profile',
      render: (l) => <span className="font-bold text-slate-900 text-xs">{l.userName}</span>,
    },
    {
      key: 'type',
      header: 'Transaction Type',
      render: (l) => (
        <span className={`px-2.5 py-1 rounded text-[10.5px] border ${getLedgerTypeBadgeStyle(l.type)}`}>
          {l.type}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (l) => <span className="text-slate-600 font-medium text-xs">{l.description}</span>,
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
    <div className="p-2 space-y-6 pb-10">
      {/* Wallet Summary Metrics Band */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total User Savings Pool</span>
            <div className="text-xl font-bold text-slate-900 mt-1">₹{totalPoolBalance.toLocaleString('en-IN')}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">{activeWalletsCount} Active User Wallets</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Total Credits Disbursed</span>
            <div className="text-xl font-bold text-emerald-700 mt-1">₹{totalCreditsIssued.toLocaleString('en-IN')}</div>
            <p className="text-[10px] text-slate-400 mt-1">Lifetime Wallet Top-ups & Cashbacks</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-700 block">Promotional Cashbacks</span>
            <div className="text-xl font-bold text-indigo-700 mt-1">₹18,500</div>
            <p className="text-[10px] text-slate-400 mt-1">App Promo Campaign Rewards</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">System Verification</span>
            <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 100% Secured
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Instant Razorpay Wallet Gateway</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-900 text-sm">
              User Savings & Digital Wallet Directory
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('wallets')}
                className={`px-3 py-1 rounded-md font-bold transition-all ${activeTab === 'wallets'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                User Wallets ({wallets.length})
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1 rounded-md font-bold transition-all ${activeTab === 'ledger'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                Wallet Ledger ({ledger.length})
              </button>
            </div>
          </div>
        </div>

        {/* Tab View 1: User Wallets List */}
        {activeTab === 'wallets' && (
          <DataTable<WalletAccount>
            columns={walletColumns}
            data={filteredWallets}
            keyExtractor={(w) => w.id}
            pageSize={6}
            searchPlaceholder="Search customer or driver name, email..."
            searchFilterKeys={['userName', 'userEmail', 'userPhone']}
            headerActions={
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter Role:
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                >
                  <option value="All">All Roles</option>
                  <option value="Customer">Customers</option>
                  <option value="Driver">Drivers</option>
                </select>
              </div>
            }
          />
        )}

        {/* Tab View 2: Wallet Ledger */}
        {activeTab === 'ledger' && (
          <DataTable<WalletLedgerItem>
            columns={ledgerColumns}
            data={ledger}
            keyExtractor={(l) => l.id}
            pageSize={8}
            searchPlaceholder="Search transaction ID, description, user..."
            searchFilterKeys={['id', 'userName', 'description', 'type']}
          />
        )}
      </div>

      {/* Wallet Balance Adjustment Modal */}
      {isAdjustModalOpen && selectedWallet && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Wallet: ${selectedWallet.userName}`}
          subtitle={`Current Savings Balance: ₹${selectedWallet.balance.toLocaleString('en-IN')}`}
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
                  <option value="Credit">+ Credit (Add Savings Amount)</option>
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
