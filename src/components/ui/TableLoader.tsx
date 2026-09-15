'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface TableLoaderProps {
  message?: string;
}

export default function TableLoader({ message = 'Updating table records...' }: TableLoaderProps) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-800">{message}</span>
      </div>
    </div>
  );
}
