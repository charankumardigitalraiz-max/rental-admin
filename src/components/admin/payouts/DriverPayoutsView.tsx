'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import DataTable, { Column } from '@/components/ui/DataTable';
import {
  CreditCard,
  Check,
  Filter,
} from 'lucide-react';
import { DriverPayoutRecord } from '@/types';

export default function DriverPayoutsView() {
  const { driverPayouts, damageClaims, updatePayoutStatus } = useRentalStore();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const filteredPayouts = driverPayouts.filter((payout) => {
    const matchesStatus = statusFilter === 'All' || payout.status === statusFilter;
    const matchesRole = roleFilter === 'All' || payout.role === roleFilter;
    return matchesStatus && matchesRole;
  });

  const totalPayoutVolume = driverPayouts.reduce((sum, p) => sum + p.netPayout, 0);
  const pendingPayoutVolume = driverPayouts
    .filter((p) => p.status === 'Pending Approval')
    .reduce((sum, p) => sum + p.netPayout, 0);
  const completedCount = driverPayouts.filter((p) => p.status === 'Completed').length;

  const columns: Column<DriverPayoutRecord>[] = [
    {
      key: 'payoutNumber',
      header: 'Payout ID',
      render: (p) => {
        const hasClaimHold = damageClaims?.some((c) => c.driverName === p.driverOrStaffName && c.payoutHoldStatus);
        return (
          <div>
            <span className="font-bold text-slate-900 font-mono text-xs">{p.payoutNumber}</span>
            {hasClaimHold && (
              <span className="block text-[9px] font-extrabold text-rose-700 uppercase bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                Claim Hold Active
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'driverOrStaffName',
      header: 'Beneficiary',
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.driverOrStaffAvatar}
            alt={p.driverOrStaffName}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div>
            <p className="font-bold text-slate-900">{p.driverOrStaffName}</p>
            <p className="text-[10px] text-slate-500">{p.role} • {p.driverOrStaffPhone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Settlement Period',
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-800">{p.period}</p>
          <p className="text-[10px] text-slate-400">{p.totalTripsOrEvents} trips/events</p>
        </div>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Gross Revenue',
      render: (p) => <span className="font-bold text-slate-800">₹{p.grossAmount.toLocaleString()}</span>,
    },
    {
      key: 'platformCommission',
      header: 'Deductions',
      render: (p) => (
        <div>
          <p className="text-rose-600 font-medium">-₹{p.platformCommission} (Commission)</p>
          <p className="text-[10px] text-slate-400">-₹{p.taxDeducted} (TDS)</p>
        </div>
      ),
    },
    {
      key: 'netPayout',
      header: 'Net Payout',
      render: (p) => <span className="font-black text-emerald-800 text-sm">₹{p.netPayout.toLocaleString()}</span>,
    },
    {
      key: 'bankAccount',
      header: 'Bank Account',
      render: (p) => <span className="text-slate-600 font-mono text-[11px]">{p.bankAccount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${p.status === 'Completed'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : p.status === 'Pending Approval'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : p.status === 'Processing'
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (p) => (
        <div>
          {p.status === 'Pending Approval' && (
            <button
              onClick={() => updatePayoutStatus(p.id, 'Completed')}
              className="px-3 py-1.5 bg-[#023526] hover:bg-emerald-900 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors flex items-center gap-1 ml-auto"
            >
              <Check className="w-3.5 h-3.5" /> Approve Payout
            </button>
          )}
          {p.status === 'Completed' && (
            <span className="text-[10px] text-slate-400 font-medium">
              Paid on {p.processedDate}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* Unified Payout Metrics & Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">
              Pending Approval Volume
            </span>
            <div className="text-xl font-bold text-amber-700 mt-1">₹{pendingPayoutVolume.toLocaleString()}</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">
              {driverPayouts.filter((p) => p.status === 'Pending Approval').length} settlement batches waiting
            </p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">
              Total Payout Disbursed
            </span>
            <div className="text-xl font-bold text-emerald-700 mt-1">₹{totalPayoutVolume.toLocaleString()}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">{completedCount} batches completed</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Platform Commission Retention
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              ₹{driverPayouts.reduce((sum, p) => sum + p.platformCommission, 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Total platform revenue cut from payouts</p>
          </div>
        </div>
      </div>

      {/* Global DataTable */}
      <DataTable<DriverPayoutRecord>
        columns={columns}
        data={filteredPayouts}
        keyExtractor={(p) => p.id}
        pageSize={6}
        searchPlaceholder="Search payout ID, driver name, bank account..."
        searchFilterKeys={['payoutNumber', 'driverOrStaffName', 'bankAccount']}
        emptyMessage="No payout settlement records match your filters."
        headerActions={
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]"
              >
                <option value="All">All Roles</option>
                <option value="Driver">Drivers</option>
                <option value="Valet Staff">Valet Staff</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
