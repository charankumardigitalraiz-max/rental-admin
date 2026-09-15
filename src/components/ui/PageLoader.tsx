'use client';

import React from 'react';
import { Loader2, Car } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = 'Loading page data...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] w-full p-6 select-none animate-in fade-in duration-200">
      {/* Centered Clean Card */}
      <div className="card-white p-7 max-w-xs w-full flex flex-col items-center text-center space-y-4 shadow-sm border border-slate-200 bg-white rounded-xl">
        {/* Icon & Smooth Spinner Container */}
        <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center relative border border-primary-light">
          <Car className="w-5 h-5 text-primary" />
          <Loader2 className="w-12 h-12 text-primary animate-spin absolute -inset-0 m-auto" />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-xs">Royal Wheels Admin</h4>
          <p className="text-[11px] text-slate-500 font-medium">{message}</p>
        </div>

        {/* Smooth Progress Bar */}
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
