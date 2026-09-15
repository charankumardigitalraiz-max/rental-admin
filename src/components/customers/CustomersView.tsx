'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { ShieldCheck, Mail, Phone, MapPin, Star, Search, FileText } from 'lucide-react';

export default function CustomersView() {
  const { customers } = useRentalStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Verified Drivers</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{customers.length} Registered</h3>
        </div>
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">License Approved</span>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">
            {customers.filter((c) => c.licenseStatus === 'Verified').length} Verified
          </h3>
        </div>
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Repeat Renters</span>
          <h3 className="text-xl font-bold text-blue-600 mt-1">
            {customers.filter((c) => c.totalBookings > 3).length} VIP Customers
          </h3>
        </div>
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Customer Lifetime Value</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            ₹
            {customers
              .reduce((acc, curr) => acc + curr.totalSpent, 0)
              .toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Search Input Bar for Customers */}
      <div className="card-white p-4 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, email, phone, license #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredCustomers.length} of {customers.length} customers
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="card-white card-white-hover p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{customer.name}</h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                        customer.licenseStatus === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" /> DL {customer.licenseStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {customer.rating}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {customer.address}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> DL No: {customer.licenseNumber}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Total Trips</span>
                <span className="font-bold text-slate-900">{customer.totalBookings} Rentals</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] font-medium">Total Spent</span>
                <span className="font-bold text-blue-600">₹{customer.totalSpent.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
