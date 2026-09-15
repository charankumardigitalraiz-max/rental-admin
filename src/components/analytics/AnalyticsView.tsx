'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { BarChart3, IndianRupee, TrendingUp, Download, PieChart, Car, Users } from 'lucide-react';

export default function AnalyticsView() {
  const { cars, bookings, payments } = useRentalStore();

  const totalRevenue = payments
    .filter((p) => p.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Financial & Operational Analytics</h3>
          <p className="text-xs text-slate-500">Revenue performance, fleet utilization rates, and profit margin analysis in ₹</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all">
          <Download className="w-4 h-4" /> Export Financial PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-white p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Gross Booking Revenue</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">+18.5% YoY Growth</p>
        </div>
        <div className="card-white p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Rental Ticket Size</span>
          <h3 className="text-2xl font-bold text-primary mt-1">₹24,800</h3>
          <p className="text-xs text-slate-400 mt-1">Average trip duration: 4.2 days</p>
        </div>
        <div className="card-white p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Fleet Asset Return (ROA)</span>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">31.2% p.a.</h3>
          <p className="text-xs text-slate-400 mt-1">Top Segment: SUV / Offroad</p>
        </div>
      </div>

      {/* Top Models breakdown */}
      <div className="card-white p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Top Performing Car Models</h3>
        <div className="space-y-3">
          {[
            { name: 'Mahindra Thar LX Hard Top', category: 'SUV / Offroad', revenue: 145000, percentage: 85 },
            { name: 'Toyota Fortuner Legender', category: 'SUV / Offroad', revenue: 212000, percentage: 92 },
            { name: 'BMW 3 Series Gran Limousine', category: 'Luxury Sedan', revenue: 190000, percentage: 78 },
            { name: 'Tata Nexon EV Max', category: 'Electric', revenue: 84000, percentage: 65 },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between font-medium">
                <span className="font-bold text-slate-900">
                  {item.name} <span className="text-slate-400 font-normal">({item.category})</span>
                </span>
                <span className="font-bold text-primary">₹{item.revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
