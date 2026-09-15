'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import Modal from '@/components/ui/Modal';
import { Layers, Plus, Car, Crown, Zap, Flame } from 'lucide-react';

export default function CategoriesView() {
  const { categories, addCategory } = useRentalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState(2500);

  const iconMap: Record<string, React.ElementType> = {
    CarFront: Car,
    Crown: Crown,
    Zap: Zap,
    Car: Car,
    Flame: Flame,
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addCategory({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      startingPrice,
      icon: 'Car',
      status: 'Active',
    });
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="card-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Vehicle Fleet Categories</h3>
          <p className="text-xs text-slate-500">Organize car model inventory by market segment and pricing</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComp = iconMap[cat.icon] || Layers;
          return (
            <div key={cat.id} className="card-white card-white-hover p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {cat.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{cat.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Available Cars</span>
                  <span className="font-bold text-slate-900">{cat.carCount} Vehicles</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] font-medium">Starting Rate</span>
                  <span className="font-bold text-blue-600">₹{cat.startingPrice.toLocaleString('en-IN')}/day</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Fleet Category"
        subtitle="Define new market segment and starting tariffs"
        icon={Layers}
        maxWidth="md"
      >
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Convertible Sports"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Short category summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Starting Rate (₹/day)</label>
            <input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold shadow-xs">
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
