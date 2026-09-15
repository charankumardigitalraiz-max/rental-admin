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
    <div className="space-y-6 max-w-4xl">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Store & System Configurations</h3>
          <p className="text-xs text-slate-500">Business details, GST tax rates, default currency (INR ₹), and rules</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card-white p-6 space-y-6 text-xs">
        {/* Business Info */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Business Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Car Rental Agency Name</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Currency Format</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="INR (₹)"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-100 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Support Hotline Phone</label>
              <input
                type="text"
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Support Email</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Head Office Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
            />
          </div>
        </div>

        {/* Taxes & Rules */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Taxes & Automated Rules</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={form.taxRatePercent}
                onChange={(e) => setForm({ ...form, taxRatePercent: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoApprove"
                checked={form.autoApproveBookings}
                onChange={(e) => setForm({ ...form, autoApproveBookings: e.target.checked })}
                className="rounded text-primary accent-primary"
              />
              <label htmlFor="autoApprove" className="font-semibold text-slate-800">
                Auto-approve verified customer booking orders
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="smsNotif"
                checked={form.smsNotifications}
                onChange={(e) => setForm({ ...form, smsNotifications: e.target.checked })}
                className="rounded text-primary accent-primary"
              />
              <label htmlFor="smsNotif" className="font-semibold text-slate-800">
                Send SMS notifications & trip updates to drivers
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
