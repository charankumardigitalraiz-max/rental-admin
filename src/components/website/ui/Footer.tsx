'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#011811] text-white border-t border-[#c5a880]/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a880] via-[#b4966c] to-[#7e6542] flex items-center justify-center text-white shadow-md">
                <Crown className="w-6 h-6 text-amber-100 fill-amber-100" />
              </div>
              <div>
                <div className="font-bold text-white text-lg tracking-tight">
                  DrivePulse <span className="text-[#c5a880] font-extrabold">& Valet</span>
                </div>
                <p className="text-[10px] font-semibold text-[#c5a880]/80 tracking-wider uppercase">
                  Premier Chauffeurs & Events
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Bangalore's premier acting driver & event valet service platform. Providing background-checked hourly acting drivers, outstation chauffeurs, and luxury event valet parking management.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="tel:+918025211234"
                className="flex items-center gap-2 text-xs font-semibold text-[#c5a880] bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10"
              >
                <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>+91 80 2521 1234</span>
              </a>
              <a
                href="mailto:support@drivepulse.in"
                className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10"
              >
                <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>support@drivepulse.in</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-[#c5a880] uppercase tracking-wider mb-4">Mobility Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li><a href="#services" className="hover:text-[#c5a880] transition-colors">Hourly Acting Drivers</a></li>
              <li><a href="#services" className="hover:text-[#c5a880] transition-colors">Outstation Highway Chauffeurs</a></li>
              <li><a href="#valet-events" className="hover:text-[#c5a880] transition-colors">Wedding Valet Parking</a></li>
              <li><a href="#valet-events" className="hover:text-[#c5a880] transition-colors">Corporate Summit Valets</a></li>
              <li><a href="#calculator" className="hover:text-[#c5a880] transition-colors">Live Fare Estimator</a></li>
            </ul>
          </div>

          {/* Driver Partners */}
          <div>
            <h4 className="text-xs font-bold text-[#c5a880] uppercase tracking-wider mb-4">Driver Network</h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li><a href="#driver-partner" className="hover:text-[#c5a880] transition-colors">Driver Monthly Pass (₹999)</a></li>
              <li><a href="#driver-partner" className="hover:text-[#c5a880] transition-colors">Zero Commission Program</a></li>
              <li><a href="#driver-partner" className="hover:text-[#c5a880] transition-colors">Join as Driver Partner</a></li>
              <li><a href="#safety" className="hover:text-[#c5a880] transition-colors">Driver Verification Standard</a></li>
            </ul>
          </div>

          {/* Location & Support */}
          <div>
            <h4 className="text-xs font-bold text-[#c5a880] uppercase tracking-wider mb-4">Headquarters</h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <span>DrivePulse Towers, 100ft Road, Indiranagar, Bengaluru, KA 560038</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>24/7 Operations Hub Online</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div>
            © 2026 DrivePulse & Valet Technologies Pvt Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-200">Privacy Policy</a>
            <a href="#" className="hover:text-slate-200">Terms of Service</a>
            <Link href="/admin" className="text-[#c5a880] hover:underline font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
