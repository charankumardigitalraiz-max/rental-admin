'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import Modal from '@/components/ui/Modal';
import { Ticket, Plus } from 'lucide-react';

export default function CouponsView() {
  const { coupons, addCoupon, toggleCouponStatus } = useRentalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [minRentalAmount, setMinRentalAmount] = useState(5000);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    addCoupon({
      code: code.toUpperCase().replace(/\s+/g, ''),
      discountType,
      discountValue,
      minRentalAmount,
      maxUsage: 250,
      validFrom: '2026-09-15',
      validUntil: '2026-12-31',
      status: 'Active',
    });

    setIsModalOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Promo Codes & Discount Campaigns</h3>
          <p className="text-xs text-slate-500">Manage promotional discounts, festive coupons, and referral offers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Coupon Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="card-white card-white-hover p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg">
                  {c.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount Offer:</span>
                  <span className="font-bold text-slate-900">
                    {c.discountType === 'Percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Min Order Value:</span>
                  <span className="font-semibold text-slate-800">₹{c.minRentalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Redeemed:</span>
                  <span className="font-bold text-blue-600">
                    {c.usageCount} / {c.maxUsage} times
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Valid till: {c.validUntil}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleCouponStatus(c.id)}
              className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                c.status === 'Active'
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {c.status === 'Active' ? 'Deactivate Coupon' : 'Activate Coupon'}
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Promo Code"
        subtitle="Set discount value, order limits, and campaign code"
        icon={Ticket}
        maxWidth="md"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Coupon Code (Uppercase)</label>
            <input
              type="text"
              required
              placeholder="e.g. FESTIVE2026"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'Percentage' | 'Fixed')}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Flat Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Discount Value</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Min Rental Order Value (₹)</label>
            <input
              type="number"
              value={minRentalAmount}
              onChange={(e) => setMinRentalAmount(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold shadow-xs">
              Create Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
