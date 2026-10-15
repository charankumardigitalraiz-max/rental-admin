'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import { useValetBookingStore } from '@/store/useValetBookingStore';
import { useValetStaffStore } from '@/store/useValetStaffStore';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import DataTable, { Column } from '@/components/ui/DataTable';
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
  Loader2,
  RefreshCw,
  RotateCcw,
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
  const { valetStaff, addValetStaff } = useRentalStore();
  const {
    staffList,
    isLoading,
    isSubmitting,
    fetchStaff,
    createStaff,
    updateStaffStatus,
    counts,
    pagination,
  } = useValetStaffStore();
  const { toast } = useToast();

  // Dynamic Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [proofTypeFilter, setProofTypeFilter] = useState<string>('All');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals & Selection
  const [selectedStaff, setSelectedStaff] = useState<ValetStaff | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

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
    idProofFrontImage: '',
    idProofBackImage: '',
    drivingLicenseNumber: '',
    emergencyContact: '',
    bloodGroup: 'O+',
  });

  // Debounce search input (300ms) to ensure smooth live typing and prevent backend overloading
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Dynamically fetch staff from backend whenever search or any filter criteria changes
  useEffect(() => {
    fetchStaff({
      page: currentPage,
      limit: 50,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      proofType: proofTypeFilter !== 'All' ? proofTypeFilter : undefined,
      bloodGroup: bloodGroupFilter !== 'All' ? bloodGroupFilter : undefined,
      location: locationFilter !== 'All' ? locationFilter : undefined,
    });
  }, [debouncedSearch, statusFilter, proofTypeFilter, bloodGroupFilter, locationFilter, currentPage, fetchStaff]);

  const currentStaffList = staffList.length > 0 ? staffList : valetStaff;

  // Extract unique locations for the dynamic Base Hub filter dropdown
  const uniqueLocations = React.useMemo(() => {
    const locSet = new Set<string>();
    currentStaffList.forEach((s) => {
      if (s.location && s.location.trim()) {
        locSet.add(s.location.trim());
      }
    });
    return Array.from(locSet).sort();
  }, [currentStaffList]);

  // Client-side instant filter match for immediate feedback
  const filteredStaff = React.useMemo(() => {
    return currentStaffList.filter((staff) => {
      if (statusFilter !== 'All') {
        if (statusFilter === 'On Duty') {
          if (staff.status !== 'On Duty' && staff.status !== 'Assigned') return false;
        } else if (staff.status !== statusFilter) {
          return false;
        }
      }
      if (proofTypeFilter !== 'All') {
        const pType = (staff.idProofType || '').toLowerCase();
        const target = proofTypeFilter.toLowerCase().replace(/card|license/g, '').trim();
        if (!pType.includes(target)) return false;
      }
      if (bloodGroupFilter !== 'All') {
        if (staff.bloodGroup !== bloodGroupFilter) return false;
      }
      if (locationFilter !== 'All') {
        const loc = (staff.location || staff.address || '').toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          staff.name.toLowerCase().includes(q) ||
          staff.phone.toLowerCase().includes(q) ||
          (staff.staffId || '').toLowerCase().includes(q) ||
          (staff.email || '').toLowerCase().includes(q) ||
          (staff.location || '').toLowerCase().includes(q) ||
          (staff.address || '').toLowerCase().includes(q) ||
          (staff.idProofNumber || '').toLowerCase().includes(q) ||
          (staff.idProofType || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [currentStaffList, statusFilter, proofTypeFilter, bloodGroupFilter, locationFilter, searchQuery]);

  const totalCount = counts?.total ?? currentStaffList.length;
  const availableCount = counts?.available ?? currentStaffList.filter((s) => s.status === 'Available').length;
  const onDutyCount = counts?.onDuty ?? currentStaffList.filter((s) => s.status === 'On Duty' || s.status === 'Assigned').length;
  const avgRating = (currentStaffList.reduce((acc, s) => acc + s.rating, 0) / (currentStaffList.length || 1)).toFixed(1);

  const isFiltered =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    proofTypeFilter !== 'All' ||
    bloodGroupFilter !== 'All' ||
    locationFilter !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setProofTypeFilter('All');
    setBloodGroupFilter('All');
    setLocationFilter('All');
    setCurrentPage(1);
  };

  // Handle local file upload for ID proof front image
  const handleIdProofFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('File Too Large', 'Please upload an image smaller than 5MB');
        return;
      }
      setFrontFile(file);
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
      setBackFile(file);
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

  // Handle Create Staff submission with dynamic ID proof validation & API integration
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name.trim()) {
      toast.warning('Full Name Required', 'Please enter the staff member’s full name');
      return;
    }

    const cleanPhone = createFormData.phone.replace(/\D/g, '').replace(/^91/, '');
    if (!cleanPhone) {
      toast.warning('Phone Number Required', 'Please enter a valid mobile number');
      return;
    }
    if (cleanPhone.length !== 10) {
      toast.warning('Invalid Phone Number', 'Mobile number must be exactly 10 digits');
      return;
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      toast.warning('Invalid Phone Number', 'Mobile number must start with 6, 7, 8, or 9');
      return;
    }

    if (createFormData.email.trim() && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(createFormData.email.trim())) {
      toast.warning('Invalid Email Address', 'Please enter a valid email address (e.g. name@domain.com)');
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

    if (!createFormData.idProofFrontImage.trim() && !frontFile) {
      toast.warning(
        'Front ID Image Required',
        `Please upload the front side image of the ${createFormData.idProofType}`
      );
      return;
    }

    // Build FormData payload for POST /api/admin/valet-staff
    const formData = new FormData();
    formData.append('name', createFormData.name.trim());
    formData.append('phone', createFormData.phone.trim());
    if (createFormData.email.trim()) formData.append('email', createFormData.email.trim());
    formData.append('address', createFormData.address.trim());
    formData.append('location', createFormData.location.trim() || createFormData.address.trim());
    formData.append('proofType', createFormData.idProofType);
    formData.append('identityNumber', createFormData.idProofNumber.trim());
    formData.append('bloodGroup', createFormData.bloodGroup || 'O+');
    formData.append('status', 'active');
    if (createFormData.experienceYears) {
      formData.append('experienceYears', createFormData.experienceYears.toString());
    }

    if (frontFile) {
      formData.append('proofImage', frontFile);
    } else if (createFormData.idProofFrontImage) {
      formData.append('proofImage', createFormData.idProofFrontImage);
    }

    if (backFile) {
      formData.append('proofImageBack', backFile);
    } else if (createFormData.idProofBackImage) {
      formData.append('proofImageBack', createFormData.idProofBackImage);
    }

    if (createFormData.avatar) {
      formData.append('profileImage', createFormData.avatar);
    }

    const result = await createStaff(formData);
    if (!result.success) {
      toast.error('Registration Failed', result.error || 'Failed to create staff');
      return;
    }

    // Sync to legacy stores
    if (result.data) {
      addValetStaff(result.data);
      useValetBookingStore.setState((s) => ({
        availableStaff: [result.data!, ...s.availableStaff],
      }));
    }

    toast.success(
      'Valet Staff Registered',
      `${result.data?.name || createFormData.name} verified with ${createFormData.idProofType} & saved to database`
    );

    setFrontFile(null);
    setBackFile(null);
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

  // Handle status update for a staff member via API
  const handleUpdateStatus = async (staffId: string, status: ValetStaff['status']) => {
    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff((prev) => (prev ? { ...prev, status } : null));
    }
    useValetBookingStore.setState((s) => ({
      availableStaff: s.availableStaff.map((staff) =>
        staff.id === staffId ? { ...staff, status } : staff
      ),
    }));

    const result = await updateStaffStatus(staffId, status);
    if (result.success) {
      toast.success('Status Updated', `Staff status changed to ${status}`);
    } else {
      toast.error('Update Failed', result.error || 'Failed to update status on server');
    }
  };

  const idConfig = getIdProofConfig(createFormData.idProofType);

  const columns: Column<ValetStaff>[] = [
    {
      key: 'name',
      header: 'Attendant Profile',
      className: 'min-w-[200px]',
      render: (staff) => (
        <Link
          href={`/admin/valet-staff/${staff.id}`}
          className="flex items-center gap-3 group/link"
          title={`View ${staff.name}'s Profile`}
        >
          <div className="relative shrink-0">
            <img
              src={staff.avatar}
              alt={staff.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 group-hover/link:ring-[#023526]/30 transition-all"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-1.5 ring-white ${staff.status === 'Available'
                ? 'bg-emerald-500'
                : staff.status === 'On Duty'
                  ? 'bg-amber-500'
                  : staff.status === 'Assigned'
                    ? 'bg-sky-500'
                    : 'bg-slate-400'
                }`}
            />
          </div>
          <div>
            <span className="font-bold text-slate-900 group-hover/link:text-[#023526] transition-colors block text-xs">
              {staff.name}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <span className="font-mono text-[10px] text-slate-400">{staff.staffId}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 font-semibold text-amber-700">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {staff.rating}
              </span>
              <span>•</span>
              <span>{staff.experienceYears}y exp</span>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: 'phone',
      header: 'Contact & Station',
      className: 'min-w-[170px]',
      render: (staff) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{staff.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[160px]" title={staff.address || staff.location}>
              {staff.location || 'Bengaluru Central'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'idProof',
      header: 'Government ID Proof',
      className: 'min-w-[180px]',
      render: (staff) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
            <CreditCard className="w-3 h-3 text-[#023526] shrink-0" />
            <span>{staff.idProofType || 'Aadhaar Card'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10.5px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
              {staff.idProofNumber || staff.aadhaarNumber || 'Verified'}
            </span>
            <span
              title="KYC Verified"
              className="bg-emerald-50 text-emerald-700 p-0.5 rounded border border-emerald-200 shrink-0"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'currentAssignment',
      header: 'Current Duty Assignment',
      className: 'min-w-[180px]',
      render: (staff) =>
        staff.currentAssignment ? (
          <div className="space-y-0.5 max-w-[190px]">
            <span className="font-bold text-slate-900 block text-xs truncate">
              {staff.currentAssignment.eventName}
            </span>
            <span className="text-[10.5px] text-slate-500 flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              {staff.currentAssignment.venue}
            </span>
            <span className="inline-block text-[9.5px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
              {staff.currentAssignment.bookingId}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Standby / Available
          </span>
        ),
    },
    {
      key: 'earnings',
      header: 'Events & Earnings',
      className: 'min-w-[140px]',
      render: (staff) => (
        <div>
          <span className="font-extrabold text-slate-900 text-xs block">
            ₹{staff.earnings.total.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {staff.assignedEventsCount} events handled
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-[140px]',
      render: (staff) => (
        <div className="flex flex-col gap-1 w-fit">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${staff.status === 'Available'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
              : staff.status === 'On Duty'
                ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                : staff.status === 'Assigned'
                  ? 'bg-sky-50 text-sky-800 border-sky-200/80'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Available' || staff.status === 'On Duty'
                ? 'bg-emerald-500 animate-pulse'
                : staff.status === 'Assigned'
                  ? 'bg-sky-500'
                  : 'bg-slate-400'
                }`}
            />
            {staff.status}
          </span>

          <select
            value={staff.status}
            onChange={(e) => handleUpdateStatus(staff.id, e.target.value as any)}
            className="text-[11px] font-semibold bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#023526] cursor-pointer"
          >
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="On Duty">On Duty</option>
            <option value="Offline">Offline</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (staff) => (
        <Link
          href={`/admin/valet-staff/${staff.id}`}
          className="px-3 py-1.5 bg-[#023526] hover:bg-[#034431] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          title="View Individual Valet Person Profile & Deployments Screen"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* 4 Individual Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setStatusFilter('All');
            setCurrentPage(1);
          }}
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
          <div className="text-xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">Active roster staff</span>
        </div>

        <div
          onClick={() => {
            setStatusFilter(statusFilter === 'On Duty' ? 'All' : 'On Duty');
            setCurrentPage(1);
          }}
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
          onClick={() => {
            setStatusFilter(statusFilter === 'Available' ? 'All' : 'Available');
            setCurrentPage(1);
          }}
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

      {/* Active Filter Badges Bar */}
      {isFiltered && (
        <div className="flex items-center gap-2 flex-wrap bg-slate-50 border border-slate-200/90 rounded-md p-3 text-xs shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#023526]" /> Active Filters:
          </span>

          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
              Search: <span className="font-bold text-[#023526]">&quot;{searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {statusFilter !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
              Status: <span className="font-bold text-[#023526]">{statusFilter}</span>
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {proofTypeFilter !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
              Proof: <span className="font-bold text-[#023526]">{proofTypeFilter}</span>
              <button
                type="button"
                onClick={() => setProofTypeFilter('All')}
                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear proof filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {bloodGroupFilter !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
              Blood: <span className="font-bold text-[#023526]">{bloodGroupFilter}</span>
              <button
                type="button"
                onClick={() => setBloodGroupFilter('All')}
                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear blood group filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {locationFilter !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
              Hub: <span className="font-bold text-[#023526]">{locationFilter}</span>
              <button
                type="button"
                onClick={() => setLocationFilter('All')}
                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear location filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}

      {/* Main Roster with Global DataTable */}
      <DataTable<ValetStaff>
        columns={columns}
        data={filteredStaff}
        keyExtractor={(staff) => staff.id}
        pageSize={8}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search staff by name, phone, location, address, ID proof number..."
        searchFilterKeys={['name', 'phone', 'location', 'address', 'idProofNumber', 'idProofType', 'id', 'staffId']}
        emptyMessage={
          <div className="py-8 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No valet staff found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No attendants matched your current search and filter criteria. Try clearing some filters.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-3 py-1.5 bg-[#023526] text-white text-xs font-bold rounded-lg hover:bg-[#034834] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        }
        headerActions={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] focus:outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="All">All Statuses ({totalCount})</option>
                <option value="Available">Available Standby</option>
                <option value="On Duty">On Duty / Assigned</option>
                <option value="Assigned">Assigned to Event</option>
                <option value="Offline">Offline</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* ID Proof Type Dropdown */}
            {/* <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Proof:</span>
              <select
                value={proofTypeFilter}
                onChange={(e) => {
                  setProofTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] focus:outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="All">All ID Proofs</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
              </select>
            </div> */}

            {/* Blood Group Dropdown */}
            {/* <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Blood:</span>
              <select
                value={bloodGroupFilter}
                onChange={(e) => {
                  setBloodGroupFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] focus:outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="All">All Blood Groups</option>
                <option value="O+">O+ Positive</option>
                <option value="O-">O- Negative</option>
                <option value="A+">A+ Positive</option>
                <option value="A-">A- Negative</option>
                <option value="B+">B+ Positive</option>
                <option value="B-">B- Negative</option>
                <option value="AB+">AB+ Positive</option>
                <option value="AB-">AB- Negative</option>
              </select>
            </div> */}

            {/* Hub / Location Dropdown */}
            {/* {uniqueLocations.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Hub:</span>
                <select
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] focus:outline-none transition-all shadow-2xs cursor-pointer max-w-[150px] truncate"
                >
                  <option value="All">All Base Hubs</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            )} */}

            {/* Reset Button */}
            {/* {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Reset all search filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )} */}

            <button
              type="button"
              onClick={() =>
                fetchStaff({
                  page: currentPage,
                  limit: 50,
                  search: debouncedSearch.trim() || undefined,
                  status: statusFilter !== 'All' ? statusFilter : undefined,
                  proofType: proofTypeFilter !== 'All' ? proofTypeFilter : undefined,
                  bloodGroup: bloodGroupFilter !== 'All' ? bloodGroupFilter : undefined,
                  location: locationFilter !== 'All' ? locationFilter : undefined,
                })
              }
              disabled={isLoading}
              className="p-2 border border-slate-200 hover:border-[#023526] hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh Staff Roster"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#023526]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#023526] hover:bg-[#034834] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Valet Staff</span>
            </button>
          </div>
        }
      />

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
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={createFormData.phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '');
                      const digits = (cleaned.startsWith('91') && cleaned.length > 10 ? cleaned.slice(2) : cleaned).slice(0, 10);
                      setCreateFormData({ ...createFormData, phone: digits });
                    }}
                    className={`w-full text-xs bg-white border rounded-xl px-3 py-2 pr-12 text-slate-800 focus:outline-none focus:ring-2 transition-all shadow-2xs ${
                      createFormData.phone.length > 0 && createFormData.phone.length < 10
                        ? 'border-amber-400 focus:ring-amber-200 focus:border-amber-500'
                        : createFormData.phone.length === 10 && /^[6-9]/.test(createFormData.phone)
                        ? 'border-emerald-400 focus:ring-emerald-200 focus:border-emerald-500'
                        : createFormData.phone.length === 10 && !/^[6-9]/.test(createFormData.phone)
                        ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-[#023526]/20 focus:border-[#023526]'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 select-none">
                    {createFormData.phone.length}/10
                  </span>
                </div>
                {createFormData.phone.length > 0 && createFormData.phone.length < 10 && (
                  <p className="text-[10px] text-amber-600 font-medium mt-1">
                    Enter 10-digit mobile number ({10 - createFormData.phone.length} more digits needed)
                  </p>
                )}
                {createFormData.phone.length === 10 && !/^[6-9]/.test(createFormData.phone) && (
                  <p className="text-[10px] text-rose-500 font-medium mt-1">
                    Mobile number must start with 6, 7, 8, or 9
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="suresh.k@valet.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value.trim() })}
                  className={`w-full text-xs bg-white border rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 transition-all shadow-2xs ${
                    createFormData.email.trim().length > 0 &&
                    !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(createFormData.email.trim())
                      ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                      : createFormData.email.trim().length > 0 &&
                        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(createFormData.email.trim())
                      ? 'border-emerald-400 focus:ring-emerald-200 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-[#023526]/20 focus:border-[#023526]'
                  }`}
                />
                {createFormData.email.trim().length > 0 &&
                  !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(createFormData.email.trim()) && (
                    <p className="text-[10px] text-rose-500 font-medium mt-1">
                      Please enter a valid email address (e.g. name@domain.com)
                    </p>
                  )}
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#023526] hover:bg-[#034834] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying & Saving...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Verify & Register Staff</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
