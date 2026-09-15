'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { CarProduct } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import {
  Car,
  Plus,
  Filter,
  Grid,
  List,
  Fuel,
  Gauge,
  Users,
  Trash2,
  Edit3,
  Search,
} from 'lucide-react';

export default function ProductsView() {
  const { cars, searchQuery: globalSearch, addCar, updateCar, deleteCar } = useRentalStore();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarProduct | null>(null);
  const [deletingCar, setDeletingCar] = useState<CarProduct | null>(null);

  // Form State for Adding New Car
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'SUV / Offroad',
    year: 2024,
    licensePlate: '',
    dailyRate: 3000,
    weeklyRate: 18000,
    monthlyRate: 60000,
    fuelType: 'Petrol' as CarProduct['fuelType'],
    transmission: 'Automatic' as CarProduct['transmission'],
    seats: 5,
    color: 'Black',
    status: 'Available' as CarProduct['status'],
    mileage: 5000,
    location: 'Bangalore Central Yard',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    features: 'Sunroof, Bluetooth, Touchscreen, Reverse Camera',
  });

  const categories = ['All', 'SUV / Offroad', 'Electric', 'Luxury Sedan', 'Compact SUV', 'Luxury SUV'];
  const statuses = ['All', 'Available', 'Rented', 'Maintenance', 'Reserved'];

  const effectiveSearch = localSearch || globalSearch;

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      car.brand.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      car.licensePlate.toLowerCase().includes(effectiveSearch.toLowerCase());
    const matchesCat = selectedCategory === 'All' || car.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || car.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Create Vehicle
  const handleCreateCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.licensePlate) return;

    addCar({
      ...formData,
      rating: 5.0,
      reviewsCount: 1,
      features: formData.features.split(',').map((f) => f.trim()),
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      brand: '',
      category: 'SUV / Offroad',
      year: 2024,
      licensePlate: '',
      dailyRate: 3000,
      weeklyRate: 18000,
      monthlyRate: 60000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      color: 'Black',
      status: 'Available',
      mileage: 5000,
      location: 'Bangalore Central Yard',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      features: 'Sunroof, Bluetooth, Touchscreen, Reverse Camera',
    });
  };

  // Update Existing Vehicle
  const handleUpdateCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;

    updateCar(editingCar.id, editingCar);
    setEditingCar(null);
  };

  // Confirm Delete Vehicle
  const handleConfirmDelete = () => {
    if (!deletingCar) return;
    deleteCar(deletingCar.id);
    setDeletingCar(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter Bar */}
      <div className="card-white p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input Bar + Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Direct Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search car model, brand, plate #..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" /> Category:
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 ml-1">
            Status:
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle & Add Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.length === 0 ? (
            <div className="col-span-full card-white p-8 text-center text-slate-400 font-medium text-xs">
              No vehicles found matching "{effectiveSearch}"
            </div>
          ) : (
            filteredCars.map((car) => (
              <div key={car.id} className="card-white card-white-hover overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs ${
                        car.status === 'Available'
                          ? 'bg-emerald-500 text-white'
                          : car.status === 'Rented'
                          ? 'bg-blue-600 text-white'
                          : car.status === 'Maintenance'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {car.status}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {car.licensePlate}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {car.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{car.name}</h3>
                      <p className="text-[11px] text-slate-400">{car.brand} • {car.year}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-slate-400" /> {car.fuelType}
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" /> {car.transmission.slice(0, 4)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {car.seats} Seats
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Daily Rental Rate</span>
                    <span className="text-base font-bold text-slate-900">
                      ₹{car.dailyRate.toLocaleString('en-IN')}
                      <span className="text-xs text-slate-400 font-normal"> /day</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingCar(car)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                      title="Edit Product Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCar(car)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card-white p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Plate No</th>
                <th className="py-3 px-3">Fuel / Trans</th>
                <th className="py-3 px-3">Daily Rate</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No vehicles found matching "{effectiveSearch}"
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={car.image} alt={car.name} className="w-10 h-8 rounded object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900">{car.name}</div>
                          <div className="text-[10px] text-slate-400">{car.brand} ({car.year})</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{car.category}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{car.licensePlate}</td>
                    <td className="py-3 px-3 text-slate-600">{car.fuelType} • {car.transmission}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">₹{car.dailyRate.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          car.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : car.status === 'Rented'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {car.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCar(car)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingCar(car)}
                          className="text-rose-500 hover:text-rose-700 font-medium text-xs underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Add New Vehicle Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vehicle to Fleet"
        subtitle="Provide specifications, registration details, and daily rates in ₹"
        icon={Car}
        maxWidth="xl"
      >
        <form onSubmit={handleCreateCar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Car Model Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Mahindra Thar LX"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Brand / Manufacturer</label>
              <input
                type="text"
                required
                placeholder="e.g. Mahindra"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              >
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">License Plate Number</label>
              <input
                type="text"
                required
                placeholder="KA-01-AB-1234"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Daily Rate (₹)</label>
              <input
                type="number"
                required
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) =>
                  setFormData({ ...formData, fuelType: e.target.value as CarProduct['fuelType'] })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Transmission</label>
              <select
                value={formData.transmission}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transmission: e.target.value as CarProduct['transmission'],
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seats</label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
            >
              Save & Add Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit Vehicle Details Modal */}
      {editingCar && (
        <Modal
          isOpen={!!editingCar}
          onClose={() => setEditingCar(null)}
          title={`Edit Product: ${editingCar.name}`}
          subtitle="Modify vehicle specifications, rental status, or pricing"
          icon={Edit3}
          maxWidth="xl"
        >
          <form onSubmit={handleUpdateCar} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Car Model Name</label>
                <input
                  type="text"
                  required
                  value={editingCar.name}
                  onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={editingCar.brand}
                  onChange={(e) => setEditingCar({ ...editingCar, brand: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={editingCar.category}
                  onChange={(e) => setEditingCar({ ...editingCar, category: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">License Plate</label>
                <input
                  type="text"
                  required
                  value={editingCar.licensePlate}
                  onChange={(e) => setEditingCar({ ...editingCar, licensePlate: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Daily Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={editingCar.dailyRate}
                  onChange={(e) => setEditingCar({ ...editingCar, dailyRate: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={editingCar.status}
                  onChange={(e) =>
                    setEditingCar({ ...editingCar, status: e.target.value as CarProduct['status'] })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none font-bold"
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fuel Type</label>
                <select
                  value={editingCar.fuelType}
                  onChange={(e) =>
                    setEditingCar({
                      ...editingCar,
                      fuelType: e.target.value as CarProduct['fuelType'],
                    })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transmission</label>
                <select
                  value={editingCar.transmission}
                  onChange={(e) =>
                    setEditingCar({
                      ...editingCar,
                      transmission: e.target.value as CarProduct['transmission'],
                    })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Image URL</label>
              <input
                type="url"
                value={editingCar.image}
                onChange={(e) => setEditingCar({ ...editingCar, image: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCar(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
              >
                Update Product Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Global Reusable ConfirmDeleteModal Component */}
      {deletingCar && (
        <ConfirmDeleteModal
          isOpen={!!deletingCar}
          onClose={() => setDeletingCar(null)}
          onConfirm={handleConfirmDelete}
          title="Confirm Vehicle Removal"
          itemName={deletingCar.name}
          itemDetails={`Plate: ${deletingCar.licensePlate} • Rate: ₹${deletingCar.dailyRate}/day`}
          itemImage={deletingCar.image}
          warningText={`Are you sure you want to remove ${deletingCar.name}? Associated rental booking records will be affected.`}
          confirmText="Yes, Delete Vehicle"
        />
      )}
    </div>
  );
}
