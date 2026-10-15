'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
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
  Trash2,
  RefreshCw,
  Power,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

import { useToast } from '@/context/ToastContext';

export default function DriverSubscriptionPlansView() {
  const { toast } = useToast();

  // Zustand Store for API Integration
  const {
    subscriptionPlans,
    isLoading,
    isSubmitting,
    fetchSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    togglePlanStatus,
    deleteSubscriptionPlan,
  } = useSubscriptionStore();

  // Rental store for driver subscriptions dataset
  const {
    driverSubscriptions,
    setActiveTab,
    setSelectedDriverId,
  } = useRentalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  // Load plans on mount via Zustand store
  useEffect(() => {
    fetchSubscriptionPlans();
  }, [fetchSubscriptionPlans]);

  const activeSubscribedDrivers = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Active');
  const expiringSoonSubscribedDrivers = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Expiring Soon');
  const expiredSubscribedDrivers = driverSubscriptions.filter((s) => s.subscriptionStatus === 'Expired');

  const totalSubscriptionRevenue = driverSubscriptions
    .filter((s) => s.paymentStatus === 'Successful')
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  const activeSubscriptionRevenue = activeSubscribedDrivers
    .filter((s) => s.paymentStatus === 'Successful')
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  const [formData, setFormData] = useState({
    name: '',
    description: 'Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.',
    price: 999,
    durationDays: 30,
    localEligible: true,
    outstationEligible: true,
    maxRequestsPerDay: 999,
    features: 'Unlimited Local & Outstation Ride Dispatches, Instant Priority Dispatch Matching, Zero Commission Surcharge on Completed Trips, 24/7 Driver Support & Helpline',
    status: 'Active' as SubscriptionPlan['status'],
  });

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Validation Error', 'Please enter a valid plan pass name.');
      return;
    }

    const res = await createSubscriptionPlan({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      durationDays: Number(formData.durationDays),
      localEligible: formData.localEligible,
      outstationEligible: formData.outstationEligible,
      maxRequestsPerDay: Number(formData.maxRequestsPerDay),
      features: formData.features,
      status: formData.status,
    });

    if (res.success) {
      toast.success('Subscription Plan Created', `Pass "${formData.name}" configured successfully.`);
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: 'Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.',
        price: 999,
        durationDays: 30,
        localEligible: true,
        outstationEligible: true,
        maxRequestsPerDay: 999,
        features: 'Unlimited Local & Outstation Ride Dispatches, Instant Priority Dispatch Matching, Zero Commission Surcharge on Completed Trips, 24/7 Driver Support & Helpline',
        status: 'Active',
      });
    } else {
      toast.error('Creation Failed', res.error || 'Could not create subscription plan.');
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const planId = editingPlan.id || editingPlan._id;
    if (!planId) return;

    const res = await updateSubscriptionPlan(planId, {
      name: editingPlan.name.trim(),
      description: editingPlan.description?.trim(),
      price: Number(editingPlan.price),
      durationDays: Number(editingPlan.durationDays),
      localEligible: editingPlan.localEligible,
      outstationEligible: editingPlan.outstationEligible,
      maxRequestsPerDay: Number(editingPlan.maxRequestsPerDay),
      features: editingPlan.features,
      status: editingPlan.status,
    });

    if (res.success) {
      toast.success('Plan Configuration Saved', `Updated rules for "${editingPlan.name}".`);
      setEditingPlan(null);
    } else {
      toast.error('Update Failed', res.error || 'Could not update subscription plan.');
    }
  };

  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    const res = await togglePlanStatus(plan);
    if (res.success) {
      toast.success(
        `Plan ${res.newStatus}`,
        `"${plan.name}" is now marked as ${res.newStatus}.`
      );
    } else {
      toast.error('Action Failed', res.error || 'Failed to update plan status.');
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    const planId = planToDelete.id || planToDelete._id;
    if (!planId) return;

    const res = await deleteSubscriptionPlan(planId);
    if (res.success) {
      toast.success('Plan Deleted', `Successfully removed "${planToDelete.name}".`);
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
    } else {
      toast.error('Delete Failed', res.error || 'Failed to delete subscription plan.');
    }
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

  // Primary active plan for top showcase
  const primaryPlan =
    subscriptionPlans.find((p) => p.status === 'Active') ||
    subscriptionPlans[0] ||
    null;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Section: Loading Skeleton / Single Plan Card / Empty State */}
      {isLoading && subscriptionPlans.length === 0 ? (
        <div className="card-white p-5 rounded-xl border border-slate-200 shadow-2xs animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2.5 max-w-sm">
              <div className="h-4 bg-slate-200 rounded w-28" />
              <div className="h-6 bg-slate-200 rounded w-48" />
              <div className="h-3.5 bg-slate-100 rounded w-64" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 bg-slate-200 rounded w-28" />
              <div className="h-9 bg-slate-200 rounded w-24" />
            </div>
          </div>
        </div>
      ) : primaryPlan ? (
        <div className="card-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Plan Info & Badges */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                  {primaryPlan.durationDays} Days Pass
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 border ${primaryPlan.status === 'Active'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-slate-600 bg-slate-50 border-slate-200'
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${primaryPlan.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                  />
                  {primaryPlan.status === 'Active' ? 'Active Plan' : 'Inactive Plan'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{primaryPlan.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {primaryPlan.description ||
                    'Grants complete driver access for receiving both Local City and Outstation customer trip dispatches.'}
                </p>
              </div>

              {/* Ride Eligibility Chips */}
              {/* <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${primaryPlan.localEligible
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                >
                  {primaryPlan.localEligible ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  Local City Rides
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${primaryPlan.outstationEligible
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                >
                  {primaryPlan.outstationEligible ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  Outstation Trips
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                  Max Trips/Day: {primaryPlan.maxRequestsPerDay >= 999 ? 'Unlimited' : `${primaryPlan.maxRequestsPerDay} Dispatches`}
                </span>
              </div> */}
            </div>

            {/* Right: Pricing & Actions */}
            <div className="flex items-center justify-between lg:justify-end gap-5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="text-left lg:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subscription Price
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  ₹{primaryPlan.price.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-500"> / {primaryPlan.durationDays}d</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchSubscriptionPlans({}, false)}
                  disabled={isLoading}
                  className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-xs transition-all disabled:opacity-50"
                  title="Refresh Plan"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                </button>
                <button
                  onClick={() => handleToggleStatus(primaryPlan)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${primaryPlan.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  title={primaryPlan.status === 'Active' ? 'Deactivate Pass' : 'Activate Pass'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{primaryPlan.status === 'Active' ? 'Active' : 'Inactive'}</span>
                </button>
                <button
                  onClick={() => setEditingPlan(primaryPlan)}
                  className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                  title="Edit Configuration"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
              <Ticket className="w-5 h-5 text-primary" /> No Driver Subscription Plan Configured
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Create a pass plan to specify validity duration, price, and driver trip eligibility.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
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

        {/* Member Subscription Stats - Individual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Members & Active Pass Revenue */}
          <div className="card-white p-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">
              Active Subscriptions
            </span>
            <div className="text-xl font-bold text-emerald-700">
              {activeSubscribedDrivers.length} Active Drivers
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              ₹{activeSubscriptionRevenue.toLocaleString('en-IN')} Active Pass Revenue
            </span>
          </div>

          {/* Expiring Soon Members */}
          <div className="card-white p-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">
              Expiring Soon
            </span>
            <div className="text-xl font-bold text-amber-700">
              {expiringSoonSubscribedDrivers.length} Drivers
            </div>
            <span className="text-[10px] text-amber-600 font-medium block">Requires pass renewal</span>
          </div>

          {/* Expired Members */}
          <div className="card-white p-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700 block">
              Expired Passes
            </span>
            <div className="text-xl font-bold text-rose-700">
              {expiredSubscribedDrivers.length} Drivers
            </div>
            <span className="text-[10px] text-rose-600 font-medium block">Blocked from dispatches</span>
          </div>

          {/* Total Subscription Revenue */}
          <div className="card-white p-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary block">
              Total Pass Revenue
            </span>
            <div className="text-xl font-bold text-primary">
              ₹{totalSubscriptionRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">Total Subscription Payouts</span>
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
            <label className="block text-slate-700 font-semibold text-xs mb-1">
              Plan Pass Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Driver Monthly Pass"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-xs mb-1">Description</label>
            <input
              type="text"
              placeholder="Brief description of the pass rules"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Price (₹)</label>
              <input
                type="number"
                required
                min="0"
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
                min="1"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Max Trips / Day</label>
              <input
                type="number"
                min="1"
                value={formData.maxRequestsPerDay}
                onChange={(e) => setFormData({ ...formData, maxRequestsPerDay: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div> */}
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="block text-slate-700 font-semibold text-xs">Booking Eligibility</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createLocal"
                checked={formData.localEligible}
                onChange={(e) => setFormData({ ...formData, localEligible: e.target.checked })}
                className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="createLocal" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Allow Local City Driver Bookings
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createOut"
                checked={formData.outstationEligible}
                onChange={(e) => setFormData({ ...formData, outstationEligible: e.target.checked })}
                className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="createOut" className="text-xs font-semibold text-slate-800 cursor-pointer">
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
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Create Subscription Plan
                </>
              )}
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
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Plan Pass Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Description</label>
              <input
                type="text"
                value={editingPlan.description || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
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
                  min="1"
                  value={editingPlan.durationDays}
                  onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Max Trips / Day</label>
                <input
                  type="number"
                  min="1"
                  value={editingPlan.maxRequestsPerDay || 10}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, maxRequestsPerDay: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div> */}
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Status</label>
                <select
                  value={editingPlan.status}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      status: e.target.value as 'Active' | 'Inactive',
                    })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="block text-slate-700 font-semibold text-xs">Booking Eligibility</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editLocal"
                  checked={editingPlan.localEligible}
                  onChange={(e) => setEditingPlan({ ...editingPlan, localEligible: e.target.checked })}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="editLocal" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Allow Local City Driver Bookings
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editOut"
                  checked={editingPlan.outstationEligible}
                  onChange={(e) => setEditingPlan({ ...editingPlan, outstationEligible: e.target.checked })}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="editOut" className="text-xs font-semibold text-slate-800 cursor-pointer">
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
                value={
                  Array.isArray(editingPlan.features)
                    ? editingPlan.features.join(', ')
                    : String(editingPlan.features || '')
                }
                onChange={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    features: e.target.value.split(',').map((f) => f.trim()).filter(Boolean),
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setEditingPlan(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg text-xs shadow-xs hover:bg-primary-hover flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  'Update Plan Changes'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Delete Confirmation Modal */}
      {isDeleteModalOpen && planToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setPlanToDelete(null);
          }}
          title="Delete Subscription Plan"
          subtitle="Are you sure you want to permanently remove this plan?"
          icon={AlertTriangle}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              You are about to delete <strong className="text-slate-900">{planToDelete.name}</strong>.
              Drivers will no longer be able to purchase or renew this pass.
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPlanToDelete(null);
                }}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeletePlan}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Delete Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
