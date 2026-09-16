'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = React.useMemo(
    () => ({
      success: (title: string, message?: string, duration?: number) =>
        addToast('success', title, message, duration),
      error: (title: string, message?: string, duration?: number) =>
        addToast('error', title, message, duration),
      warning: (title: string, message?: string, duration?: number) =>
        addToast('warning', title, message, duration),
      info: (title: string, message?: string, duration?: number) =>
        addToast('info', title, message, duration),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Compact Floating Toast Container & Toast Item Components
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-xs sm:max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = {
    success: {
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
      icon: CheckCircle2,
      progressBg: 'bg-emerald-500',
      accentColor: 'from-emerald-50/60 to-transparent',
    },
    error: {
      border: 'border-rose-200',
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-200/80',
      icon: XCircle,
      progressBg: 'bg-rose-500',
      accentColor: 'from-rose-50/60 to-transparent',
    },
    warning: {
      border: 'border-amber-200',
      badgeBg: 'bg-amber-50 text-amber-600 border-amber-200/80',
      icon: AlertTriangle,
      progressBg: 'bg-amber-500',
      accentColor: 'from-amber-50/60 to-transparent',
    },
    info: {
      border: 'border-sky-200',
      badgeBg: 'bg-sky-50 text-sky-600 border-sky-200/80',
      icon: Info,
      progressBg: 'bg-sky-500',
      accentColor: 'from-sky-50/60 to-transparent',
    },
  }[toast.type];

  const Icon = config.icon;
  const duration = toast.duration || 4000;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden bg-white text-slate-800 rounded-xl shadow-xl border ${config.border} p-3 transition-all duration-300 animate-in slide-in-from-top-3 fade-in group`}
    >
      {/* Background Subtle Accent Glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.accentColor} pointer-events-none opacity-60`} />

      <div className="relative z-10 flex items-start gap-2.5">
        {/* Left Icon Badge */}
        <div className={`w-7 h-7 rounded-lg ${config.badgeBg} border flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs font-bold text-slate-900 tracking-tight leading-snug">{toast.title}</h4>
          {toast.message && (
            <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5 tracking-normal">
              {toast.message}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shrink-0 focus:outline-none"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Animated Countdown Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${config.progressBg} transition-all ease-linear`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
