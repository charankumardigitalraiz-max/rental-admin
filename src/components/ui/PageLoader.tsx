'use client';

import React from 'react';
import { Car, Sparkles } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = 'Loading details...' }: PageLoaderProps) {
  return (
    <div className="relative w-full min-h-[400px] flex flex-col items-center justify-center p-8 select-none">
      {/* Top Animated Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-r-full animate-[shimmer_1.5s_infinite] w-full"></div>
      </div>

      {/* Sleek Minimal Visual Loader */}
      <div className="flex flex-col items-center space-y-4">
        {/* Car Pulse Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm relative z-10">
            <Car className="w-8 h-8 animate-bounce text-blue-600" />
          </div>
          <div className="absolute -inset-2 bg-blue-500/20 rounded-3xl blur-md animate-pulse"></div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Royal Wheels
          </h4>
          <p className="text-xs text-slate-500 font-medium">{message}</p>
        </div>

        {/* Loading Dots */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>
    </div>
  );
}
