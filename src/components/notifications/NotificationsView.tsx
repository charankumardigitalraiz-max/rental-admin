'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Bell, CheckCheck, CalendarCheck, CreditCard, Wrench, RotateCcw } from 'lucide-react';

export default function NotificationsView() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useRentalStore();

  const iconTypeMap: Record<string, React.ElementType> = {
    booking: CalendarCheck,
    payment: CreditCard,
    maintenance: Wrench,
    return: RotateCcw,
  };

  return (
    <div className="space-y-6">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">System Notification Center</h3>
          <p className="text-xs text-slate-500">Live booking alerts, payment confirmations, and maintenance schedules</p>
        </div>
        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const IconComp = iconTypeMap[n.type] || Bell;
          return (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`card-white p-4 flex items-start gap-4 cursor-pointer transition-all ${
                !n.read ? 'bg-primary-light/40 border-primary/20' : 'hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === 'booking'
                    ? 'bg-primary-light text-primary'
                    : n.type === 'payment'
                    ? 'bg-emerald-100 text-emerald-700'
                    : n.type === 'maintenance'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                <IconComp className="w-4 h-4" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
              </div>

              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
