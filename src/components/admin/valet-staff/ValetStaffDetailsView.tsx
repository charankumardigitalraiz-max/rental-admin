'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import { useValetStaffStore, mapBackendValetStaff } from '@/store/useValetStaffStore';
import { mapBackendValetBooking } from '@/store/useValetBookingStore';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import DataTable, { Column } from '@/components/ui/DataTable';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  Clock,
  Eye,
  ZoomIn,
  Building2,
  Briefcase,
  CreditCard,
  FileCheck,
  HeartPulse,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  Upload,
  X,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { ValetStaff, ValetBooking } from '@/types';

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
        placeholder: 'e.g. WBD1234567',
        maxLength: 12,
        hint: 'Enter Electoral Photo Identity Card number',
      };
    case 'Driving License':
      return {
        label: 'Driving License (DL) Number',
        placeholder: 'e.g. KA-03-20220008899',
        maxLength: 20,
        hint: 'Enter state transport issued DL number',
      };
    case 'Passport':
      return {
        label: 'Indian Passport Number',
        placeholder: 'e.g. A1234567',
        maxLength: 9,
        hint: 'Enter 8-character passport document number',
      };
    default:
      return {
        label: 'Government ID Proof Number',
        placeholder: 'Enter official document number',
        maxLength: 25,
        hint: 'Official identity document number',
      };
  }
};

interface ValetStaffDetailsViewProps {
  staffId?: string;
}

