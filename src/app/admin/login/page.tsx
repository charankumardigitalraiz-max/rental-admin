'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Crown, Lock, Mail, Eye, EyeOff, KeyRound, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, isLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('admin@drivepulse.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        toast.success('Welcome Back!', 'Logged into Admin Management Portal.');
        router.replace('/admin/dashboard');
      } else {
        setErrorMessage('Invalid administrator credentials.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#023526] animate-spin mb-3" />
        <p className="text-xs text-slate-600 font-medium tracking-wide">Verifying administrator session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/90 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#023526]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#c5a880]/20 rounded-full blur-3xl pointer-events-none" />

      {/* SINGLE UNIFIED CARD CONTAINING ENTIRE CONTENT */}
      <div className="w-full max-w-md bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">

        {/* Card Header: Brand Logo & Title */}
        <div className="text-center space-y-3">

          {/* Brand Badge */}
          <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#023526] to-emerald-950 text-white shadow-md border border-[#c5a880]/40">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c5a880] via-[#b4966c] to-[#7e6542] flex items-center justify-center text-white shadow-sm ring-2 ring-[#c5a880]/40 shrink-0">
              <Crown className="w-3.5 h-3.5 text-amber-100 fill-amber-100" />
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-white text-xs leading-tight tracking-tight">
                DrivePulse <span className="text-[#c5a880] font-black">& Valet</span>
              </h1>
              <p className="text-[9px] font-bold text-[#c5a880]/90 tracking-wide uppercase">Admin Portal</p>
            </div>
          </div>

          <div className="pt-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Administrator Sign In
            </h2>
            <p className="text-slate-500 text-xs font-normal mt-1 max-w-xs mx-auto">
              Access live operations, driver roster, & platform analytics
            </p>
          </div>

        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@drivepulse.com"
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-[#023526] focus:ring-1 focus:ring-[#023526] transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-[#023526] focus:ring-1 focus:ring-[#023526] transition-colors placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Default Demo Tip */}
          <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e7dbc5] text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023526] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#023526]">Demo Credentials:</span>
              <p className="mt-0.5 text-slate-500">
                Email: <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[10px]">admin@drivepulse.com</code>
                {' • '}
                Password: <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[10px]">admin123</code>
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-950 via-[#023526] to-emerald-950 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl border border-[#c5a880]/40 shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#c5a880]" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#c5a880]" />
              </>
            )}
          </button>
        </form>

        {/* Card Footer: System Info & Copyright */}
        <div className="pt-2 border-t border-stone-100 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-slate-600 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#023526]" />
            <span className="font-semibold">DrivePulse & Valet Premier System</span>
          </div>
          <p className="text-[10px] text-slate-400">© 2026 DrivePulse • Authorized Personnel Only</p>
        </div>

      </div>
    </div>
  );
}
