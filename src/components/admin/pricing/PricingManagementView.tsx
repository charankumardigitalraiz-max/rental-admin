'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  Car,
  Building2,
  Zap,
  Save,
  CheckCircle,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { LocalPricingConfig, OutstationPricingConfig, ValetPricingConfig, PricingRule } from '@/types';

export default function PricingManagementView() {
  const {
    localPricing,
    outstationPricing,
    valetPricing,
    pricingRules,
    updateLocalPricing,
    updateOutstationPricing,
    updateValetPricing,
    addPricingRule,
    togglePricingRuleStatus,
  } = useRentalStore();

  const [activeTab, setActiveTab] = useState<'local' | 'outstation' | 'valet' | 'rules'>('local');
  const [localForm, setLocalForm] = useState<LocalPricingConfig>(localPricing);
  const [outstationForm, setOutstationForm] = useState<OutstationPricingConfig>(outstationPricing);
  const [valetForm, setValetForm] = useState<ValetPricingConfig>(valetPricing);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Rule Form Modal state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleName: '',
    service: 'All' as PricingRule['service'],
    condition: '',
    type: 'Percentage' as PricingRule['type'],
    value: 15,
    priority: 'Medium' as PricingRule['priority'],
    status: 'Active' as PricingRule['status'],
  });

  const handleSaveLocal = (e: React.FormEvent) => {
    e.preventDefault();
    updateLocalPricing(localForm);
    triggerSuccess();
  };

  const handleSaveOutstation = (e: React.FormEvent) => {
    e.preventDefault();
    updateOutstationPricing(outstationForm);
    triggerSuccess();
  };

  const handleSaveValet = (e: React.FormEvent) => {
    e.preventDefault();
    updateValetPricing(valetForm);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.ruleName.trim()) return;
    addPricingRule(newRule);
    setShowAddRuleModal(false);
    setNewRule({
      ruleName: '',
      service: 'All',
      condition: '',
      type: 'Percentage',
      value: 15,
      priority: 'Medium',
      status: 'Active',
    });
    triggerSuccess();
  };

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* Unified Pricing Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Local Driver Rate
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{localPricing.basePrice} <span className="text-xs text-slate-400 font-normal">/ min {localPricing.minDurationHours} hrs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">₹{localPricing.perHourPrice}/hr extra • {localPricing.driverSharePercent}% Driver Payout</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Outstation Daily Tariff
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{outstationPricing.basePrice} <span className="text-xs text-slate-400 font-normal">/ hrs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">₹{outstationPricing.perKmRate}/km extra • ₹{outstationPricing.driverFoodAllowancePerDay}/hrs food</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Valet Event Tariff
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{valetPricing.pricePerStaffPerHour} <span className="text-xs text-slate-400 font-normal">/ staff / hr</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{valetPricing.peakEventSurgePercent}% Event Surge • Min {valetPricing.minStaffRequirement} Staff</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 ${activeTab === 'local'
              ? 'border-[#023526] text-[#023526] bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Car className="w-4 h-4" />
            Local Driver Pricing
          </button>
          <button
            onClick={() => setActiveTab('outstation')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 ${activeTab === 'outstation'
              ? 'border-[#023526] text-[#023526] bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <TrendingUp className="w-4 h-4" />
            Outstation Pricing
          </button>
          <button
            onClick={() => setActiveTab('valet')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 ${activeTab === 'valet'
              ? 'border-[#023526] text-[#023526] bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Building2 className="w-4 h-4" />
            Valet Event Pricing
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 ${activeTab === 'rules'
              ? 'border-[#023526] text-[#023526] bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Zap className="w-4 h-4" />
            Surge Rules ({pricingRules.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* LOCAL DRIVER */}
          {activeTab === 'local' && (
            <form onSubmit={handleSaveLocal} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Fare (₹)
                  </label>
                  <input
                    type="number"
                    value={localForm.basePrice}
                    onChange={(e) => setLocalForm({ ...localForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Minimum base booking price</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Duration Included (Hours)
                  </label>
                  <input
                    type="number"
                    value={localForm.minDurationHours}
                    onChange={(e) => setLocalForm({ ...localForm, minDurationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Hours covered in base fare</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rate Per Additional Hour (₹)
                  </label>
                  <input
                    type="number"
                    value={localForm.perHourPrice}
                    onChange={(e) => setLocalForm({ ...localForm, perHourPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Charge for each extra hour</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Night Allowance Surcharge (₹)
                  </label>
                  <input
                    type="number"
                    value={localForm.nightCharge}
                    onChange={(e) => setLocalForm({ ...localForm, nightCharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Applies 10 PM - 6 AM</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Platform Commission (%)
                  </label>
                  <input
                    type="number"
                    value={localForm.platformCommissionPercent}
                    onChange={(e) => setLocalForm({ ...localForm, platformCommissionPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Platform revenue share</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Driver Share (%)
                  </label>
                  <input
                    type="number"
                    value={localForm.driverSharePercent}
                    onChange={(e) => setLocalForm({ ...localForm, driverSharePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Driver payout share</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#023526] hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Local Pricing Configuration
                </button>
              </div>
            </form>
          )}

          {/* OUTSTATION DRIVER */}
          {activeTab === 'outstation' && (
            <form onSubmit={handleSaveOutstation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Outstation Base Tariff (₹)
                  </label>
                  <input
                    type="number"
                    value={outstationForm.basePrice}
                    onChange={(e) => setOutstationForm({ ...outstationForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Per Day Tariff Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={outstationForm.perDayRate}
                    onChange={(e) => setOutstationForm({ ...outstationForm, perDayRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Driver Food Allowance (₹ / Day)
                  </label>
                  <input
                    type="number"
                    value={outstationForm.driverFoodAllowancePerDay}
                    onChange={(e) => setOutstationForm({ ...outstationForm, driverFoodAllowancePerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Night Stay Allowance (₹ / Night)
                  </label>
                  <input
                    type="number"
                    value={outstationForm.nightAllowancePerNight}
                    onChange={(e) => setOutstationForm({ ...outstationForm, nightAllowancePerNight: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Platform Commission (%)
                  </label>
                  <input
                    type="number"
                    value={outstationForm.platformCommissionPercent}
                    onChange={(e) => setOutstationForm({ ...outstationForm, platformCommissionPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#023526] hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Outstation Pricing Configuration
                </button>
              </div>
            </form>
          )}

          {/* VALET EVENT */}
          {activeTab === 'valet' && (
            <form onSubmit={handleSaveValet} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hourly Rate Per Valet Staff (₹)
                  </label>
                  <input
                    type="number"
                    value={valetForm.pricePerStaffPerHour}
                    onChange={(e) => setValetForm({ ...valetForm, pricePerStaffPerHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Staff Requirement
                  </label>
                  <input
                    type="number"
                    value={valetForm.minStaffRequirement}
                    onChange={(e) => setValetForm({ ...valetForm, minStaffRequirement: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peak Event Surge (%)
                  </label>
                  <input
                    type="number"
                    value={valetForm.peakEventSurgePercent}
                    onChange={(e) => setValetForm({ ...valetForm, peakEventSurgePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#023526] hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Valet Event Configuration
                </button>
              </div>
            </form>
          )}

          {/* SURGE RULES */}
          {activeTab === 'rules' && (() => {
            const ruleColumns: Column<PricingRule>[] = [
              {
                key: 'ruleName',
                header: 'Rule Name',
                render: (r) => <span className="font-bold text-slate-900">{r.ruleName}</span>,
              },
              {
                key: 'service',
                header: 'Service Scope',
                render: (r) => (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {r.service}
                  </span>
                ),
              },
              {
                key: 'condition',
                header: 'Condition',
                render: (r) => <span className="text-slate-600">{r.condition}</span>,
              },
              {
                key: 'value',
                header: 'Surge Value',
                render: (r) => (
                  <span className="font-bold text-amber-700">
                    +{r.value}{r.type === 'Percentage' ? '%' : ' ₹'}
                  </span>
                ),
              },
              {
                key: 'priority',
                header: 'Priority',
                render: (r) => (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}
                  >
                    {r.priority}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (r) => (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                  >
                    {r.status}
                  </span>
                ),
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right',
                render: (r) => (
                  <button
                    onClick={() => togglePricingRuleStatus(r.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${r.status === 'Active'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                  >
                    {r.status === 'Active' ? 'Disable' : 'Enable'}
                  </button>
                ),
              },
            ];

            return (
              <div className="space-y-4">
                <DataTable<PricingRule>
                  columns={ruleColumns}
                  data={pricingRules}
                  keyExtractor={(r) => r.id}
                  pageSize={5}
                  searchPlaceholder="Search rule name or condition..."
                  searchFilterKeys={['ruleName', 'service', 'condition']}
                  emptyMessage="No dynamic surge rules configured."
                  headerActions={
                    <button
                      onClick={() => setShowAddRuleModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#023526] text-white text-xs font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Surge Rule
                    </button>
                  }
                />
              </div>
            );
          })()}
        </div>
      </div>

      {/* Add Surge Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Dynamic Surge Rule</h3>
            <form onSubmit={handleAddRuleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Peak Surge"
                  value={newRule.ruleName}
                  onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Service</label>
                <select
                  value={newRule.service}
                  onChange={(e) => setNewRule({ ...newRule, service: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="All">All Services</option>
                  <option value="Local Driver">Local Driver</option>
                  <option value="Outstation Driver">Outstation Driver</option>
                  <option value="Valet Staff">Valet Staff</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peak Rain Hours or Weekend 6PM-11PM"
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Surge Type</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Surge Value</label>
                  <input
                    type="number"
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#023526] text-white font-bold rounded-lg hover:bg-emerald-900"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
