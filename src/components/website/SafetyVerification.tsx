'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Radio,
  FileText,
  CheckCircle2,
  Zap,
  Award,
  ChevronRight,
  Shield,
  PhoneCall,
  Activity,
  X
} from 'lucide-react';

export default function SafetyVerification() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const verificationProtocols = [
    {
      id: 'step-1',
      stepNum: '01',
      title: 'Aadhaar Biometric Verification',
      shortDesc: 'UIDAI government database authentication with physical address inspection.',
      icon: UserCheck,
      details: [
        'Direct UIDAI portal verification & biometric match',
        'Physical home address check & family reference audit',
        'Permanent emergency contact details cataloged'
      ],
      badge: 'Identity Clear ✓'
    },
    {
      id: 'step-2',
      stepNum: '02',
      title: 'Commercial DL & RTO Audit',
      shortDesc: 'Validation of commercial badge with Sarathi RTO database.',
      icon: FileText,
      details: [
        'Valid LMV/HMV Commercial Badge verification on Sarathi RTO',
        'Minimum 4+ years of active commercial driving experience',
        'Zero active license suspensions or major traffic offenses'
      ],
      badge: 'RTO Certified ✓'
    },
    {
      id: 'step-3',
      stepNum: '03',
      title: 'Police Criminal Record Clearance',
      shortDesc: 'Official Police Clearance Certificate (PCC) & zero-offense history.',
      icon: ShieldCheck,
      details: [
        'State Police Clearance Certificate (PCC) verification',
        'Substance abuse & mandatory random drug screening',
        'Zero pending court litigation or criminal history'
      ],
      badge: 'Police Verified ✓'
    },
    {
      id: 'step-4',
      stepNum: '04',
      title: 'Driving Skill & Etiquette Assessment',
      shortDesc: 'On-road driving assessment & luxury car handling test.',
      icon: Award,
      details: [
        'Defensive driving assessment on high-traffic & highway routes',
        'Professional uniform, grooming & customer courtesy training',
        'Manual, Automatic & Luxury car handling test'
      ],
      badge: '5-Star Skill Audit ✓'
    },
    {
      id: 'step-5',
      stepNum: '05',
      title: '24/7 Live Telemetry & GPS Guardian',
      shortDesc: 'Real-time route tracking and speed limit oversight by Live Ops Center.',
      icon: Radio,
      details: [
        'Continuous GPS location & speed limit monitoring',
        'Instant SOS alert trigger for passenger & driver emergency',
        'On-demand 24/7 Central Helpline response in <15 minutes'
      ],
      badge: '24/7 Monitored ✓'
    }
  ];

  const activeStep = verificationProtocols[activeStepIndex];

  return (
    <section id="safety" className="py-12 md:py-16 bg-stone-50/60 text-slate-900 relative overflow-hidden border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
            <span>Uncompromising Trust & Safety Standards</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            5-Point Rigorous{' '}
            <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
              Driver Verification
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Your safety and vehicle integrity are non-negotiable. Only the top 5% of driver applicants clear our strict background and skill audit.
          </p>
        </div>

        {/* Interactive Safety Command Center Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Command Center Spotlight Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#023526] via-[#01261b] to-[#011a12] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#c5a880]/30 flex flex-col justify-between text-left relative overflow-hidden group">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a880]/10 rounded-full filter blur-3xl pointer-events-none"></div>

            <div>
              {/* Header Status Bar */}
              <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-400">
                    Live Safety Guardian
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#c5a880] bg-[#023526] px-2.5 py-1 rounded-md border border-[#c5a880]/30">
                  {activeStep.badge}
                </span>
              </div>

              {/* Active Step Details Spotlight */}
              <div className="space-y-4 mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#c5a880]">
                  {React.createElement(activeStep.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#c5a880] uppercase tracking-wider block mb-1">
                    Protocol Step {activeStep.stepNum}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{activeStep.title}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{activeStep.shortDesc}</p>
                </div>

                <div className="space-y-2.5 pt-3">
                  {activeStep.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Stats Pill Matrix */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left">
                  <span className="text-2xl font-black text-[#c5a880]">100%</span>
                  <span className="text-[10px] font-semibold text-slate-300 block">UIDAI & RTO Checked</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left">
                  <span className="text-2xl font-black text-emerald-400">Top 5%</span>
                  <span className="text-[10px] font-semibold text-slate-300 block">Strict Pass Rate</span>
                </div>
              </div>

              <button
                onClick={() => setShowPolicyModal(true)}
                className="w-full py-3 bg-[#c5a880] hover:bg-[#b5976f] text-[#023526] rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Shield className="w-4 h-4" />
                <span>View Complete Safety Audit Policy</span>
              </button>
            </div>

          </div>

          {/* Right Column: 5 Interactive Protocol Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
            {verificationProtocols.map((protocol, idx) => {
              const Icon = protocol.icon;
              const isActive = idx === activeStepIndex;
              return (
                <div
                  key={protocol.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-white border-[#023526] ring-2 ring-[#023526]/15 shadow-md translate-x-1'
                      : 'bg-white hover:bg-stone-100/80 border-stone-200/90 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#023526] text-[#c5a880]'
                          : 'bg-stone-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9c7f56]">
                          Step {protocol.stepNum}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                          {protocol.badge}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{protocol.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 hidden sm:block mt-0.5 font-medium">
                        {protocol.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isActive ? (
                      <span className="w-8 h-8 rounded-full bg-emerald-100 text-[#023526] flex items-center justify-center font-bold text-xs">
                        ✓
                      </span>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Safety Guarantee Bar */}
        <div className="mt-10 bg-white rounded-3xl p-6 text-slate-900 shadow-md border border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#023526] text-[#c5a880] flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% Comprehensive Vehicle Insurance</h4>
              <p className="text-xs text-slate-600 mt-0.5">Every trip booked on DrivePulse is insured against accidental vehicle damage & third-party liability.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 shrink-0">
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>24/7 SOS Helpline Active</span>
          </div>
        </div>

        {/* Safety Audit Policy Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 text-left relative shadow-2xl space-y-4">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#023526] text-[#c5a880] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">DrivePulse Safety & Audit Protocol</h3>
                  <p className="text-xs text-slate-500">Government Compliant & RTO Certified Standard</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-t border-stone-100 pt-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="font-bold text-slate-900 block mb-1">1. UIDAI Biometric Identity Auth</span>
                  We cross-reference every driver's Aadhaar card with biometric database verification to prevent impersonation or proxy driver dispatches.
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="font-bold text-slate-900 block mb-1">2. Sarathi RTO License Check</span>
                  Commercial badges and Light Motor Vehicle (LMV) licenses are verified live on the Ministry of Road Transport & Highways (MORTH) portal.
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="font-bold text-slate-900 block mb-1">3. Police Clearance Certificate (PCC)</span>
                  Drivers must submit a fresh police clearance certificate issued by the Karnataka State Police department.
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="font-bold text-slate-900 block mb-1">4. Zero Alcohol & Substance Policy</span>
                  Mandatory breathalyzer tests & random drug screening checks are conducted at our dispatch hubs in Bangalore.
                </div>
              </div>

              <button
                onClick={() => setShowPolicyModal(false)}
                className="w-full py-3 bg-[#023526] hover:bg-[#012218] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Close Safety Guide
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
