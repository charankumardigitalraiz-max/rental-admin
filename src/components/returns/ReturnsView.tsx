'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import Modal from '@/components/ui/Modal';
import { RotateCcw, Plus, CheckCircle2, Gauge, Fuel, ShieldAlert } from 'lucide-react';

export default function ReturnsView() {
  const { returns, cars, addReturnRecord } = useRentalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [carId, setCarId] = useState(cars[0]?.id || 'car-1');
  const [customerName, setCustomerName] = useState('');
  const [startingOdometer, setStartingOdometer] = useState(8000);
  const [endingOdometer, setEndingOdometer] = useState(8350);
  const [damageReported, setDamageReported] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');
  const [extraCharges, setExtraCharges] = useState(0);

  const handleAddReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const selCar = cars.find((c) => c.id === carId) || cars[0];

    addReturnRecord({
      bookingId: `RNT-2026-${Math.floor(9000 + Math.random() * 900)}`,
      carId: selCar.id,
      carName: selCar.name,
      customerName: customerName || 'Walk-in Customer',
      expectedReturnDate: new Date().toISOString().slice(0, 10),
      actualReturnDate: new Date().toISOString().slice(0, 10),
      startingOdometer,
      endingOdometer,
      distanceDriven: endingOdometer - startingOdometer,
      fuelLevelBefore: '100% Full',
      fuelLevelAfter: '85% Charge',
      damageReported,
      damageNotes,
      extraCharges,
      inspectorName: 'Suresh Kumar (Inspector)',
      status: 'Inspected',
    });

    setIsModalOpen(false);
    setCustomerName('');
    setDamageNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Vehicle Dropoff & Return Logs</h3>
          <p className="text-xs text-slate-500">Record odometer distance, fuel levels, damage assessment, and extra fees</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Return Inspection
        </button>
      </div>

      <div className="space-y-4">
        {returns.map((record) => (
          <div key={record.id} className="card-white p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary text-xs bg-primary-light px-2 py-0.5 rounded">
                    {record.returnId}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{record.carName}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rented by: <span className="font-semibold text-slate-800">{record.customerName}</span> (Order {record.bookingId})
                </p>
              </div>

              <div className="flex items-center gap-2">
                {record.damageReported ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded">
                    <ShieldAlert className="w-3.5 h-3.5" /> Damage Recorded
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Clean Return
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Distance Driven</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-slate-400" /> {record.distanceDriven} km
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Fuel / Battery Status</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" /> {record.fuelLevelAfter}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Extra Penalties/Fees</span>
                <span className="font-bold text-slate-900">
                  ₹{record.extraCharges.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Inspected By</span>
                <span className="font-medium text-slate-700">{record.inspectorName}</span>
              </div>
            </div>

            {record.damageReported && record.damageNotes && (
              <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-lg text-xs text-rose-900">
                <span className="font-bold">Inspector Notes:</span> {record.damageNotes}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Vehicle Inspection Record"
        subtitle="Log odometer distance, fuel levels, and damage penalties"
        icon={RotateCcw}
        maxWidth="md"
      >
        <form onSubmit={handleAddReturn} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Returned Vehicle</label>
            <select
              value={carId}
              onChange={(e) => setCarId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.licensePlate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Odometer (km)</label>
              <input
                type="number"
                value={startingOdometer}
                onChange={(e) => setStartingOdometer(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ending Odometer (km)</label>
              <input
                type="number"
                value={endingOdometer}
                onChange={(e) => setEndingOdometer(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="dmg"
              checked={damageReported}
              onChange={(e) => setDamageReported(e.target.checked)}
              className="rounded text-primary accent-primary"
            />
            <label htmlFor="dmg" className="font-semibold text-slate-800">
              Damage reported during inspection
            </label>
          </div>

          {damageReported && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Damage Description & Notes</label>
              <textarea
                rows={2}
                placeholder="Describe scratch, dent, or repair needed..."
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              ></textarea>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Extra Charges / Penalties (₹)</label>
            <input
              type="number"
              value={extraCharges}
              onChange={(e) => setExtraCharges(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold shadow-xs">
              Save Return Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
