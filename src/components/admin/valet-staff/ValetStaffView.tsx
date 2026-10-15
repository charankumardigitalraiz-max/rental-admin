'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import { useValetBookingStore } from '@/store/useValetBookingStore';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import {
  Users,
  Search,
  Filter,
  Star,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  ShieldCheck,
  Calendar,
  UserPlus,
  Eye,
  Briefcase,
  ExternalLink,
  DollarSign,
  Award,
  CreditCard,
  FileCheck,
  HeartPulse,
  Upload,
  X,
  FileText,
} from 'lucide-react';
import { ValetStaff } from '@/types';

// Helper to provide ID Proof specific labels, placeholders, and hints
const getIdProofConfig = (type: string) => {
  switch (type) {
    case 'Aadhaar Card':
      return {
        label: 'Aadhaar Card Number (12 Digits)',
        placeholder: 'e.g. 5544 3322 1100',
        maxLength: 14,
        hint: 'Enter 12-digit UIDAI number for identity check',
      };
    case 'PAN Card':
      return {
        label: 'PAN Card Number (10 Alphanumeric)',
        placeholder: 'e.g. ABCDE1234F',
        maxLength: 10,
        hint: 'Enter 10-character Income Tax Department PAN',
      };
    case 'Voter ID':
      return {
        label: 'Voter ID (EPIC) Number',
        placeholder: 'e.g. WBF1234567',
        maxLength: 16,
        hint: 'Enter Election Commission of India Voter ID Number',
      };
    case 'Driving License':
      return {
        label: 'Driving License (DL) Number',
        placeholder: 'e.g. KA-03-20220008899',
        maxLength: 20,
        hint: 'Enter valid Indian State RTO Driving License',
      };
    case 'Passport':
      return {
        label: 'Passport Number',
        placeholder: 'e.g. A1234567',
        maxLength: 12,
        hint: 'Enter Republic of India Passport Number',
      };
    default:
      return {
        label: 'Government ID Number',
        placeholder: 'Enter official ID number',
        maxLength: 25,
        hint: 'Official government-issued identification number',
      };
  }
};

