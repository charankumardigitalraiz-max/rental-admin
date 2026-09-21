'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import { SubscriptionPlan, DriverSubscription } from '@/types';
import Modal from '@/components/ui/Modal';
import DataTable, { Column } from '@/components/ui/DataTable';
import {
  Ticket,
  Plus,
  CheckCircle2,
  Edit3,
  Award,
  Filter,
  Eye,
  Info,
  Sparkles,
  ShieldCheck,
  X,
  Check,
} from 'lucide-react';

import { useToast } from '@/context/ToastContext';

export default function DriverSubscriptionPlansView() {
  const { toast } = useToast();
  const {
    subscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    togglePlanStatus,
    driverSubscriptions,
    setActiveTab,
    setSelectedDriverId,
  } = useRentalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const activeSubscribedDrivers = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Active');
  const expiringSoonSubscribedDrivers = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Expiring Soon');
  const expiredSubscribedDrivers = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Expired');

  const totalSubscriptionRevenue = driverSubscriptions
    .filter((s) => s.paymentStatus === 'Successful')
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  const activeSubscriptionRevenue = activeSubscribedDrivers
    .filter((s) => s.paymentStatus === 'Successful')
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  const hasPlanLimitReached = subscriptionPlans.length >= 1;

  const [formData, setFormData] = useState({
    name: '',
    price: 999,
    durationDays: 30,
    localEligible: true,
    outstationEligible: false,
    maxRequestsPerDay: 10,
    features: 'Local city driver bookings, Standard dispatch priority, 24/7 Helpline',
    status: 'Active' as SubscriptionPlan['status'],
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasPlanLimitReached) {
      toast.warning('Plan Limit Reached', 'Only 1 active subscription pass plan is permitted.');
      return;
    }
    if (!formData.name) return;

    createSubscriptionPlan({
      ...formData,
      features: formData.features.split(',').map((f) => f.trim()),
    });

    toast.success('Subscription Plan Created', `Pass "${formData.name}" configured successfully.`);

    setIsModalOpen(false);
    setFormData({
      name: '',
      price: 999,
      durationDays: 30,
      localEligible: true,
      outstationEligible: false,
      maxRequestsPerDay: 10,
      features: 'Local city driver bookings, Standard dispatch priority, 24/7 Helpline',
      status: 'Active',
    });
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    updateSubscriptionPlan(editingPlan.id, {
      ...editingPlan,
      features: Array.isArray(editingPlan.features)
        ? editingPlan.features
        : String(editingPlan.features).split(',').map((f) => f.trim()),
    });

    toast.success('Plan Configuration Saved', `Updated rules for "${editingPlan.name}".`);

    setEditingPlan(null);
  };

  const statuses = ['All', 'Active', 'Expiring Soon', 'Expired', 'Cancelled', 'Suspended'];

  const filteredSubscriptions = driverSubscriptions.filter((sub) => {
    return statusFilter === 'All' || sub.subscriptionStatus === statusFilter;
  });

  const subscriptionColumns: Column<DriverSubscription>[] = [
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
          <Link
            href={`/admin/drivers/${sub.driverId}`}
            className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
            title="View Driver Profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">


      {/* Latest Driver Subscription Plan Card / Create Plan Card */}
      {subscriptionPlans.length > 0 ? (
        (() => {
          const plan = subscriptionPlans[subscriptionPlans.length - 1];
          return (
            <div className="p-5 bg-gradient-to-r from-[#011f16] via-[#023526] to-[#034432] text-white rounded-xl shadow-md border border-[#fcd34d]/50 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                {/* Left Column: Plan Title & Validity */}
                <div className="space-y-1.5 lg:max-w-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[10.5px] uppercase tracking-wider text-[#fcd34d] bg-[#012319] border border-[#fcd34d]/50 px-2.5 py-0.5 rounded-md">
                      {plan.durationDays} Days Pass
                    </span>
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> All-Inclusive Pass
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-[#fef3c7]/90 font-medium">
                    Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.
                  </p>
                </div>

                {/* Middle Column: Access Rules & Features (Horizontal Status Pills with Light Backgrounds) */}
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div
                    className={`flex-1 min-w-[140px] p-3 rounded-lg text-xs space-y-1 border shadow-2xs ${plan.localEligible
                      ? 'bg-white text-slate-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-950 border-rose-200'
                      }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">Local City Rides</span>
                    <div className="font-bold flex items-center gap-1 text-xs sm:text-sm">
                      {plan.localEligible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-emerald-700 font-extrabold">Full Access ✓</span>
                        </>
                      ) : (
                        <span className="text-rose-600 font-extrabold">Not Allowed ✕</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex-1 min-w-[140px] p-3 rounded-lg text-xs space-y-1 border shadow-2xs ${plan.outstationEligible
                      ? 'bg-white text-slate-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-950 border-rose-200'
                      }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">Outstation Trips</span>
                    <div className="font-bold flex items-center gap-1 text-xs sm:text-sm">
                      {plan.outstationEligible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-emerald-700 font-extrabold">Full Access ✓</span>
                        </>
                      ) : (
                        <span className="text-rose-600 font-extrabold">Not Allowed ✕</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Price Tag & Edit Button */}
                <div className="flex items-center gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-emerald-800/60">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#fef3c7] uppercase tracking-wider block">Subscription Fee</span>
                    <div className="text-2xl font-extrabold text-[#fcd34d]">
                      ₹{plan.price.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-[#fef3c7]/80"> / {plan.durationDays}d</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="px-4 py-2.5 bg-[#fcd34d] hover:bg-[#fbbf24] text-[#011f16] rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Config
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="p-6 bg-gradient-to-r from-[#011f16] via-[#023526] to-[#034432] text-white rounded-xl shadow-md border border-[#fcd34d]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <Award className="w-5 h-5 text-[#fcd34d]" /> No Active Driver Subscription Plan
            </h3>
            <p className="text-xs text-[#fef3c7]/90 font-medium">
              Create a pass plan to specify validity duration, price, and driver trip eligibility.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#fcd34d] hover:bg-[#fbbf24] text-[#011f16] rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Subscription Plan
          </button>
        </div>
      )}

      {/* Subscribed Drivers List Below */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between ml-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Subscribed Drivers ({driverSubscriptions.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              List of all drivers with active, expiring, or expired subscription passes.
            </p>
          </div>
        </div>

        {/* Member Subscription Stats Band */}
        <div className="card-white p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
            {/* Active Members & Active Pass Revenue */}
            <div className="sm:px-4 space-y-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Active Subscriptions</span>
              <div className="text-xl font-bold text-emerald-700">{activeSubscribedDrivers.length} Active Drivers</div>
              <span className="text-[10px] text-emerald-600 font-semibold block">₹{activeSubscriptionRevenue.toLocaleString('en-IN')} Active Pass Revenue</span>
            </div>

            {/* Expiring Soon Members */}
            <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">Expiring Soon</span>
              <div className="text-xl font-bold text-amber-700">{expiringSoonSubscribedDrivers.length} Drivers</div>
              <span className="text-[10px] text-amber-600 font-medium block">Requires pass renewal</span>
            </div>

            {/* Expired Members */}
            <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700 block">Expired Passes</span>
              <div className="text-xl font-bold text-rose-700">{expiredSubscribedDrivers.length} Drivers</div>
              <span className="text-[10px] text-rose-600 font-medium block">Blocked from dispatches</span>
            </div>

            {/* Total Subscription Revenue */}
            <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary block">Total Pass Revenue</span>
              <div className="text-xl font-bold text-primary">₹{totalSubscriptionRevenue.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-slate-500 font-medium block">Total Subscription Payouts</span>
            </div>
          </div>
        </div>

        <DataTable<DriverSubscription>
          columns={subscriptionColumns}
          data={filteredSubscriptions}
          keyExtractor={(sub) => sub.id}
          pageSize={6}
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
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          }
        />
      </div>

      {/* 1. Add New Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Driver Subscription Plan"
        subtitle="Set pass title, price, duration, and local/outstation booking eligibility rules"
        icon={Ticket}
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePlan} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold text-xs mb-1">Plan Pass Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Executive Outstation Pass"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Validity (Days)</label>
              <input
                type="number"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-xs mb-1">
              Plan Features (Comma separated)
            </label>
            <textarea
              rows={2}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Create Subscription Plan
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit Plan Modal */}
      {editingPlan && (
        <Modal
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          title={`Edit Plan: ${editingPlan.name}`}
          subtitle="Modify pricing, validity, or eligibility rules"
          icon={Edit3}
          maxWidth="md"
        >
          <form onSubmit={handleUpdatePlan} className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Plan Pass Name</label>
              <input
                type="text"
                required
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Validity (Days)</label>
                <input
                  type="number"
                  required
                  value={editingPlan.durationDays}
                  onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editLocal"
                  checked={editingPlan.localEligible}
                  onChange={(e) => setEditingPlan({ ...editingPlan, localEligible: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="editLocal" className="text-xs font-semibold text-slate-800">
                  Allow Local City Driver Bookings
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editOut"
                  checked={editingPlan.outstationEligible}
                  onChange={(e) => setEditingPlan({ ...editingPlan, outstationEligible: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="editOut" className="text-xs font-semibold text-slate-800">
                  Allow Outstation / Long-Distance Driving Bookings
                </label>
              </div>
            </div> */}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg text-xs shadow-xs hover:bg-primary-hover"
              >
                Update Plan Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
