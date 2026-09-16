'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  maxWidth = 'md',
  children,
  footer,
}: ModalProps) {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop overlay click */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Responsive Modal Dialog Container */}
      <div
        className={`relative bg-white rounded-md ${maxWidthClasses} w-full shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] sm:max-h-[90vh] z-10 animate-in zoom-in-95 duration-200 overflow-hidden mx-auto`}
      >
        {/* Crisp White Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-md bg-slate-50 text-primary flex items-center justify-center border border-slate-200/70 shrink-0 shadow-2xs">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight leading-snug">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 font-medium tracking-normal mt-0.5 leading-tight">{subtitle}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/70 hover:border-rose-200 flex items-center justify-center transition-all shrink-0 focus:outline-none shadow-2xs active:scale-95"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-sm text-slate-700 leading-relaxed">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