export default function ValetStaffDetailsView({ staffId }: ValetStaffDetailsViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { valetBookings, selectedValetStaffId } = useRentalStore();
  const {
    staffList,
    updateStaffStatus,
    deleteStaff,
  } = useValetStaffStore();

  const activeStaffId = staffId || selectedValetStaffId;

  const [staff, setStaff] = useState<ValetStaff | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Bookings pagination and search state
  const [bookingPage, setBookingPage] = useState<number>(1);
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [debouncedBookingSearch, setDebouncedBookingSearch] = useState<string>('');
  const [releaseBookingTarget, setReleaseBookingTarget] = useState<ValetBooking | null>(null);
  const [isReleasingBooking, setIsReleasingBooking] = useState<boolean>(false);

  // Modals state
  const [selectedDocImage, setSelectedDocImage] = useState<{ title: string; url: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Edit form state with dynamic ID Proof fields and file uploads
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    bloodGroup: 'O+',
    address: '',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    idProofFrontImage: '',
    idProofBackImage: '',
  });
  const [editFrontFile, setEditFrontFile] = useState<File | null>(null);
  const [editBackFile, setEditBackFile] = useState<File | null>(null);

  // Columns definition for the global DataTable
  const bookingColumns: Column<ValetBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      className: 'min-w-[120px]',
      render: (b) => (
        <span className="font-mono font-bold text-slate-900">
          {b.bookingNumber || b.id}
        </span>
      ),
    },
    {
      key: 'eventName',
      header: 'Event Name & Venue',
      className: 'min-w-[200px]',
      render: (b) => (
        <div>
          <span className="font-bold text-slate-900 block">{b.eventName}</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            {b.venue}
          </span>
        </div>
      ),
    },
    {
      key: 'eventDate',
      header: 'Date & Hours',
      className: 'min-w-[150px]',
      render: (b) => (
        <div className="text-slate-600 text-[11px]">
          <div className="font-semibold text-slate-800">{b.eventDate}</div>
          <div className="text-[10px] text-slate-400">
            {b.startTime} - {b.endTime} ({b.durationHours}h)
          </div>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Client / Customer',
      className: 'min-w-[150px]',
      render: (b) => (
        <div>
          <span className="font-bold text-slate-900 block">{b.customerName}</span>
          <span className="text-[10px] text-slate-400 font-mono">{b.customerPhone}</span>
        </div>
      ),
    },
    {
      key: 'teamSize',
      header: 'Team Size',
      className: 'min-w-[140px]',
      render: (b) => (
        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {b.assignedStaffIds?.length || 1} / {b.requiredStaffCount} Attendants
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Booking Status',
      className: 'min-w-[130px]',
      render: (b) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${b.status === 'Completed'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : b.status === 'In Progress'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-sky-50 text-sky-800 border border-sky-200'
            }`}
        >
          {b.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      className: 'min-w-[140px]',
      render: (b) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/admin/valet-bookings/${b.id}`}
            className="px-2.5 py-1 bg-slate-100 hover:bg-[#023526] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
            title="View Event Details"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </Link>
          {/* {['In Progress', 'Fully Assigned', 'Partially Assigned'].includes(b.status) && (
            <button
              type="button"
              onClick={() => setReleaseBookingTarget(b)}
              className="px-2 py-1 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 border border-amber-200 cursor-pointer shadow-2xs"
              title="Release attendant from this booking"
            >
              <UserMinus className="w-3 h-3" />
              <span>Release</span>
            </button>
          )} */}
        </div>
      ),
    },
  ];

  // Fetch or find staff data with server-side bookings pagination and search
  const loadStaffDetails = async (
    page = bookingPage,
    search = debouncedBookingSearch,
    filterStatus = statusFilter
  ) => {
    if (!activeStaffId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // First attempt to find in store for instant response
    const foundInStore = staffList.find((s) => s.id === activeStaffId);
    if (foundInStore) {
      setStaff(foundInStore);
      setEditFormData({
        name: foundInStore.name,
        phone: foundInStore.phone,
        email: foundInStore.email,
        address: foundInStore.address || '',
        bloodGroup: foundInStore.bloodGroup || 'O+',
        idProofType: foundInStore.idProofType || 'Aadhaar Card',
        idProofNumber: foundInStore.idProofNumber || foundInStore.aadhaarNumber || '',
        idProofFrontImage: foundInStore.idProofFrontImage || foundInStore.idProofImage || foundInStore.aadhaarCardImage || foundInStore.aadhaarCardFront || '',
        idProofBackImage: foundInStore.idProofBackImage || foundInStore.aadhaarCardBack || '',
      });
    }

    // Always fetch fresh details with search, filter, and pagination
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '5',
      });
      if (search.trim()) params.set('search', search.trim());
      if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/admin/valet-staff/${encodeURIComponent(activeStaffId)}?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        const mapped = mapBackendValetStaff(json.data);
        setStaff(mapped);
        setEditFormData({
          name: mapped.name,
          phone: mapped.phone,
          email: mapped.email,
          address: mapped.address || '',
          bloodGroup: mapped.bloodGroup || 'O+',
          idProofType: mapped.idProofType || 'Aadhaar Card',
          idProofNumber: mapped.idProofNumber || mapped.aadhaarNumber || '',
          idProofFrontImage: mapped.idProofFrontImage || mapped.idProofImage || mapped.aadhaarCardImage || mapped.aadhaarCardFront || '',
          idProofBackImage: mapped.idProofBackImage || mapped.aadhaarCardBack || '',
        });
      }
    } catch (e) {
      console.error('Failed to load valet staff from API:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Search input debouncing (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBookingSearch(bookingSearch);
      setBookingPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [bookingSearch]);

  useEffect(() => {
    loadStaffDetails(bookingPage, debouncedBookingSearch, statusFilter);
  }, [activeStaffId, bookingPage, debouncedBookingSearch, statusFilter]);

  // Open Edit Modal and sync current staff data
  const openEditModal = () => {
    if (staff) {
      setEditFormData({
        name: staff.name || '',
        phone: staff.phone || '',
        email: staff.email || '',
        address: staff.address || '',
        bloodGroup: staff.bloodGroup || 'O+',
        idProofType: staff.idProofType || 'Aadhaar Card',
        idProofNumber: staff.idProofNumber || staff.aadhaarNumber || '',
        idProofFrontImage: staff.idProofFrontImage || staff.idProofImage || staff.aadhaarCardImage || staff.aadhaarCardFront || '',
        idProofBackImage: staff.idProofBackImage || staff.aadhaarCardBack || '',
      });
      setEditFrontFile(null);
      setEditBackFile(null);
    }
    setIsEditModalOpen(true);
  };

  // Upload handler for edit modal front image
  const handleEditFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('File Too Large', 'Please upload an image smaller than 5MB');
        return;
      }
      setEditFrontFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData((prev) => ({
          ...prev,
          idProofFrontImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload handler for edit modal back image
  const handleEditBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('File Too Large', 'Please upload an image smaller than 5MB');
        return;
      }
      setEditBackFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData((prev) => ({
          ...prev,
          idProofBackImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle status update
  const handleStatusChange = async (newStatus: ValetStaff['status']) => {
    if (!staff) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updateStaffStatus(staff.id, newStatus);
      if (res.success) {
        setStaff((prev) => (prev ? { ...prev, status: newStatus } : null));
        toast.success('Status Updated', `Staff status set to "${newStatus}"`);
      } else {
        toast.error('Update Failed', res.error || 'Could not update status');
      }
    } catch {
      toast.error('Error', 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle save edited profile with dynamic ID proof & image upload support
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;

    if (!editFormData.name.trim()) {
      toast.warning('Full Name Required', 'Please enter the staff member’s full name');
      return;
    }

    const cleanPhone = editFormData.phone.replace(/\D/g, '').replace(/^91/, '');
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

    if (editFormData.email.trim() && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(editFormData.email.trim())) {
      toast.warning('Invalid Email Address', 'Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    if (!editFormData.address.trim()) {
      toast.warning('Address Required', 'Please enter the residential address of the staff member');
      return;
    }

    if (!editFormData.idProofNumber.trim()) {
      toast.warning(
        `${editFormData.idProofType} Number Required`,
        `Please enter the ${editFormData.idProofType} number for verification`
      );
      return;
    }

    if (!editFormData.idProofFrontImage.trim() && !editFrontFile) {
      toast.warning(
        'Front ID Image Required',
        `Please upload the front side image of the ${editFormData.idProofType}`
      );
      return;
    }

    setIsSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name.trim());
      formData.append('phone', editFormData.phone.trim());
      if (editFormData.email.trim()) formData.append('email', editFormData.email.trim());
      formData.append('address', editFormData.address.trim());
      formData.append('location', editFormData.address.trim());
      formData.append('proofType', editFormData.idProofType);
      formData.append('identityNumber', editFormData.idProofNumber.trim());
      formData.append('bloodGroup', editFormData.bloodGroup || 'O+');

      if (editFrontFile) {
        formData.append('proofImage', editFrontFile);
      } else if (editFormData.idProofFrontImage) {
        formData.append('proofImage', editFormData.idProofFrontImage);
      }

      if (editBackFile) {
        formData.append('proofImageBack', editBackFile);
      } else if (editFormData.idProofBackImage) {
        formData.append('proofImageBack', editFormData.idProofBackImage);
      }

      const res = await fetch(`/api/admin/valet-staff/${encodeURIComponent(staff.id)}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Profile Updated', 'Valet staff details saved successfully');
        setIsEditModalOpen(false);
        setEditFrontFile(null);
        setEditBackFile(null);
        loadStaffDetails();
      } else {
        toast.error('Update Failed', data.error || 'Failed to save changes');
      }
    } catch {
      toast.error('Error', 'An unexpected error occurred while saving');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle delete staff
  const handleDeleteConfirm = async () => {
    if (!staff) return;
    setIsDeleting(true);
    try {
      const res = await deleteStaff(staff.id);
      if (res.success) {
        toast.success('Staff Deleted', 'Valet staff record has been removed');
        setIsDeleteModalOpen(false);
        router.push('/admin/valet-staff');
      } else {
        toast.error('Delete Failed', res.error || 'Could not delete staff member');
      }
    } catch {
      toast.error('Error', 'Failed to delete staff member');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle release attendant from booking
  const handleConfirmReleaseBooking = async () => {
    if (!staff || !releaseBookingTarget) return;
    setIsReleasingBooking(true);
    try {
      const res = await fetch(`/api/admin/valet-staff/${encodeURIComponent(staff.id)}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: releaseBookingTarget.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          'Attendant Released',
          `${staff.name} has been successfully released from ${releaseBookingTarget.eventName || releaseBookingTarget.bookingNumber}`
        );
        setReleaseBookingTarget(null);
        loadStaffDetails(bookingPage, debouncedBookingSearch, statusFilter);
      } else {
        toast.error('Release Failed', data.error || 'Could not release attendant from booking');
      }
    } catch {
      toast.error('Error', 'An unexpected error occurred while releasing attendant');
    } finally {
      setIsReleasingBooking(false);
    }
  };

  // Clipboard helper
  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading && !staff) {
    return (
      <div className="card-white p-16 text-center max-w-lg mx-auto my-12 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#023526] mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-800">Loading Valet Profile...</h3>
          <p className="text-xs text-slate-400 mt-1">Retrieving staff record and document proofs</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="card-white p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <div>
          <h3 className="text-lg font-bold text-slate-900">Valet Staff Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Could not locate staff profile with ID: <span className="font-mono font-semibold">{activeStaffId}</span>
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/valet-staff')}
          className="px-4 py-2 bg-[#023526] hover:bg-[#034431] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Valet Staff Roster
        </button>
      </div>
    );
  }

  // Related valet bookings for this staff (paginated and filtered from server)
  const staffBookings: ValetBooking[] =
    staff.bookings && staff.bookings.length > 0
      ? staff.bookings.map(mapBackendValetBooking)
      : [];

  const filteredBookings = staffBookings;

  const frontDoc = staff.idProofFrontImage || staff.idProofImage || staff.aadhaarCardFront || staff.aadhaarCardImage;
  const backDoc = staff.idProofBackImage || staff.aadhaarCardBack;
  const editIdConfig = getIdProofConfig(editFormData.idProofType);

  return (
    <div className="space-y-5 pb-14 max-w-7xl mx-auto">
      {/* 1. TOP HEADER NAVIGATION & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/valet-staff')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" /> Back to Staff Roster
          </button>
          <div className="h-4 w-px bg-slate-300 hidden sm:block" />
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            ID: {staff?.staffId}
          </span>
        </div>

        {/* Quick Status Control, Edit & Delete Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          {/* <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 pl-2">Status:</span>
            <select
              value={staff.status}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as ValetStaff['status'])}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526] cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="On Duty">On Duty</option>
              <option value="Offline">Offline</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div> */}

          <button
            type="button"
            onClick={openEditModal}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2. PROFILE HERO BANNER */}
      <div className="card-white p-6 bg-gradient-to-r from-emerald-950 via-[#023526] to-slate-900 text-white rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/5 to-transparent pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar and Primary Details */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center ${staff.status === 'Available'
                  ? 'bg-emerald-500'
                  : staff.status === 'On Duty'
                    ? 'bg-amber-400'
                    : staff.status === 'Assigned'
                      ? 'bg-sky-400'
                      : 'bg-slate-400'
                  }`}
                title={`Status: ${staff.status}`}
              >
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{staff.name}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${staff.status === 'Available'
                    ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                    : staff.status === 'On Duty'
                      ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                      : staff.status === 'Assigned'
                        ? 'bg-sky-400/20 text-sky-200 border border-sky-400/30'
                        : 'bg-slate-700/60 text-slate-300 border border-slate-600'
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${staff.status === 'Available' || staff.status === 'On Duty' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                      }`}
                  />
                  {staff.status}
                </span>
                <span className="bg-emerald-900/60 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-emerald-700/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> KYC Verified
                </span>
              </div>

              {/* Contact and Location Chips */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 pt-1">
                <a
                  href={`tel:${staff.phone}`}
                  className="flex items-center gap-1.5 font-semibold hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>{staff.phone}</span>
                </a>

                {staff.email && (
                  <a
                    href={`mailto:${staff.email}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>{staff.email}</span>
                  </a>
                )}

                <span className="flex items-center gap-1.5 font-medium text-emerald-200/90">
                  <MapPin className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>{staff.location || 'Bengaluru Central Hub'}</span>
                </span>
              </div>

              {/* Extra badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-0.5 rounded-md text-emerald-200 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-[#c5a880]" /> {staff.experienceYears} Years Valet Experience
                </span>
                {staff.bloodGroup && (
                  <span className="text-[11px] font-bold bg-rose-500/20 text-rose-200 px-2.5 py-0.5 rounded-md border border-rose-500/30 flex items-center gap-1">
                    <HeartPulse className="w-3 h-3 text-rose-400" /> Blood Group: {staff.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rating and Quick Summary Pill */}
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <span className="text-base font-black text-white leading-none block">{staff.rating}</span>
                <span className="text-[10px] text-emerald-200/80 uppercase font-semibold">Attendant Rating</span>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                Deployment Capability
              </span>
              <span className="text-xs font-semibold text-white">Manual & Automatic Luxury Vehicles</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOUR METRIC STAT CARDS */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-white p-4.5 space-y-1 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Total Events Handled
            </span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{staff.assignedEventsCount}</h3>
          <p className="text-[11px] text-slate-500">Valet events & functions assigned</p>
        </div>

        <div className="card-white p-4.5 space-y-1 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Lifetime Earnings
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            ₹{staff.earnings.total.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold">Accumulated revenue earned</p>
        </div>

        <div className="card-white p-4.5 space-y-1 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Paid Out
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">
            ₹{staff.earnings.paid.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500">Settled to attendant's bank</p>
        </div>

        <div className="card-white p-4.5 space-y-1 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Pending Payout
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-amber-700 mt-1">
            ₹{staff.earnings.pending.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold">Awaiting scheduled settlement</p>
        </div>
      </div> */}

      {/* 4. CURRENT ACTIVE DUTY ASSIGNMENT */}
      <div className="card-white p-5 space-y-3.5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CalendarCheck className="w-4.5 h-4.5 text-[#023526]" /> Current Active Duty Assignment
          </h3>
          {staff.currentAssignment ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Active Deployment
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Standby / Idle
            </span>
          )}
        </div>

        {staff.currentAssignment ? (
          <div className="p-4 bg-gradient-to-r from-emerald-950 to-[#023526] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880]">
                  Assigned Booking Ref:
                </span>
                <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded font-bold">
                  {staff.currentAssignment.bookingId}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{staff.currentAssignment.eventName}</h4>
              <p className="text-xs text-emerald-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>{staff.currentAssignment.venue}</span>
              </p>
            </div>

            <Link
              href={`/admin/valet-bookings/${staff.currentAssignment.bookingId}`}
              className="px-4 py-2 bg-[#c5a880] hover:bg-[#d6bb95] text-slate-900 text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <span>View Event Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-1.5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Ready for Immediate Allocation</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              This staff member is verified, active, and available to be dispatched to upcoming hotel, wedding, or corporate event bookings.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/valet-bookings"
                className="text-xs font-bold text-[#023526] hover:underline inline-flex items-center gap-1"
              >
                <span>Browse Pending Event Requests</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 5. TWO-COLUMN GRID: KYC DOCUMENTS & RESIDENTIAL/CONTACT PROFILE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Government ID & License Verification */}
        <div className="lg:col-span-2 card-white p-5 space-y-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#023526]" /> Official Identity Verification & Document Proofs
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> KYC Verified
            </span>
          </div>

          {/* Proof Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {staff.idProofType || 'Aadhaar Card'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      staff.idProofNumber || staff.aadhaarNumber || '',
                      'idNum'
                    )
                  }
                  className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  title="Copy ID Number"
                >
                  {copiedField === 'idNum' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {staff.idProofNumber || staff.aadhaarNumber || 'Not provided'}
              </p>
              <p className="text-[10px] text-slate-400">Primary government document</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Driving License (DL) Number
              </span>
              <p className="font-mono font-bold text-slate-900 text-sm uppercase">
                {staff.drivingLicenseNumber || 'KA-01-20190008472'}
              </p>
              <p className="text-[10px] text-slate-400">Approved for commercial & personal cars</p>
            </div>
          </div>

          {/* ID Proof Front & Back Photos with Full Preview */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#023526]" />{' '}
                {staff.idProofType || 'Aadhaar Card'} Uploaded Images
              </span>
              <span className="text-[10px] text-slate-400">Click any document image to inspect in full HD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Front Side */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Front Side Document
                </span>
                {frontDoc ? (
                  <div
                    onClick={() =>
                      setSelectedDocImage({
                        title: `${staff.name} - ${staff.idProofType || 'ID Proof'} (Front)`,
                        url: frontDoc,
                      })
                    }
                    className="relative h-44 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 group cursor-pointer shadow-2xs hover:border-[#023526] transition-all"
                  >
                    <img
                      src={frontDoc}
                      alt="Front Document"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[1px]">
                      <ZoomIn className="w-4 h-4" /> Inspect High-Res
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                    Physical copy verified by management during onboarding
                  </div>
                )}
              </div>

              {/* Back Side */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Back Side Document
                </span>
                {backDoc ? (
                  <div
                    onClick={() =>
                      setSelectedDocImage({
                        title: `${staff.name} - ${staff.idProofType || 'ID Proof'} (Back)`,
                        url: backDoc,
                      })
                    }
                    className="relative h-44 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 group cursor-pointer shadow-2xs hover:border-[#023526] transition-all"
                  >
                    <img
                      src={backDoc}
                      alt="Back Document"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[1px]">
                      <ZoomIn className="w-4 h-4" /> Inspect High-Res
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                    Single-sided ID card or physically verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Address, Emergency & Medical Info */}
        <div className="card-white p-5 space-y-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#023526]" /> Station & Personal Details
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Full Address */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Full Residential Address
                </span>
                <p className="font-medium text-slate-800 leading-relaxed text-xs">
                  {staff.address || `${staff.location || 'Bengaluru Central'}, Karnataka, India`}
                </p>
              </div>

              {/* Station Hub */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Assigned Base Station / Hub
                </span>
                <p className="font-bold text-slate-900">
                  {staff.location || 'Bengaluru Central Operations Depot'}
                </p>
              </div>

              {/* Emergency Contact */}
              {/* <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-600" /> Emergency Contact
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  {staff.emergencyContact || '+91 98800 11223 (Family / Next of Kin)'}
                </p>
              </div> */}

              {/* Blood Group */}
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 space-y-1">
                <span className="text-[10px] font-bold text-rose-700 uppercase flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-rose-500" /> Blood Group
                </span>
                <p className="font-bold text-rose-900 text-xs">
                  {staff.bloodGroup || 'O+'} (Rh Positive)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={openEditModal}
              className="w-full py-2 bg-slate-100 hover:bg-[#023526] hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Staff Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. EVENT DEPLOYMENTS & VALET BOOKINGS HISTORY TABLE (GLOBAL DATA TABLE) */}
      <DataTable<ValetBooking>
        columns={bookingColumns}
        data={filteredBookings}
        keyExtractor={(b) => b.id}
        pageSize={5}
        searchPlaceholder="Search event name, venue, customer, booking ref..."
        searchValue={bookingSearch}
        onSearchChange={(val) => {
          setBookingSearch(val);
        }}
        serverPagination={
          staff?.bookingsPagination
            ? {
              currentPage: bookingPage,
              totalPages: staff.bookingsPagination.totalPages,
              totalItems: staff.bookingsPagination.total,
              onPageChange: (newPage) => setBookingPage(newPage),
            }
            : undefined
        }
        emptyMessage="No event deployment records found for this staff member."
        headerActions={
          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end w-full">
            {/* <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mr-auto">
              <Calendar className="w-4 h-4 text-[#023526]" /> Event History (
              {staff?.bookingsPagination?.total ?? filteredBookings.length})
            </h3> */}
            {/* <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setBookingPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${statusFilter === 'all'
                  ? 'bg-[#023526] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                All ({staff?.bookingCounts?.all ?? staff?.assignedEventsCount ?? filteredBookings.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('active');
                  setBookingPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${statusFilter === 'active'
                  ? 'bg-[#023526] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Active ({staff?.bookingCounts?.active ?? 0})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('completed');
                  setBookingPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${statusFilter === 'completed'
                  ? 'bg-[#023526] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Completed ({staff?.bookingCounts?.completed ?? 0})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('cancelled');
                  setBookingPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${statusFilter === 'cancelled'
                  ? 'bg-[#023526] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Cancelled ({staff?.bookingCounts?.cancelled ?? 0})
              </button>
            </div> */}
          </div>
        }
      />

      {/* 7. HIGH-RESOLUTION DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={!!selectedDocImage}
        onClose={() => setSelectedDocImage(null)}
        title={selectedDocImage?.title || 'Identity Verification Document Preview'}
        subtitle="High-resolution document review for administrator verification"
        icon={ShieldCheck}
        maxWidth="3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">Admin Document Inspection Mode</span>
            <div className="flex items-center gap-2">
              {selectedDocImage?.url && (
                <a
                  href={selectedDocImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedDocImage(null)}
                className="px-4 py-1.5 bg-[#023526] text-white text-xs font-bold rounded-xl hover:bg-[#034431] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        }
      >
        <div className="p-2 space-y-3">
          <div className="max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 flex items-center justify-center p-2 shadow-inner">
            <img
              src={selectedDocImage?.url}
              alt={selectedDocImage?.title}
              className="max-w-full max-h-[65vh] object-contain rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* 8. EDIT VALET STAFF MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Valet Staff Profile"
        subtitle={`Update details, address & government ID proof for ${staff.name}`}
        icon={Edit}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 p-1">
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
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
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
                    value={editFormData.phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '');
                      const digits = (cleaned.startsWith('91') && cleaned.length > 10 ? cleaned.slice(2) : cleaned).slice(0, 10);
                      setEditFormData({ ...editFormData, phone: digits });
                    }}
                    className={`w-full text-xs bg-white border rounded-xl px-3 py-2 pr-12 text-slate-800 focus:outline-none focus:ring-2 transition-all shadow-2xs ${editFormData.phone.length > 0 && editFormData.phone.length < 10
                        ? 'border-amber-400 focus:ring-amber-200 focus:border-amber-500'
                        : editFormData.phone.length === 10 && /^[6-9]/.test(editFormData.phone)
                          ? 'border-emerald-400 focus:ring-emerald-200 focus:border-emerald-500'
                          : editFormData.phone.length === 10 && !/^[6-9]/.test(editFormData.phone)
                            ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                            : 'border-slate-200 focus:ring-[#023526]/20 focus:border-[#023526]'
                      }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 select-none">
                    {editFormData.phone.length}/10
                  </span>
                </div>
                {editFormData.phone.length > 0 && editFormData.phone.length < 10 && (
                  <p className="text-[10px] text-amber-600 font-medium mt-1">
                    Enter 10-digit mobile number ({10 - editFormData.phone.length} more digits needed)
                  </p>
                )}
                {editFormData.phone.length === 10 && !/^[6-9]/.test(editFormData.phone) && (
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
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value.trim() })}
                  className={`w-full text-xs bg-white border rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 transition-all shadow-2xs ${editFormData.email.trim().length > 0 &&
                      !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(editFormData.email.trim())
                      ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                      : editFormData.email.trim().length > 0 &&
                        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(editFormData.email.trim())
                        ? 'border-emerald-400 focus:ring-emerald-200 focus:border-emerald-500'
                        : 'border-slate-200 focus:ring-[#023526]/20 focus:border-[#023526]'
                    }`}
                />
                {editFormData.email.trim().length > 0 &&
                  !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(editFormData.email.trim()) && (
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
                  value={editFormData.bloodGroup}
                  onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
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
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
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
                  value={editFormData.idProofType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setEditFormData((prev) => ({
                      ...prev,
                      idProofType: newType,
                      idProofNumber: '',
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editIdConfig.label} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={editIdConfig.maxLength}
                    placeholder={editIdConfig.placeholder}
                    value={editFormData.idProofNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        idProofNumber:
                          editFormData.idProofType === 'PAN Card' ||
                            editFormData.idProofType === 'Driving License' ||
                            editFormData.idProofType === 'Voter ID'
                            ? e.target.value.toUpperCase()
                            : e.target.value,
                      })
                    }
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 font-mono uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#023526]/20 focus:border-[#023526] transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic ID Proof Document Image Uploads (Front & Back) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  {editFormData.idProofType} Uploads (Front & Back Side) <span className="text-rose-500">*</span>
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
                    {editFormData.idProofFrontImage && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Attached
                      </span>
                    )}
                  </div>

                  {!editFormData.idProofFrontImage ? (
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
                        onChange={handleEditFrontUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-2.5 shadow-2xs">
                      <img
                        src={editFormData.idProofFrontImage}
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
                        onClick={() => {
                          setEditFormData((prev) => ({ ...prev, idProofFrontImage: '' }));
                          setEditFrontFile(null);
                        }}
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
                    {editFormData.idProofBackImage && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Attached
                      </span>
                    )}
                  </div>

                  {!editFormData.idProofBackImage ? (
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
                        onChange={handleEditBackUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-2.5 shadow-2xs">
                      <img
                        src={editFormData.idProofBackImage}
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
                        onClick={() => {
                          setEditFormData((prev) => ({ ...prev, idProofBackImage: '' }));
                          setEditBackFile(null);
                        }}
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
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingEdit}
              className="px-5 py-2 bg-[#023526] hover:bg-[#034834] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Edit className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* 9. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Valet Staff"
        subtitle="Permanent removal from staff roster"
        icon={AlertTriangle}
        maxWidth="md"
      >
        <div className="p-2 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete valet staff member{' '}
            <strong className="text-slate-900 font-bold">{staff.name}</strong> (
            <span className="font-mono text-slate-700">{staff.id}</span>)? This action will remove
            all their identity proofs and historical logs from the system.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* 10. RELEASE ATTENDANT CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(releaseBookingTarget)}
        onClose={() => setReleaseBookingTarget(null)}
        title="Release Attendant from Booking"
        subtitle="Unassign staff member from this event"
        icon={UserMinus}
        maxWidth="md"
      >
        <div className="p-2 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to release <strong className="text-slate-900 font-bold">{staff.name}</strong> from event booking{' '}
            <strong className="text-slate-900 font-bold">{releaseBookingTarget?.eventName}</strong> (
            <span className="font-mono text-slate-700">{releaseBookingTarget?.bookingNumber}</span>)?
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs space-y-1">
            <p className="font-bold">What happens next:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-700">
              <li>The attendant will be removed from this event's allocated roster.</li>
              <li>The booking assignment status will adjust automatically.</li>
              <li>If the attendant has no other active bookings, their status will become available.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReleaseBookingTarget(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isReleasingBooking}
              onClick={handleConfirmReleaseBooking}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isReleasingBooking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Releasing...</span>
                </>
              ) : (
                <>
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Confirm Release</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
