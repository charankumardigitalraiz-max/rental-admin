'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function DriverSubscriptionPlansView() {
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
      alert('Only 1 subscription plan is allowed in the system.');
      return;
    }
    if (!formData.name) return;

    createSubscriptionPlan({
      ...formData,
      features: formData.features.split(',').map((f) => f.trim()),
    });

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
          <button
            onClick={() => {
              setSelectedDriverId(sub.driverId);
              setActiveTab('driver-details');
            }}
            className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors"
            title="View Driver Profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">


      {/* Latest Driver Subscription Plan Card (Horizontal Layout with Enhanced Colors) */}
      {subscriptionPlans.length > 0 && (() => {
        const plan = subscriptionPlans[subscriptionPlans.length - 1];
        return (
          <div className="card-white p-5 border border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/20 rounded-xl shadow-xs border-l-4 border-l-emerald-600 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Plan Title & Validity */}
              <div className="space-y-1.5 lg:max-w-xs shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[10.5px] uppercase tracking-wider text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-md">
                    {plan.durationDays} Days Pass
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All-Inclusive Pass
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{plan.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.
                </p>
              </div>

              {/* Middle Column: Access Rules & Features (Horizontal Status Pills) */}
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div
                  className={`flex-1 min-w-[140px] p-3 rounded-lg text-xs space-y-1 border ${plan.localEligible
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                    }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Local City Rides</span>
                  <div className="font-bold flex items-center gap-1 text-xs sm:text-sm">
                    {plan.localEligible ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700">Full Access ✓</span>
                      </>
                    ) : (
                      <span className="text-rose-600">Not Allowed ✕</span>
                    )}
                  </div>
                </div>

                <div
                  className={`flex-1 min-w-[140px] p-3 rounded-lg text-xs space-y-1 border ${plan.outstationEligible
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                    }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Outstation Trips</span>
                  <div className="font-bold flex items-center gap-1 text-xs sm:text-sm">
                    {plan.outstationEligible ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700">Full Access ✓</span>
                      </>
                    ) : (
                      <span className="text-rose-600">Not Allowed ✕</span>
                    )}
                  </div>
                </div>

                {/* <div className="flex-1 min-w-[140px] p-3 bg-slate-50/90 border border-slate-200/90 rounded-lg text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Monthly Dispatch Limit</span>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    {plan.maxRequestsPerDay >= 999 ? 'Unlimited Requests / Month' : `${plan.maxRequestsPerDay} Requests / Day`}
                  </div>
                </div> */}
              </div>

              {/* Right Column: Price Tag & Edit Button */}
              <div className="flex items-center gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subscription Fee</span>
                  <div className="text-2xl font-bold text-emerald-700">
                    ₹{plan.price.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-500"> / {plan.durationDays}d</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs hover:shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Config
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Subscribed Drivers List Below */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Subscribed Drivers ({driverSubscriptions.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              List of all drivers with active, expiring, or expired subscription passes.
            </p>
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
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
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
        maxWidth="md"
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
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Validity (Days)</label>
              <input
                type="number"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 block">Booking Access Rules:</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="localElig"
                checked={formData.localEligible}
                onChange={(e) => setFormData({ ...formData, localEligible: e.target.checked })}
                className="rounded text-primary focus:ring-primary"
              />
              <label htmlFor="localElig" className="text-xs font-semibold text-slate-800">
                Allow Local City Driver Bookings
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="outElig"
                checked={formData.outstationEligible}
                onChange={(e) => setFormData({ ...formData, outstationEligible: e.target.checked })}
                className="rounded text-primary focus:ring-primary"
              />
              <label htmlFor="outElig" className="text-xs font-semibold text-slate-800">
                Allow Outstation / Long-Distance Driving Bookings
              </label>
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
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg text-xs shadow-xs hover:bg-primary-hover"
            >
              Create Subscription Plan
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
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Validity (Days)</label>
                <input
                  type="number"
                  required
                  value={editingPlan.durationDays}
                  onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
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
            </div>

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