export default function ValetStaffView() {
  const { valetStaff, updateValetStaffStatus, addValetStaff } = useRentalStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedStaff, setSelectedStaff] = useState<ValetStaff | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating new staff member with dynamic single ID proof choice
  const [createFormData, setCreateFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    address: '',
    experienceYears: 3,
    status: 'Available' as ValetStaff['status'],
    avatar: '',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    // Separate fields for front and back images of the ID proof
    idProofFrontImage: '',
    idProofBackImage: '',
    drivingLicenseNumber: '',
    emergencyContact: '',
    bloodGroup: 'O+',
  });

  const filteredStaff = valetStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery) ||
      staff.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.address && staff.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staff.idProofNumber && staff.idProofNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staff.idProofType && staff.idProofType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staff.aadhaarNumber && staff.aadhaarNumber.includes(searchQuery)) ||
      (staff.drivingLicenseNumber &&
        staff.drivingLicenseNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'On Duty'
          ? staff.status === 'On Duty' || staff.status === 'Assigned'
          : staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = valetStaff.filter((s) => s.status === 'Available').length;
  const onDutyCount = valetStaff.filter((s) => s.status === 'On Duty' || s.status === 'Assigned').length;
  const avgRating = (valetStaff.reduce((acc, s) => acc + s.rating, 0) / (valetStaff.length || 1)).toFixed(1);

  // Handle local file upload for ID proof front image
  const handleIdProofFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('File Too Large', 'Please upload an image smaller than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateFormData((prev) => ({
          ...prev,
          idProofFrontImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local file upload for ID proof back image
  const handleIdProofBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('File Too Large', 'Please upload an image smaller than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateFormData((prev) => ({
          ...prev,
          idProofBackImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Create Staff submission with dynamic ID proof validation
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name.trim() || !createFormData.phone.trim() || !createFormData.location.trim()) {
      toast.warning('Required Fields Missing', 'Please fill in name, phone, and operating location');
      return;
    }

    if (!createFormData.address.trim()) {
      toast.warning('Address Required', 'Please enter the residential address of the staff member');
      return;
    }

    if (!createFormData.idProofNumber.trim()) {
      toast.warning(
        `${createFormData.idProofType} Number Required`,
        `Please enter the ${createFormData.idProofType} number for verification`
      );
      return;
    }

    if (!createFormData.idProofFrontImage.trim()) {
      toast.warning(
        'Front ID Image Required',
        `Please upload the front side image of the ${createFormData.idProofType}`
      );
      return;
    }

    const defaultAvatar =
      createFormData.avatar.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        createFormData.name
      )}&background=023526&color=fff&bold=true`;

    const newStaff = addValetStaff({
      name: createFormData.name.trim(),
      phone: createFormData.phone.trim(),
      email:
        createFormData.email.trim() ||
        `${createFormData.name.toLowerCase().replace(/\s+/g, '.')}@valet.com`,
      location: createFormData.location.trim(),
      address: createFormData.address.trim(),
      experienceYears: Number(createFormData.experienceYears) || 1,
      status: createFormData.status,
      avatar: defaultAvatar,
      rating: 5.0,
      assignedEventsCount: 0,
      idProofType: createFormData.idProofType,
      idProofNumber: createFormData.idProofNumber.trim(),
      // Store both front and back images + legacy idProofImage
      idProofImage: createFormData.idProofFrontImage.trim(),
      idProofFrontImage: createFormData.idProofFrontImage.trim(),
      idProofBackImage: createFormData.idProofBackImage.trim(),
      // Auto-map backward compatibility fields if Aadhaar was the chosen ID
      aadhaarNumber:
        createFormData.idProofType === 'Aadhaar Card'
          ? createFormData.idProofNumber.trim()
          : undefined,
      aadhaarCardImage:
        createFormData.idProofType === 'Aadhaar Card'
          ? createFormData.idProofFrontImage.trim()
          : undefined,
      aadhaarCardFront:
        createFormData.idProofType === 'Aadhaar Card'
          ? createFormData.idProofFrontImage.trim()
          : undefined,
      aadhaarCardBack:
        createFormData.idProofType === 'Aadhaar Card'
          ? createFormData.idProofBackImage.trim()
          : undefined,
      drivingLicenseNumber:
        createFormData.idProofType === 'Driving License'
          ? createFormData.idProofNumber.trim()
          : createFormData.drivingLicenseNumber.trim() || undefined,
      emergencyContact: createFormData.emergencyContact.trim(),
      bloodGroup: createFormData.bloodGroup,
      earnings: { total: 0, pending: 0, paid: 0 },
    });

    // Sync to valet booking store roster as well
    useValetBookingStore.setState((s) => ({
      availableStaff: [newStaff, ...s.availableStaff],
    }));

    toast.success('Valet Staff Registered', `${newStaff.name} verified with ${createFormData.idProofType} & added to roster`);
    setCreateFormData({
      name: '',
      phone: '',
      email: '',
      location: '',
      address: '',
      experienceYears: 3,
      status: 'Available',
      avatar: '',
      idProofType: 'Aadhaar Card',
      idProofNumber: '',
      idProofFrontImage: '',
      idProofBackImage: '',
      drivingLicenseNumber: '',
      emergencyContact: '',
      bloodGroup: 'O+',
    });
    setIsCreateModalOpen(false);
  };

  // Handle status update for a staff member
  const handleUpdateStatus = (staffId: string, status: ValetStaff['status']) => {
    updateValetStaffStatus(staffId, status);
    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff((prev) => (prev ? { ...prev, status } : null));
    }
    useValetBookingStore.setState((s) => ({
      availableStaff: s.availableStaff.map((staff) =>
        staff.id === staffId ? { ...staff, status } : staff
      ),
    }));
    toast.success('Status Updated', `Staff status changed to ${status}`);
  };

  const idConfig = getIdProofConfig(createFormData.idProofType);

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* 4 Individual Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('All')}
          className={`card-white p-4 space-y-1 cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'All'
            ? 'ring-2 ring-[#023526] border-transparent shadow-xs'
            : 'hover:border-slate-300'
            }`}
          title="Click to view all staff"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Valet Staff
            </span>
            {statusFilter === 'All' && <span className="w-2 h-2 rounded-full bg-[#023526]" />}
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{valetStaff.length}</div>
          <span className="text-[10px] text-slate-400 font-medium">Active roster staff</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'On Duty' ? 'All' : 'On Duty')}
          className={`card-white p-4 space-y-1 cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'On Duty'
            ? 'ring-2 ring-emerald-600 border-transparent shadow-xs'
            : 'hover:border-emerald-200'
            }`}
          title="Click to filter on-duty / assigned staff"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">
              On Duty / Assigned
            </span>
            {statusFilter === 'On Duty' && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{onDutyCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Currently assigned to events</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'Available' ? 'All' : 'Available')}
          className={`card-white p-4 space-y-1 cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Available'
            ? 'ring-2 ring-sky-600 border-transparent shadow-xs'
            : 'hover:border-sky-200'
            }`}
          title="Click to filter available standby staff"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-sky-700 block">
              Available Standby
            </span>
            {statusFilter === 'Available' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
          </div>
          <div className="text-xl font-bold text-sky-700 mt-1">{availableCount}</div>
          <span className="text-[10px] text-sky-600 font-medium">Ready for event allocation</span>
        </div>

        <div className="card-white p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">
              Average Roster Rating
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xl font-bold text-amber-700 mt-1">
            {avgRating} <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Based on event reviews</span>
        </div>
      </div>

      {/* Main Roster Card (Search, Filters, Create & Cards Grid) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        {/* Filter, Search, and Create Staff Header */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, phone, location, address, ID proof..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] focus:outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="All">All Staff ({valetStaff.length})</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="On Duty">On Duty</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#023526] hover:bg-[#034834] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Valet Staff</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredStaff.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No valet staff found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or status filter, or register a new staff member.
            </p>
          </div>
        ) : (
          /* Roster Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-slate-50/50 hover:bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group hover:border-[#023526]/30"
              >
                {/* Top Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-stone-100 group-hover:ring-[#023526]/20 transition-all"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-[#023526] text-white p-0.5 rounded-full ring-2 ring-white">
                        <ShieldCheck className="w-3 h-3 text-amber-300" />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-[#023526] transition-colors">
                        {staff.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{staff.rating}</span>
                        <span className="text-slate-400 font-normal">({staff.assignedEventsCount} events)</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${staff.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                      : staff.status === 'On Duty'
                        ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                        : staff.status === 'Assigned'
                          ? 'bg-sky-50 text-sky-800 border-sky-200/80'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Available'
                        ? 'bg-emerald-500 animate-pulse'
                        : staff.status === 'On Duty'
                          ? 'bg-amber-500 animate-pulse'
                          : staff.status === 'Assigned'
                            ? 'bg-sky-500'
                            : 'bg-slate-400'
                        }`}
                    />
                    {staff.status}
                  </span>
                </div>

                {/* Info Grid with Phone, Location, Address & ID Proof Snippet */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{staff.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{staff.location}</span>
                  </div>

                  {staff.address && (
                    <div className="col-span-2 flex items-start gap-1.5 text-slate-500 text-[11px] pt-1 border-t border-slate-200/50">
                      <span className="text-slate-400 shrink-0 font-medium">Address:</span>
                      <span className="truncate" title={staff.address}>
                        {staff.address}
                      </span>
                    </div>
                  )}

                  <div className="col-span-2 flex items-center justify-between gap-2 text-slate-700 pt-1.5 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#023526] shrink-0" />
                      <span>{staff.experienceYears} Yrs Exp</span>
                    </div>

                    <div
                      className="flex items-center gap-1 text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200"
                      title={
                        staff.idProofNumber
                          ? `${staff.idProofType || 'ID'}: ${staff.idProofNumber}`
                          : staff.aadhaarNumber
                            ? `Aadhaar: ${staff.aadhaarNumber}`
                            : 'ID Verified'
                      }
                    >
                      <CreditCard className="w-3 h-3 text-[#023526]" />
                      <span>
                        {staff.idProofType
                          ? `${staff.idProofType.split(' ')[0]}: ••• ${(staff.idProofNumber || '').slice(-4) || 'OK'
                          }`
                          : staff.aadhaarNumber
                            ? `Aadhaar: ••• ${staff.aadhaarNumber.replace(/\s+/g, '').slice(-4)}`
                            : 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Event Assignment Banner */}
                {staff.currentAssignment ? (
                  <div className="bg-gradient-to-r from-emerald-950 to-[#023526] text-white p-3 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[#c5a880] uppercase tracking-wider">
                      <span>Current Event Duty</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="font-bold text-xs truncate text-white">{staff.currentAssignment.eventName}</p>
                    <p className="text-[11px] text-emerald-200/80 truncate">@ {staff.currentAssignment.venue}</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 p-2.5 rounded-xl text-[11px] text-slate-400 text-center font-medium">
                    No active event assigned currently
                  </div>
                )}

                {/* Card Footer: Earnings, View Button & Quick Status Selector */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <div>
                    <span className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider block">
                      Total Earnings
                    </span>
                    <p className="text-sm font-extrabold text-slate-900">
                      ₹{staff.earnings.total.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#023526] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="View Staff Profile & ID Proof Documents"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <select
                      value={staff.status}
                      onChange={(e) => handleUpdateStatus(staff.id, e.target.value as any)}
                      className="px-2 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#023526] focus:outline-none shadow-2xs cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="On Duty">On Duty</option>
                      <option value="Offline">Offline</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Staff Profile & ID Proof Modal */}
      {selectedStaff && (
        <Modal
          isOpen={!!selectedStaff}
          onClose={() => setSelectedStaff(null)}
          title="Valet Staff Profile"
          subtitle={`Roster ID: ${selectedStaff.id}`}
          icon={Users}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Update Status:</span>
                <select
                  value={selectedStaff.status}
                  onChange={(e) => handleUpdateStatus(selectedStaff.id, e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#023526] focus:outline-none shadow-2xs cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="On Duty">On Duty</option>
                  <option value="Offline">Offline</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 p-1">
            {/* Profile Overview Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={selectedStaff.avatar}
                    alt={selectedStaff.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-[#023526] text-white p-1 rounded-full ring-2 ring-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {selectedStaff.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-amber-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {selectedStaff.rating} Rating
                    </span>
                    <span>•</span>
                    <span>{selectedStaff.experienceYears} Years Experience</span>
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border self-start sm:self-center ${selectedStaff.status === 'Available'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : selectedStaff.status === 'On Duty'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : selectedStaff.status === 'Assigned'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${selectedStaff.status === 'Available'
                    ? 'bg-emerald-500 animate-pulse'
                    : selectedStaff.status === 'On Duty'
                      ? 'bg-amber-500 animate-pulse'
                      : selectedStaff.status === 'Assigned'
                        ? 'bg-sky-500'
                        : 'bg-slate-400'
                    }`}
                />
                {selectedStaff.status}
              </span>
            </div>

            {/* 3 Metric Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Events Handled
                </span>
                <p className="text-lg font-bold text-slate-900">
                  {selectedStaff.assignedEventsCount}
                </p>
                <span className="text-[10px] text-slate-400">Total bookings</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Earned
                </span>
                <p className="text-lg font-bold text-slate-900">
                  ₹{selectedStaff.earnings.total.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">
                  ₹{selectedStaff.earnings.paid.toLocaleString('en-IN')} paid
                </span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Pending Payout
                </span>
                <p className="text-lg font-bold text-amber-700">
                  ₹{selectedStaff.earnings.pending.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-amber-600 font-medium">To be settled</span>
              </div>
            </div>

            {/* Contact & Station Details (Includes Full Residential Address) */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contact & Address Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Phone</span>
                    <a
                      href={`tel:${selectedStaff.phone}`}
                      className="font-bold text-slate-800 hover:text-[#023526]"
                    >
                      {selectedStaff.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Email</span>
                    <a
                      href={`mailto:${selectedStaff.email}`}
                      className="font-bold text-slate-800 hover:text-[#023526] truncate block"
                    >
                      {selectedStaff.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Station / Hub
                    </span>
                    <span className="font-bold text-slate-800">{selectedStaff.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Experience
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedStaff.experienceYears} Years Active
                    </span>
                  </div>
                </div>

                {/* Full Residential Address Box */}
                <div className="col-span-1 sm:col-span-2 flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Building2 className="w-4 h-4 text-[#023526] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Full Residential Address
                    </span>
                    <span className="font-medium text-slate-800 text-xs">
                      {selectedStaff.address || `${selectedStaff.location}, Bengaluru, Karnataka`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Government ID & Driving Verification Details with Dynamic ID Proof Image */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Government Identification Proof</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> KYC Verified
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#023526] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {selectedStaff.idProofType || 'Aadhaar Card'} Number
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedStaff.idProofNumber || selectedStaff.aadhaarNumber || '7845 2390 1123'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-[#023526] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Driving License (DL) Number
                    </span>
                    <span className="font-mono font-bold text-slate-800 uppercase">
                      {selectedStaff.drivingLicenseNumber || 'KA-01-20180004521'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <HeartPulse className="w-4 h-4 text-rose-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Blood Group
                    </span>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80 inline-block text-[11px]">
                      {selectedStaff.bloodGroup || 'O+'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Emergency Contact
                    </span>
                    <span className="font-bold text-slate-800 truncate block">
                      {selectedStaff.emergencyContact || '+91 98800 99882 (Family)'}
                    </span>
                  </div>
                </div>

                {/* ID Proof Document Image Proof Display (Front & Back) */}
                <div className="col-span-1 sm:col-span-2 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#023526]" />{' '}
                      {selectedStaff.idProofType || 'Aadhaar Card'} Document Proof
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Official Document Verified
                    </span>
                  </div>

                  {(() => {
                    const frontImg =
                      selectedStaff.idProofFrontImage ||
                      selectedStaff.idProofImage ||
                      selectedStaff.aadhaarCardFront ||
                      selectedStaff.aadhaarCardImage;
                    const backImg =
                      selectedStaff.idProofBackImage || selectedStaff.aadhaarCardBack;

                    if (!frontImg && !backImg) {
                      return (
                        <div className="p-4 bg-white border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                          Physical document verified by administrator during onboarding.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {frontImg && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                              Front Side
                            </span>
                            <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-white">
                              <img
                                src={frontImg}
                                alt={`${selectedStaff.idProofType || 'ID Proof'} Front`}
                                className="w-full h-40 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <a
                                  href={frontImg}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> View Front
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {backImg && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                              Back Side
                            </span>
                            <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-white">
                              <img
                                src={backImg}
                                alt={`${selectedStaff.idProofType || 'ID Proof'} Back`}
                                className="w-full h-40 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <a
                                  href={backImg}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> View Back
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Current Active Assignment */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Current Active Duty Assignment</span>
                {selectedStaff.currentAssignment && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Active Deployment
                  </span>
                )}
              </h4>

              {selectedStaff.currentAssignment ? (
                <div className="p-3.5 bg-gradient-to-r from-emerald-950 to-[#023526] text-white rounded-xl space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#c5a880] uppercase tracking-wider">
                    <span>Assigned Event</span>
                    <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded">
                      {selectedStaff.currentAssignment.bookingId}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-white">
                    {selectedStaff.currentAssignment.eventName}
                  </h5>
                  <p className="text-xs text-emerald-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{selectedStaff.currentAssignment.venue}</span>
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/admin/valet-bookings/${selectedStaff.currentAssignment.bookingId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a880] hover:text-white transition-colors"
                    >
                      <span>View Full Event Booking</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-600">No active event deployment</p>
                  <p className="text-[11px] text-slate-400">
                    This staff member is currently on standby and ready to be allocated to upcoming events.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Staff Modal with Selectable Single ID Proof Dropdown */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Valet Staff"
        subtitle="Register and verify a trained valet attendant with Address, ID Proof & Credentials"
        icon={UserPlus}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4 p-1">
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Users className="w-3.5 h-3.5 text-[#023526]" /> Personal & Contact Details
            </h4>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="suresh.k@valet.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={createFormData.bloodGroup}
                  onChange={(e) => setCreateFormData({ ...createFormData, bloodGroup: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs cursor-pointer"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            {/* Residential Address Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Residential Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. #42, 3rd Cross, 2nd Main, Indiranagar, Bengaluru, Karnataka 560038"
                value={createFormData.address}
                onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs resize-none"
              />
            </div>
          </div>

          {/* Section 2: Government ID Proof Selection (Single Selected Proof) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#023526]" /> Official Identity Verification Proof
              </span>
              <span className="text-[10px] font-semibold text-[#023526] bg-emerald-50 px-2 py-0.5 rounded">
                One Government ID Proof Required
              </span>
            </h4>

            {/* Dropdown for selecting ID Proof Type & Dynamic Number Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select ID Proof Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createFormData.idProofType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setCreateFormData((prev) => ({
                      ...prev,
                      idProofType: newType,
                      idProofNumber: '',
                      idProofFrontImage: '',
                      idProofBackImage: '',
                    }));
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs cursor-pointer"
                >
                  <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                  <option value="PAN Card">PAN Card (Income Tax)</option>
                  <option value="Voter ID">Voter ID (Election Commission)</option>
                  <option value="Driving License">Driving License (RTO)</option>
                  <option value="Passport">Passport (Govt of India)</option>
                </select>
                {/* <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Select one official document to verify identity
                </span> */}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {idConfig.label} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={idConfig.maxLength}
                    placeholder={idConfig.placeholder}
                    value={createFormData.idProofNumber}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        idProofNumber:
                          createFormData.idProofType === 'PAN Card' ||
                            createFormData.idProofType === 'Driving License' ||
                            createFormData.idProofType === 'Voter ID'
                            ? e.target.value.toUpperCase()
                            : e.target.value,
                      })
                    }
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 font-mono uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs"
                  />
                </div>
                {/* <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {idConfig.hint}
                </span> */}
              </div>
            </div>

            {/* Dynamic ID Proof Document Image Uploads (Front & Back) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  {createFormData.idProofType} Uploads (Front & Back Side) <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10.5px] text-slate-400 font-normal">PNG, JPG, or WebP (Max 5MB each)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Front Side Upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      Front Side Proof <span className="text-rose-500">*</span>
                    </span>
                    {createFormData.idProofFrontImage && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Attached
                      </span>
                    )}
                  </div>

                  {!createFormData.idProofFrontImage ? (
                    <label className="block cursor-pointer">
                      <div className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-200 hover:border-[#023526] rounded-xl bg-slate-50/70 hover:bg-emerald-50/20 transition-all text-center group shadow-2xs">
                        <Upload className="w-5 h-5 text-[#023526] group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-bold text-slate-700 group-hover:text-[#023526]">
                          Upload Front Side
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click to choose image file</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIdProofFrontUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-2.5 shadow-2xs">
                      <img
                        src={createFormData.idProofFrontImage}
                        alt="Front Side Preview"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">
                          Front Side Document
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Ready for verification
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCreateFormData((prev) => ({ ...prev, idProofFrontImage: '' }))
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Front Side Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Back Side Upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      Back Side Proof
                    </span>
                    {createFormData.idProofBackImage && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Attached
                      </span>
                    )}
                  </div>

                  {!createFormData.idProofBackImage ? (
                    <label className="block cursor-pointer">
                      <div className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-200 hover:border-[#023526] rounded-xl bg-slate-50/70 hover:bg-emerald-50/20 transition-all text-center group shadow-2xs">
                        <Upload className="w-5 h-5 text-[#023526] group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-bold text-slate-700 group-hover:text-[#023526]">
                          Upload Back Side
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click to choose image file</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIdProofBackUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-2.5 shadow-2xs">
                      <img
                        src={createFormData.idProofBackImage}
                        alt="Back Side Preview"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">
                          Back Side Document
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Ready for verification
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCreateFormData((prev) => ({ ...prev, idProofBackImage: '' }))
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Back Side Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Driving License & Emergency Contact if ID selected is not DL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* {createFormData.idProofType !== 'Driving License' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Driving License (DL) Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KA-03-20220008899"
                    value={createFormData.drivingLicenseNumber}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        drivingLicenseNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs"
                  />
                </div>
              )} */}

              {/* <div className={createFormData.idProofType === 'Driving License' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98800 11223 (Kin/Spouse)"
                  value={createFormData.emergencyContact}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, emergencyContact: e.target.value })
                  }
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs"
                />
              </div> */}
            </div>
          </div>



          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#023526] hover:bg-[#034834] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Verify & Register Staff</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
