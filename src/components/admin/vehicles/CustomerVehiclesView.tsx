'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import { CustomerVehicle } from '@/types';
import { Search, Car, ShieldCheck, AlertTriangle, CheckCircle, Lock, User, Eye, FileText, Calendar, Shield } from 'lucide-react';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';

export default function CustomerVehiclesView() {
  const { customerVehicles, toggleVehicleAuthorization, setSelectedVehicleId, setActiveTab } = useRentalStore();
  const [transmissionFilter, setTransmissionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(null);

  const filteredVehicles = customerVehicles.filter((v) => {
    const matchesTransmission = transmissionFilter === 'All' || v.transmission === transmissionFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesTransmission && matchesStatus;
  });

  const totalVehicles = customerVehicles.length;
  const activeAuthorizedCount = customerVehicles.filter((v) => v.status === 'Active' && v.authorized).length;
  const expiredInsuranceCount = customerVehicles.filter((v) => v.status === 'Expired Insurance').length;

  const columns: Column<CustomerVehicle>[] = [
    {
      key: 'regNumber',
      header: 'Vehicle Reg Number',
      render: (v) => (
        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
          <Car className="w-4 h-4 text-primary" />
          {v.regNumber}
        </div>
      ),
    },
    {
      key: 'make',
      header: 'Make & Model',
      render: (v) => (
        <div>
          <div className="font-bold text-slate-900">{v.make} {v.model} ({v.year})</div>
          <div className="text-[10px] text-slate-500 font-medium">
            <span className="text-primary font-bold">{v.transmission}</span> • {v.fuelType}
          </div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer Owner',
      render: (v) => (
        <div>
          <div className="font-bold text-slate-900 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-500" /> {v.customerName}
          </div>
          <div className="text-[10px] text-slate-400">{v.customerPhone}</div>
        </div>
      ),
    },
    {
      key: 'insuranceExpiry',
      header: 'Insurance Details',
      render: (v) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{v.insuranceProvider}</div>
          <div className="text-[10px] text-slate-500">Policy: {v.policyNumber}</div>
          <div className={`text-[10px] font-bold ${v.status === 'Expired Insurance' ? 'text-rose-600' : 'text-emerald-700'}`}>
            Expires: {v.insuranceExpiry}
          </div>
        </div>
      ),
    },
    {
      key: 'authorized',
      header: 'Driver Authorization',
      align: 'center',
      render: (v) => (
        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
            v.authorized
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {v.authorized ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-rose-600" />}
          {v.authorized ? 'Driver Authorized' : 'Authorization Revoked'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Vehicle Status',
      className: 'min-w-[150px]',
      render: (v) => (
        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold inline-block whitespace-nowrap ${
            v.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : v.status === 'Expired Insurance'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {v.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      className: 'min-w-[180px]',
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/admin/customer-vehicles/${v.id}`}
            onClick={() => {
              setSelectedVehicleId(v.id);
              setActiveTab('customer-vehicle-details');
            }}
            className="p-1.5 bg-primary-light hover:bg-primary text-primary hover:text-white rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
            title="View Full Vehicle Details Screen & Photos"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => toggleVehicleAuthorization(v.id)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${
              v.authorized
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {v.authorized ? 'Revoke' : 'Authorize'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* Metrics Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total Registered Vehicles</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{totalVehicles}</div>
            <p className="text-[10px] text-slate-400 mt-1">Customer-owned personal cars</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Active & Authorized</span>
            <div className="text-xl font-bold text-emerald-700 mt-1">{activeAuthorizedCount}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Verified for driver dispatch</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700 block">Expired Insurance Alerts</span>
            <div className="text-xl font-bold text-rose-700 mt-1">{expiredInsuranceCount}</div>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">Requires customer document upload</p>
          </div>
        </div>
      </div>

      {/* Global DataTable */}
      <DataTable<CustomerVehicle>
        columns={columns}
        data={filteredVehicles}
        keyExtractor={(v) => v.id}
        pageSize={8}
        searchPlaceholder="Search reg number, customer, model..."
        searchFilterKeys={['regNumber', 'customerName', 'make', 'model']}
        emptyMessage="No customer vehicles found."
      />

      {/* Vehicle Inspection & Authorization Modal */}
      {selectedVehicle && (
        <Modal
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          title={`Vehicle Specs & Authorization • ${selectedVehicle.regNumber}`}
          subtitle={`${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})`}
          icon={Car}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {/* Owner Details */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer Vehicle Owner</span>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Name: {selectedVehicle.customerName}</span>
                <span className="text-slate-600">Phone: {selectedVehicle.customerPhone}</span>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-2 gap-3 p-3 border border-slate-200 rounded-lg bg-white">
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">Transmission</span>
                <span className="font-bold text-primary text-xs">{selectedVehicle.transmission}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">Fuel Type</span>
                <span className="font-bold text-slate-900 text-xs">{selectedVehicle.fuelType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">Registration Year</span>
                <span className="font-bold text-slate-800 text-xs">{selectedVehicle.year}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">Account Status</span>
                <span className="font-bold text-emerald-700 text-xs">{selectedVehicle.status}</span>
              </div>
            </div>

            {/* Insurance Records */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-emerald-900 block flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-700" /> Vehicle Insurance Policy
              </span>
              <div className="flex justify-between text-slate-800 font-medium">
                <span>Provider: {selectedVehicle.insuranceProvider}</span>
                <span>Policy #: {selectedVehicle.policyNumber}</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-800 pt-0.5">
                Expiry Date: {selectedVehicle.insuranceExpiry}
              </div>
            </div>

            {/* Digital Authorization Badge */}
            <div className="p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold block text-sm">Legal Driver Authorization</span>
                <span className="text-[10px] text-slate-300">
                  {selectedVehicle.authorized
                    ? 'Customer has authorized verified platform drivers to operate this car'
                    : 'Driver authorization has been revoked by owner/admin'}
                </span>
              </div>
              <button
                onClick={() => {
                  toggleVehicleAuthorization(selectedVehicle.id);
                  setSelectedVehicle({ ...selectedVehicle, authorized: !selectedVehicle.authorized });
                }}
                className={`px-3 py-1.5 rounded font-bold text-xs ${
                  selectedVehicle.authorized
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {selectedVehicle.authorized ? 'Revoke' : 'Authorize'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
