'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import DataTable, { Column } from '@/components/ui/DataTable';
import { DriverSubscription } from '@/types';
import { Award, Filter, CreditCard, User, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DriverSubscriptionsView() {
  const { driverSubscriptions, setActiveTab, setSelectedDriverId } = useRentalStore();
  const [statusFilter, setStatusFilter] = useState('All');

  // Metric stats calculations
  const totalSubscriptions = driverSubscriptions.length;
  const activePasses = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Active').length;
  const expiringSoonPasses = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Expiring Soon').length;
  const expiredPasses = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Expired').length;

  const statuses = ['All', 'Active', 'Expiring Soon', 'Expired', 'Cancelled', 'Suspended'];

  const filteredSubscriptions = driverSubscriptions.filter((sub) => {
    return statusFilter === 'All' || sub.subscriptionStatus === statusFilter;
  });

  const columns: Column<DriverSubscription>[] = [
    {
      key: 'driverName',
      header: 'Driver',
      render: (sub) => (
        <div className="flex items-center gap-2.5">
          <img
            src={sub.driverAvatar}
            alt={sub.driverName}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <span className="font-bold text-slate-900">{sub.driverName}</span>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Subscription Plan',
      render: (sub) => <span className="font-bold text-slate-800">{sub.planName}</span>,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (sub) => <span className="text-slate-600">{sub.startDate}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (sub) => <span className="font-semibold text-slate-800">{sub.expiryDate}</span>,
    },
    {
      key: 'amount',
      header: 'Pass Fee',
      render: (sub) => (
        <span className="font-bold text-slate-900">₹{sub.amount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (sub) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.paymentStatus === 'Successful'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
        >
          {sub.paymentStatus}
        </span>
      ),
    },
    {
      key: 'subscriptionStatus',
      header: 'Pass Status',
      render: (sub) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.subscriptionStatus === 'Active'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : sub.subscriptionStatus === 'Expiring Soon'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
        >
          {sub.subscriptionStatus}
        </span>
      ),
    },
    {
      key: 'tripActivity',
      header: 'Trip Activity',
      render: (sub) => (
        <div>
          <div className="font-bold text-slate-800">{sub.completedBookings} Completed</div>
          <div className="text-[10px] text-slate-400">{sub.bookingsReceived} Requests Received</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (sub) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedDriverId(sub.driverId);
              setActiveTab('driver-details');
            }}
            className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
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
          {/* Total Subscriptions */}
          <div className="sm:px-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Subscriptions</p>
              <h4 className="text-xl font-bold text-slate-900 mt-1">{totalSubscriptions}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Enrolled driver passes</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>

          {/* Active Passes */}
          <div className="sm:px-4 pt-3 sm:pt-0 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Passes</p>
              <h4 className="text-xl font-bold text-emerald-700 mt-1">{activePasses}</h4>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Eligible for dispatches</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="sm:px-4 pt-3 sm:pt-0 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expiring Soon</p>
              <h4 className="text-xl font-bold text-amber-700 mt-1">{expiringSoonPasses}</h4>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">Requires pass renewal</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Expired Passes */}
          <div className="sm:px-4 pt-3 sm:pt-0 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expired Passes</p>
              <h4 className="text-xl font-bold text-rose-700 mt-1">{expiredPasses}</h4>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">Ineligible for dispatches</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      <DataTable<DriverSubscription>
        columns={columns}
        data={filteredSubscriptions}
        keyExtractor={(sub) => sub.id}
        pageSize={8}
        rowClassName={(sub) =>
          sub.subscriptionStatus === 'Expiring Soon'
            ? 'bg-amber-50/60 hover:bg-amber-100/70 border-l-4 border-l-amber-500'
            : sub.subscriptionStatus === 'Expired'
              ? 'bg-rose-50/60 hover:bg-rose-100/70 border-l-4 border-l-rose-500'
              : sub.subscriptionStatus === 'Active'
                ? 'bg-emerald-50/30 hover:bg-emerald-100/50 border-l-4 border-l-emerald-500'
                : 'bg-slate-100/60 hover:bg-slate-200/60 border-l-4 border-l-slate-400'
        }
        searchPlaceholder="Search driver name, plan title..."
        searchFilterKeys={['driverName', 'planName']}
        emptyMessage="No driver subscription records match the selected status."
        headerActions={
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* <button
              onClick={() => setActiveTab('driver-subscription-plans')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <Award className="w-4 h-4" /> Manage Subscription Plans
            </button> */}
          </div>
        }
      />
    </div>
  );
}
