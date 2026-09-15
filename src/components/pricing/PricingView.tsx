'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Tag, IndianRupee, ShieldCheck, Zap, Plus } from 'lucide-react';

export default function PricingView() {
  const { pricingPlans } = useRentalStore();

  return (
    <div className="space-y-6">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Rental Tariff Plans & Rules</h3>
          <p className="text-xs text-slate-500">Configure base rates, free daily km limits, extra mileage charges, and weekend surge rates in ₹</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Create Pricing Tariff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <div key={plan.id} className="card-white card-white-hover p-5 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded uppercase">
                {plan.category}
              </span>
              <h4 className="font-bold text-slate-900 text-base mt-2">{plan.title}</h4>

              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Daily Tariff:</span>
                  <span className="font-bold text-slate-900">₹{plan.dailyRate.toLocaleString('en-IN')}/day</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Weekly Package:</span>
                  <span className="font-bold text-slate-900">₹{plan.weeklyRate.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Monthly Lease:</span>
                  <span className="font-bold text-slate-900">₹{plan.monthlyRate.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Free Mileage / Day:</span>
                  <span className="font-semibold text-slate-800">{plan.freeKmPerDay} km</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Extra Mileage Charge:</span>
                  <span className="font-semibold text-slate-800">₹{plan.extraKmRate}/km</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Weekend Surge:</span>
                  <span className="font-semibold text-amber-700">+{plan.weekendSurgePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Refundable Security Deposit:</span>
                  <span className="font-bold text-emerald-600">₹{plan.securityDeposit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors">
              Edit Plan Rules
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
