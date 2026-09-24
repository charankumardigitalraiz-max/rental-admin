'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { DamageClaim } from '@/types';
import { Search, ShieldAlert, AlertTriangle, CheckCircle2, Lock, Unlock, Eye, FileText } from 'lucide-react';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';

export default function DamageClaimsView() {
  const { damageClaims, updateDamageClaimStatus } = useRentalStore();
  const [selectedClaim, setSelectedClaim] = useState<DamageClaim | null>(null);

  const totalClaims = damageClaims.length;
  const openClaimsCount = damageClaims.filter((c) => c.status === 'Open' || c.status === 'Under Review').length;
  const payoutHoldCount = damageClaims.filter((c) => c.payoutHoldStatus).length;

  const columns: Column<DamageClaim>[] = [
    {
      key: 'claimNumber',
      header: 'Claim ID',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          {c.claimNumber}
        </span>
      ),
    },
    {
      key: 'bookingNumber',
      header: 'Booking & Vehicle',
      render: (c) => (
        <div>
          <div className="font-mono font-bold text-primary">{c.bookingNumber}</div>
          <div className="text-[11px] text-slate-700 font-semibold">{c.vehicleRegNumber} ({c.vehicleModel})</div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer & Driver',
      render: (c) => (
        <div>
          <div className="font-bold text-slate-900">Cust: {c.customerName}</div>
          <div className="text-[10px] text-slate-500 font-medium">Driver: {c.driverName}</div>
        </div>
      ),
    },
    {
      key: 'estimatedRepairCost',
      header: 'Estimated Cost',
      render: (c) => (
        <span className="font-bold text-rose-700">
          ₹{c.estimatedRepairCost.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'payoutHoldStatus',
      header: 'Driver Payout Hold',
      align: 'center',
      render: (c) => (
        <span
          className={`px-2.5 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
            c.payoutHoldStatus
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {c.payoutHoldStatus ? <Lock className="w-3 h-3 text-rose-600" /> : <Unlock className="w-3 h-3 text-emerald-600" />}
          {c.payoutHoldStatus ? 'Payout Frozen' : 'Payout Active'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Claim Status',
      render: (c) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            c.status === 'Approved' || c.status === 'Settled'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : c.status === 'Under Review' || c.status === 'Open'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {c.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (c) => (
        <button
          onClick={() => setSelectedClaim(c)}
          className="px-2.5 py-1 bg-primary hover:bg-slate-800 text-white text-[10px] font-bold rounded-md shadow-xs inline-flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> Inspect Evidence
        </button>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* Metrics Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total Reported Claims</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{totalClaims}</div>
            <p className="text-[10px] text-slate-400 mt-1">Vehicle damage incident reports</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">Claims Under Investigation</span>
            <div className="text-xl font-bold text-amber-700 mt-1">{openClaimsCount}</div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Requires evidence inspection</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700 block">Active Payout Holds</span>
            <div className="text-xl font-bold text-rose-700 mt-1">{payoutHoldCount}</div>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">Driver weekly payouts frozen</p>
          </div>
        </div>
      </div>

      {/* Global DataTable */}
      <DataTable<DamageClaim>
        columns={columns}
        data={damageClaims}
        keyExtractor={(c) => c.id}
        pageSize={8}
        searchPlaceholder="Search claim #, customer, driver, reg #..."
        searchFilterKeys={['claimNumber', 'bookingNumber', 'customerName', 'driverName', 'vehicleRegNumber']}
        emptyMessage="No vehicle damage claims reported."
      />

      {/* Incident Inspection Modal */}
      {selectedClaim && (
        <Modal
          isOpen={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
          title={`Inspect Damage Claim ${selectedClaim.claimNumber}`}
          subtitle={`Booking #${selectedClaim.bookingNumber} • Vehicle: ${selectedClaim.vehicleRegNumber}`}
          icon={ShieldAlert}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Incident Date:</span>
                <span className="font-bold text-slate-900">{selectedClaim.incidentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Damage Description:</span>
                <span className="font-bold text-rose-700">{selectedClaim.damageDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Repair Cost:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{selectedClaim.estimatedRepairCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Evidence Comparison */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Inspection Photo Evidence Comparison</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Pre-Trip Baseline Photo</span>
                  <img src={selectedClaim.preTripPhotoRef} alt="Pre-trip" className="w-full h-32 object-cover rounded border border-slate-200" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-rose-700 block">Post-Trip Damage Photo</span>
                  <img src={selectedClaim.postTripPhotoRef} alt="Post-trip" className="w-full h-32 object-cover rounded border border-slate-200" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-900 block">Driver Payout Freeze</span>
                <span className="text-[10px] text-rose-700">Freeze driver weekly payout settlement until claim resolution</span>
              </div>
              <button
                onClick={() => {
                  updateDamageClaimStatus(selectedClaim.id, selectedClaim.status, !selectedClaim.payoutHoldStatus);
                  setSelectedClaim({ ...selectedClaim, payoutHoldStatus: !selectedClaim.payoutHoldStatus });
                }}
                className={`px-3 py-1.5 font-bold text-xs rounded border ${
                  selectedClaim.payoutHoldStatus
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-rose-600 text-white border-rose-700'
                }`}
              >
                {selectedClaim.payoutHoldStatus ? 'Release Payout Hold' : 'Freeze Driver Payout'}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  updateDamageClaimStatus(selectedClaim.id, 'Settled', false);
                  setSelectedClaim(null);
                }}
                className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded-lg shadow-xs text-xs"
              >
                Approve & Settle Claim
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
