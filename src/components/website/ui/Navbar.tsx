'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Phone, Menu, X, Car, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: (serviceType?: string) => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolledMenuOpen, setScrolledMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setScrolledMenuOpen(false);
        setMobileMenuOpen(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isExpanded = !isScrolled || scrollDirection === 'up' || scrolledMenuOpen;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-0 sm:px-6 pt-0 sm:pt-4 pointer-events-none transition-all duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-start relative pointer-events-auto">
        
        {/* Main Morphing Navbar Bar */}
        <div
          className={`transition-all duration-500 ease-in-out flex items-center justify-between gap-2 sm:gap-4 overflow-hidden w-full ${
            isExpanded
              ? 'py-2.5 sm:py-3 px-4 sm:px-6 rounded-none sm:rounded-2xl backdrop-blur-md shadow-xl ' +
                (isScrolled
                  ? 'bg-[#02281d]/95 text-white border-b sm:border border-[#c5a880]/40 ring-1 ring-white/10'
                  : 'bg-white/95 text-slate-900 border-b sm:border border-stone-200/90')
              : 'rounded-none sm:rounded-full bg-[#02281d]/95 text-white border-b sm:border border-[#c5a880]/40 py-2.5 px-4 sm:px-3 backdrop-blur-xl shadow-xl sm:mr-auto sm:w-auto'
          }`}
        >
          {/* LEFT GROUP: Brand Logo & Desktop Left Scrolled Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Desktop Scrolled Left Menu Toggle Button (hidden on mobile) */}
            {isScrolled && (
              <button
                onClick={() => setScrolledMenuOpen(!scrolledMenuOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all duration-300 cursor-pointer group"
                aria-label="Toggle navigation menu"
              >
                {scrolledMenuOpen ? (
                  <X className="w-4 h-4 text-[#c5a880]" />
                ) : (
                  <Menu className="w-4 h-4 text-[#c5a880] group-hover:scale-110 transition-transform" />
                )}
                <span className="text-slate-100 text-[11px] font-bold">
                  {scrolledMenuOpen ? 'Close' : 'Menu'}
                </span>
              </button>
            )}

            {isScrolled && <div className="hidden sm:block h-4 w-px bg-white/20 my-auto" />}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative">
                <div
                  className={`rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-500 ${
                    isScrolled
                      ? 'w-8 h-8 sm:w-7.5 sm:h-7.5 bg-gradient-to-br from-[#d4af37] via-[#b4966c] to-[#7e6542] ring-1 ring-[#c5a880]/40'
                      : 'w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#023526] to-[#012218] ring-2 ring-[#023526]/20'
                  }`}
                >
                  <Crown
                    className={`transition-all duration-500 ${
                      isScrolled
                        ? 'w-4 h-4 text-amber-100 fill-amber-100/90'
                        : 'w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#c5a880] fill-[#c5a880]'
                    }`}
                  />
                </div>
                {!isScrolled && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 ring-2 ring-white rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                )}
              </div>

              <div>
                <div
                  className={`font-bold tracking-tight flex items-center gap-1.5 transition-all duration-500 ${
                    isScrolled ? 'text-sm sm:text-xs text-white' : 'text-base sm:text-lg text-slate-900'
                  }`}
                >
                  DrivePulse{' '}
                  <span className={isScrolled ? 'text-[#c5a880] font-extrabold' : 'text-[#023526] font-extrabold'}>
                    & Valet
                  </span>
                </div>
                {!isScrolled && (
                  <p className="hidden sm:flex text-[9.5px] font-semibold tracking-widest uppercase items-center gap-1 text-[#9c7f56] transition-opacity duration-300">
                    <span>Premier Chauffeurs & Events</span>
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* CENTER GROUP: Desktop Navigation Links (Only on lg screens when expanded) */}
          {isExpanded && (
            <nav
              className={`hidden lg:flex items-center gap-1 text-xs font-semibold p-1 rounded-full border transition-all duration-500 animate-in fade-in duration-300 ${
                isScrolled
                  ? 'bg-white/10 text-slate-100 border-white/15'
                  : 'bg-slate-100/80 text-slate-700 border-slate-200/70'
              }`}
            >
              <a
                href="#services"
                onClick={() => setScrolledMenuOpen(false)}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  isScrolled
                    ? 'hover:text-white hover:bg-white/10'
                    : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs'
                }`}
              >
                Services
              </a>
              <a
                href="#calculator"
                onClick={() => setScrolledMenuOpen(false)}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  isScrolled
                    ? 'hover:text-white hover:bg-white/10'
                    : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Fare Estimator
              </a>
              <a
                href="#valet-events"
                onClick={() => setScrolledMenuOpen(false)}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  isScrolled
                    ? 'hover:text-white hover:bg-white/10'
                    : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs'
                }`}
              >
                Valet Events
              </a>
              <a
                href="#driver-partner"
                onClick={() => setScrolledMenuOpen(false)}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  isScrolled
                    ? 'hover:text-white hover:bg-white/10'
                    : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs'
                }`}
              >
                Driver Pass
              </a>
              <a
                href="#safety"
                onClick={() => setScrolledMenuOpen(false)}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  isScrolled
                    ? 'hover:text-white hover:bg-white/10'
                    : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs'
                }`}
              >
                Safety
              </a>
              <a
                href="#faqs"
                onClick={() => setScrolledMenuOpen(false)}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  isScrolled
                    ? 'hover:text-white hover:bg-white/10'
                    : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs'
                }`}
              >
                FAQs
              </a>
            </nav>
          )}

          {/* RIGHT GROUP: Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Phone button (Desktop only) */}
            {isExpanded && (
              <a
                href="tel:+918025211234"
                className={`hidden lg:flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl border transition-all ${
                  isScrolled
                    ? 'text-[#023526] bg-[#c5a880] hover:bg-[#b8996f] border-[#c5a880]'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200/70 border-slate-200'
                }`}
              >
                <Phone className={`w-3.5 h-3.5 ${isScrolled ? 'text-[#023526]' : 'text-[#c5a880]'}`} />
                <span>+91 80 2521 1234</span>
              </a>
            )}

            {/* Desktop Book Now Button (Hidden on mobile header bar) */}
            <button
              onClick={() => {
                setScrolledMenuOpen(false);
                onOpenBooking('local');
              }}
              className={`hidden sm:relative sm:group overflow-hidden rounded-xl p-px font-bold text-xs cursor-pointer transition-all duration-500 active:scale-95 ${
                !isExpanded
                  ? 'rounded-full shadow-md'
                  : 'shadow-[0_4px_20px_rgba(2,53,38,0.25)] hover:shadow-[0_6px_25px_rgba(2,53,38,0.4)]'
              }`}
            >
              <span
                className={`absolute inset-0 transition-opacity duration-500 group-hover:opacity-90 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#f7e4af] to-[#9c7f56]'
                    : 'bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526]'
                }`}
              ></span>
              <span
                className={`relative flex items-center gap-1.5 transition-all duration-500 ${
                  !isExpanded
                    ? 'px-3 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f5e6b3] to-[#b4966c] text-[#011d15] text-[11px] font-extrabold'
                    : isScrolled
                    ? 'px-4 py-2 rounded-[11px] bg-gradient-to-r from-[#d4af37] via-[#f5e6b3] to-[#b4966c] text-[#011d15] font-extrabold'
                    : 'px-4 py-2 rounded-[11px] bg-gradient-to-r from-[#023526] to-[#012218] text-white font-extrabold'
                }`}
              >
                <Car className={`w-3.5 h-3.5 ${isScrolled ? 'text-[#011d15]' : 'text-[#c5a880]'}`} />
                <span>{!isExpanded ? 'Book Now' : 'Book Driver Now'}</span>
                {isExpanded && (
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isScrolled ? 'text-[#011d15]' : 'text-[#c5a880]'}`} />
                )}
              </span>
            </button>

            {/* Mobile Menu Icon Button (Visible on mobile header bar) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`sm:hidden p-2 rounded-xl border transition-colors focus:outline-none flex items-center justify-center ${
                isScrolled
                  ? 'text-white hover:text-[#c5a880] bg-white/10 hover:bg-white/20 border-white/20'
                  : 'text-slate-800 hover:text-[#023526] bg-slate-100 hover:bg-slate-200/80 border-slate-200'
              }`}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#c5a880]" />
              ) : (
                <Menu className={`w-5 h-5 ${isScrolled ? 'text-[#c5a880]' : 'text-[#023526]'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Opens when Mobile Menu Icon is clicked) */}
        {mobileMenuOpen && (
          <div
            className={`w-full backdrop-blur-xl border-x border-b sm:border rounded-b-2xl sm:rounded-2xl p-4 mt-0 sm:mt-2 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto ${
              isScrolled
                ? 'bg-[#02281d]/98 border-[#c5a880]/30 text-slate-100'
                : 'bg-white/98 border-slate-200 text-slate-700'
            }`}
          >
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-500/10"
            >
              Services & Fleet
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-emerald-500/10"
            >
              <span>Fare Estimator</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </a>
            <a
              href="#valet-events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-500/10"
            >
              Valet Event Parking
            </a>
            <a
              href="#driver-partner"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-500/10"
            >
              Driver Monthly Pass (₹999)
            </a>
            <a
              href="#safety"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-500/10"
            >
              Safety Standards
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-500/10"
            >
              Frequently Asked Questions
            </a>

            {/* Mobile Booking CTA Button */}
            <div className="pt-3 border-t border-slate-200/40 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking('local');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#023526] to-[#012218] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4 text-[#c5a880]" />
                <span>Book Driver Now</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#c5a880]" />
              </button>

              <a
                href="tel:+918025211234"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-[#023526] font-semibold text-xs border border-slate-200"
              >
                <Phone className="w-4 h-4 text-[#c5a880]" />
                <span>24/7 Helpline: +91 80 2521 1234</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
