'use client';

import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = 'Loading dashboard...' }: PageLoaderProps) {
  return (
    <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center p-6 select-none overflow-hidden animate-in fade-in duration-300">
      {/* Top Shimmering Linear Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100/80 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 animate-[shimmer_1.5s_infinite] w-full"></div>
      </div>

      {/* Main Glass Centerpiece */}
      <div className="card-white p-8 flex flex-col items-center max-w-md w-full text-center space-y-6 shadow-md border border-slate-200/80 bg-white/95 backdrop-blur-md relative z-10">
        {/* Animated Dual Halo Ring + Crown Emblem */}
        <div className="relative flex items-center justify-center my-2">
          {/* Outer Rotating Gradient Ring */}
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 animate-spin shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-white rounded-full"></div>
          </div>

          {/* Inner Glowing Core */}
          <div className="absolute w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30 animate-pulse">
            <Crown className="w-7 h-7 text-amber-300 fill-amber-300" />
          </div>

          {/* Pulse Ripple */}
          <div className="absolute -inset-3 bg-blue-500/10 rounded-full blur-lg animate-ping"></div>
        </div>

        {/* Brand & Status Text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-900 bg-clip-text text-transparent">
              Royal Wheels Admin
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-700">{message}</p>
        </div>

        {/* Sleek Skeleton Loading Bars */}
        <div className="w-full space-y-2 pt-2 border-t border-slate-100">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-[shimmer_1.2s_infinite] w-2/3"></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>Fetching live rental fleet</span>
            <span className="font-mono font-semibold text-blue-600">INR (₹)</span>
          </div>
        </div>
      </div>

      {/* Background Dashboard Skeleton Preview Cards */}
      <div className="absolute inset-0 p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-20 pointer-events-none filter blur-[2px]">
        <div className="card-white h-32"></div>
        <div className="card-white h-32"></div>
        <div className="card-white h-32"></div>
        <div className="card-white h-64 col-span-full"></div>
      </div>
    </div>
  );
}
