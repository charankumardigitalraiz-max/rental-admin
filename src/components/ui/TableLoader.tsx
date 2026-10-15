'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface TableLoaderProps {
  message?: string;
  className?: string;
}

export default function TableLoader({ message = 'Updating table records...', className = '' }: TableLoaderProps) {
  return (
    <div
      className={`absolute inset-0 bg-white/75 backdrop-blur-[0.5px] flex flex-col items-center justify-center z-[1] animate-in fade-in duration-150 ${className}`}
    >
      <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <span className="text-xs font-semibold text-slate-800">{message}</span>
      </div>
    </div>
  );
}
