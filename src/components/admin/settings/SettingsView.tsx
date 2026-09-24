'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Settings, Save, CheckCircle2, IndianRupee, Globe, Phone, Mail, MapPin } from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings } = useRentalStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Store & System Configurations</h3>
          <p className="text-xs text-slate-500">Business details, GST tax rates, default currency (INR ₹), and rules</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Card 1: Business Info */}
        {/* <div className="card-white p-6 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Business Information</span>
            {saved && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4" /> Settings Saved!
              </span>
            )}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Platform / Agency Name</label>
              <input
                type="text"
                value={form.platformName || ''}
                onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-slate-300 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Currency Format</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`INR (${form.currencySymbol || '₹'})`}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white font-bold shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Support Hotline Phone</label>
              <input
                type="text"
                value={form.contactPhone || ''}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-slate-300 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Support Email</label>
              <input
                type="email"
                value={form.contactEmail || ''}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-slate-300 shadow-2xs"
              />
            </div>
          </div>
        </div> */}

        {/* Card 2: Driver Trip Hourly Charges */}
        <div className="card-white p-6 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 text-sm">Driver Trip Hourly Charges</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">Configure hourly rates for instation (local city) and outstation driver trip bookings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Instation / Local Driver Hourly Charge (₹ / Hour)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={form.localDriverHourlyRate ?? 150}
                  onChange={(e) => setForm({ ...form, localDriverHourlyRate: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-slate-300 shadow-2xs font-bold"
                  placeholder="150"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Hourly charge rate for local city driver bookings</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Outstation Driver Hourly Charge (₹ / Hour)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={form.outstationDriverHourlyRate ?? 220}
                  onChange={(e) => setForm({ ...form, outstationDriverHourlyRate: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-slate-300 shadow-2xs font-bold"
                  placeholder="220"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Hourly charge rate for intercity / outstation driver trips</span>
            </div>
          </div>
        </div>

        {/* Card 3: Valet Parking & Hourly Charges Card */}
        <div className="card-white p-6 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 text-sm">Valet Parking & Hourly Charges</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">Configure default valet parking rates, minimum notice window, and hourly fees</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Valet Parking Hourly Charge (₹ / Hour)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={form.valetHourlyRate ?? 250}
                  onChange={(e) => setForm({ ...form, valetHourlyRate: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-slate-300 shadow-2xs font-bold"
                  placeholder="250"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Default hourly charge per valet staff member for events</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Minimum Booking Notice Window (Hours)</label>
              <input
                type="number"
                value={form.valetMinNoticeHours ?? 4}
                onChange={(e) => setForm({ ...form, valetMinNoticeHours: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-slate-300 shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Minimum advance notice required before event start time</span>
            </div>
          </div>
        </div>

        {/* Card 3: Taxes & Automated Rules */}
        {/* <div className="card-white p-6 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Taxes & Automated Rules</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={form.gstTaxPercent ?? 18}
                onChange={(e) => setForm({ ...form, gstTaxPercent: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-slate-300 shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoDriverMatching"
                checked={form.autoDriverMatching ?? true}
                onChange={(e) => setForm({ ...form, autoDriverMatching: e.target.checked })}
                className="rounded text-primary accent-primary"
              />
              <label htmlFor="autoDriverMatching" className="font-semibold text-slate-800">
                Auto-match nearest available drivers to incoming requests
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="driverSubscriptionMandatory"
                checked={form.driverSubscriptionMandatory ?? true}
                onChange={(e) => setForm({ ...form, driverSubscriptionMandatory: e.target.checked })}
                className="rounded text-primary accent-primary"
              />
              <label htmlFor="driverSubscriptionMandatory" className="font-semibold text-slate-800">
                Mandatory active driver subscription plan for duty eligibility
              </label>
            </div>
          </div>
        </div> */}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold flex items-center gap-2 shadow-xs transition-all text-xs"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
