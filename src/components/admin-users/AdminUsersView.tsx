'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { ShieldCheck, Plus, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';

export default function AdminUsersView() {
  const { adminUsers } = useRentalStore();

  return (
    <div className="space-y-6">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Admin Team & Access Control</h3>
          <p className="text-xs text-slate-500">Manage administrator roles, fleet manager privileges, and system access</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Add Admin User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminUsers.map((admin) => (
          <div key={admin.id} className="card-white card-white-hover p-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={admin.avatar}
                alt={admin.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-light"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{admin.name}</h4>
                <span className="inline-block text-[10px] font-bold text-primary bg-primary-light border border-primary/20 px-2 py-0.5 rounded">
                  {admin.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {admin.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {admin.phone}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Last Login: {admin.lastLogin}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
