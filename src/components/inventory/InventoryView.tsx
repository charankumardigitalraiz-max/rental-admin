'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { InventoryItem } from '@/types';
import DataTable, { Column } from '@/components/ui/DataTable';
import { MapPin } from 'lucide-react';

export default function InventoryView() {
  const { inventory } = useRentalStore();

  const inventoryColumns: Column<InventoryItem>[] = [
    {
      key: 'carName',
      header: 'Vehicle Details',
      render: (item) => <span className="font-bold text-slate-900">{item.carName}</span>,
    },
    {
      key: 'licensePlate',
      header: 'License Plate',
      render: (item) => <span className="font-semibold text-slate-800">{item.licensePlate}</span>,
    },
    {
      key: 'yardLocation',
      header: 'Yard / Trip Location',
      render: (item) => (
        <span className="text-slate-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.yardLocation}
        </span>
      ),
    },
    {
      key: 'currentStatus',
      header: 'Status',
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            item.currentStatus === 'Available at Yard'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : item.currentStatus === 'On Road'
              ? 'bg-primary-light text-primary border border-primary/20'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {item.currentStatus}
        </span>
      ),
    },
    {
      key: 'fuelLevelPercent',
      header: 'Fuel / Charge Level',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${item.fuelLevelPercent}%` }}
            ></div>
          </div>
          <span className="font-semibold text-slate-800">{item.fuelLevelPercent}%</span>
        </div>
      ),
    },
    {
      key: 'healthScore',
      header: 'Health Score',
      render: (item) => <span className="font-bold text-emerald-600">{item.healthScore}%</span>,
    },
    {
      key: 'nextServiceDueDate',
      header: 'Next Service Due',
      render: (item) => <span className="text-slate-500">{item.nextServiceDueDate}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Fleet Health Score</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">94% Optimal</h3>
        </div>
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Yard Capacity</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Airport Express & Central Hub</h3>
        </div>
        <div className="card-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Scheduled Maintenance</span>
          <h3 className="text-xl font-bold text-amber-600 mt-1">1 Vehicle Due This Week</h3>
        </div>
      </div>

      <DataTable
        columns={inventoryColumns}
        data={inventory}
        keyExtractor={(item) => item.id}
        pageSize={5}
        searchPlaceholder="Search vehicle name, license plate, yard location..."
        searchFilterKeys={['carName', 'licensePlate', 'yardLocation', 'currentStatus']}
      />
    </div>
  );
}
