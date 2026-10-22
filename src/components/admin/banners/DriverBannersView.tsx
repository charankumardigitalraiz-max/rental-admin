'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
  X,
  Sparkles,
  LayoutGrid,
  Layers,
  Ruler,
  Smartphone,
} from 'lucide-react';
import { BannerItem, UserBannerSection } from '@/types';
import { useBannerStore } from '@/store/useBannerStore';
import { useToast } from '@/context/ToastContext';

export default function DriverBannersView() {
  const { toast } = useToast();
  const {
    banners,
    isLoading,
    isUploading,
    isSaving,
    selectedBannerForEdit,
    closeEditModal,
    openEditModal,
    fetchBanners,
    uploadMultipleImages,
    addSingleBannerUrl,
    updateBanner,
    deleteBanner,
    toggleActive,
    moveOrder,
  } = useBannerStore();

  // Primary Tabs:
  // Tab 1: "Intro banner" (Driver Onboarding walkthrough)
  // Tab 2: "Home banners" (Driver Homepage Hero Surge & Middle Benefits)
  const [activeMainTab, setActiveMainTab] = useState<'intro' | 'home'>('intro');

  // Sub-tab for Home Screen (Top Hero vs Middle Section)
  const [homeSubTab, setHomeSubTab] = useState<'home_hero' | 'home_middle'>('home_hero');

  // Active section currently selected
  const activeSection: UserBannerSection =
    activeMainTab === 'intro' ? 'intro_screen' : homeSubTab;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Delete modal state
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);

  // Quick Add via URL modal state
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlForm, setUrlForm] = useState({ imageUrl: '', title: '', subtitle: '', actionUrl: '' });

  // Edit modal state
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', actionUrl: '', isActive: true });

  useEffect(() => {
    // Explicitly fetch Driver App banners
    fetchBanners('driver');
  }, [fetchBanners]);

  useEffect(() => {
    if (selectedBannerForEdit) {
      setEditForm({
        title: selectedBannerForEdit.title || '',
        subtitle: selectedBannerForEdit.subtitle || '',
        actionUrl: selectedBannerForEdit.actionUrl || '',
        isActive: selectedBannerForEdit.isActive,
      });
    }
  }, [selectedBannerForEdit]);

  // Filter banners strictly for Driver App
  const driverBanners = banners.filter((b) => b.appType === 'driver');

  // Counts by section
  const introBanners = driverBanners
    .filter((b) => b.section === 'intro_screen')
    .sort((a, b) => a.order - b.order);

  const heroBanners = driverBanners
    .filter((b) => b.section === 'home_hero')
    .sort((a, b) => a.order - b.order);

  const middleBanners = driverBanners
    .filter((b) => b.section === 'home_middle')
    .sort((a, b) => a.order - b.order);

  const currentSectionBanners =
    activeSection === 'intro_screen'
      ? introBanners
      : activeSection === 'home_hero'
        ? heroBanners
        : middleBanners;

  // Handle files selected (strictly images only)
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

    // Validate images strictly
    const nonImages = filesArray.filter((f) => !f.type.startsWith('image/'));
    if (nonImages.length > 0) {
      toast.error(
        'Images Only Allowed',
        `File "${nonImages[0].name}" is not an image. Only PNG, JPG, JPEG, WEBP, and GIF formats are accepted.`
      );
      return;
    }

    const { success, count } = await uploadMultipleImages(activeSection, filesArray, 'driver');
    if (success) {
      toast.success(
        'Driver Banner Uploaded',
        `Added ${count} banner image${count > 1 ? 's' : ''} to Driver ${activeSection === 'intro_screen'
          ? 'Intro Screen'
          : activeSection === 'home_hero'
            ? 'Homepage Hero Surge'
            : 'Homepage Middle Feed'
        }.`
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBannerForEdit) return;

    const ok = await updateBanner(selectedBannerForEdit.id || selectedBannerForEdit._id!, editForm);
    if (ok) {
      toast.success('Updated', 'Driver banner details updated successfully.');
    }
  };

  const handleAddUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlForm.imageUrl.trim()) {
      toast.error('Validation', 'Please provide an image URL.');
      return;
    }

    const ok = await addSingleBannerUrl(
      activeSection,
      urlForm.imageUrl.trim(),
      urlForm.title.trim(),
      urlForm.subtitle.trim(),
      urlForm.actionUrl.trim(),
      'driver'
    );

    if (ok) {
      toast.success('Added', 'Driver banner image added successfully.');
      setIsUrlModalOpen(false);
      setUrlForm({ imageUrl: '', title: '', subtitle: '', actionUrl: '' });
    }
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    const ok = await deleteBanner(bannerToDelete.id || bannerToDelete._id!);
    if (ok) {
      toast.success('Deleted', 'Driver banner image removed.');
    }
    setBannerToDelete(null);
  };

  // Section titles, subtitles, and exact dimensions
  const sectionMeta = {
    intro_screen: {
      title: 'Driver Onboarding Slides',
      subtitle: 'Driver partner app introductory & registration walkthrough',
      desc: 'Driver onboarding walkthrough',
      sizeSpec: 'Width: 1000 px · Height: 667 px',
      shortSize: '1000 × 667 px',
      ratio: '3:2 / Landscape',
    },
    home_hero: {
      title: 'Driver Home Hero Surge',
      subtitle: 'Driver homepage hero carousel (Surge, peak bonus hours, hot zones)',
      desc: 'Driver home hero top carousel',
      sizeSpec: 'Width: 717 px · Height: 297 px',
      shortSize: '717 × 297 px',
      ratio: '~2.4:1 / Wide banner',
    },
    home_middle: {
      title: 'Driver Benefits & Safety',
      subtitle: 'Driver homepage promotional strip (Insurance, incentives, vehicle care)',
      desc: 'Driver home middle promo strip',
      sizeSpec: '300 × 300 px (up to 360 × 360 px)',
      shortSize: '300 × 300 px',
      ratio: '1:1 / Square',
    },
  }[activeSection];

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* SINGLE UNIFIED CARD FOR ENTIRE SCREEN */}
      <div className="card-white overflow-hidden shadow-2xs">
        {/* 1. CARD HEADER: SEGMENTED TABS */}
        {/* <div className="p-4 sm:p-5 border-b border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white">
          <div className="flex items-center gap-3 flex-wrap">
 
            <div className="inline-flex items-center bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 shadow-inner gap-1">
      
              <button
                type="button"
                onClick={() => setActiveMainTab('intro')}
                className={`group flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${activeMainTab === 'intro'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/[0.06]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
                  }`}
              >
                <Smartphone
                  className={`w-4 h-4 transition-colors ${activeMainTab === 'intro' ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                />
                <span>Intro banner</span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-full font-mono transition-colors ${activeMainTab === 'intro'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-stone-200/80 text-slate-600'
                    }`}
                >
                  {introBanners.length < 10 ? `0${introBanners.length}` : introBanners.length}
                </span>
              </button>

          
              <button
                type="button"
                onClick={() => setActiveMainTab('home')}
                className={`group flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${activeMainTab === 'home'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/[0.06]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
                  }`}
              >
                <LayoutGrid
                  className={`w-4 h-4 transition-colors ${activeMainTab === 'home' ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                />
                <span>Home banners</span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-full font-mono transition-colors ${activeMainTab === 'home'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-stone-200/80 text-slate-600'
                    }`}
                >
                  {heroBanners.length + middleBanners.length < 10
                    ? `0${heroBanners.length + middleBanners.length}`
                    : heroBanners.length + middleBanners.length}
                </span>
              </button>
            </div>
          </div>

    
          <div className="flex items-center gap-2.5 flex-wrap">

            {activeMainTab === 'home' && (
              <div className="inline-flex items-center bg-stone-100/90 p-1 rounded-xl border border-stone-200/80 shadow-2xs text-xs font-medium gap-1 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => setHomeSubTab('home_hero')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${homeSubTab === 'home_hero'
                    ? 'bg-[#0b2920] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
                    }`}
                >
                  <Layers className="w-3.5 h-3.5 opacity-80" />
                  <span>Top Hero</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${homeSubTab === 'home_hero' ? 'bg-white/20 text-white' : 'bg-stone-200 text-slate-600'
                      }`}
                  >
                    {heroBanners.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setHomeSubTab('home_middle')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${homeSubTab === 'home_middle'
                    ? 'bg-[#0b2920] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5 opacity-80" />
                  <span>Middle Feed</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${homeSubTab === 'home_middle' ? 'bg-white/20 text-white' : 'bg-stone-200 text-slate-600'
                      }`}
                  >
                    {middleBanners.length}
                  </span>
                </button>
              </div>
            )}

        
            <button
              type="button"
              onClick={() => fetchBanners('driver')}
              className="p-1.5 text-slate-500 hover:text-slate-900 bg-stone-50 hover:bg-stone-100 border border-stone-200/90 rounded-lg transition-colors cursor-pointer"
              title="Refresh / Sync Driver Banners"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div> */}

        {/* 2. CARD BODY: TWO-COLUMN MAIN CONTENT: LEFT (UPLOAD DROPZONE) & RIGHT (QUEUE) */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT COLUMN: UPLOAD DROPZONE (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Hidden Input strictly for images */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              {/* LARGE DASHED DROP AREA */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all my-3 flex flex-col items-center justify-center ${isDragOver
                  ? 'border-amber-600 bg-amber-50/50 scale-[1.01]'
                  : 'border-stone-200 bg-stone-50/30 hover:bg-amber-50/20 hover:border-amber-700/60'
                  }`}
              >
                {/* Cloud Upload Icon Circle */}
                <div className="w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center text-slate-800 shadow-2xs mb-3">
                  <UploadCloud className="w-6 h-6 text-slate-700 stroke-[1.5]" />
                </div>

                {/* Required Size Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-3 shadow-2xs">
                  <Ruler className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>
                    Required Size: <strong className="font-mono text-amber-950">{sectionMeta.sizeSpec}</strong>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Drop driver banner images here
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  or choose files from your computer to upload directly to Driver App
                </p>

                {/* Solid Dark Green Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                  className="bg-[#0b2920] hover:bg-[#064233] text-white text-xs md:text-sm font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Uploading driver images...</span>
                    </>
                  ) : (
                    <span>Select images</span>
                  )}
                </button>

                <div className="mt-4 flex flex-col items-center gap-0.5">
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    📐 {sectionMeta.sizeSpec}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono tracking-wide">
                    JPG · PNG · WEBP · GIF · Max 10 MB
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 mt-2">
              <span>Target placement: <strong>{sectionMeta.desc}</strong></span>
              <span className="font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                📐 {sectionMeta.sizeSpec}
              </span>
              <span className="font-medium text-amber-800">Driver App API Sync</span>
            </div>
          </div>

          {/* RIGHT COLUMN: QUEUE LIST (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col border-t lg:border-t-0 lg:border-l border-stone-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Driver Queue</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-slate-600 font-mono">
                  {currentSectionBanners.length}
                </span>
              </h3>
              <span className="text-xs text-slate-400">Live on Driver App</span>
            </div>

            {/* Queue Items List (Max 3 visible at once, rest scrollable) */}
            <div className="space-y-3 overflow-y-auto max-h-[348px] pr-1.5 flex-1 [scrollbar-width:thin]">
              {currentSectionBanners.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-slate-400 mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span>No driver banner images in queue for this section.</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Use the upload box on the left to add slides.</span>
                </div>
              ) : (
                currentSectionBanners.map((banner) => {
                  const filename =
                    banner.imageUrl.split('/').pop() || banner.title || `driver-banner-${banner.order}.jpg`;

                  return (
                    <div
                      key={banner.id || banner._id}
                      className="bg-white rounded-xl p-3 border border-stone-200/80 hover:border-stone-300 transition-all flex items-center gap-3.5 relative shadow-2xs group"
                    >
                      {/* Thumbnail */}
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || filename}
                        className="w-32 sm:w-36 h-20 rounded-xl object-cover border border-stone-200/80 shrink-0 bg-slate-900"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80';
                        }}
                      />

                      {/* Metadata */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          Slide #{banner.order}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                          {banner.actionUrl ? `Action: ${banner.actionUrl}` : filename}
                        </p>

                        {/* Ready / Live Badge */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${banner.isActive
                              ? 'bg-[#e6f4ea] text-[#137333]'
                              : 'bg-stone-100 text-slate-500'
                              }`}
                          >
                            {banner.isActive ? (
                              <>
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Ready</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" />
                                <span>Hidden</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Direct Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBannerToDelete(banner);
                        }}
                        className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 border border-transparent hover:border-rose-100"
                        title="Delete image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. EDIT BANNER MODAL */}
      {selectedBannerForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Driver Banner Slide #{selectedBannerForEdit.order}
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Driver Action Route / Link (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /driver-incentives or /driver-safety"
                  value={editForm.actionUrl}
                  onChange={(e) => setEditForm({ ...editForm, actionUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b2920] focus:outline-none font-mono"
                />
                <span className="text-[10.5px] text-slate-400">Where the driver is redirected upon tapping this banner in the driver app.</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-bold text-slate-700">Display Status:</label>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                  className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${editForm.isActive ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-stone-200 text-slate-700'
                    }`}
                >
                  {editForm.isActive ? 'Active (Ready)' : 'Hidden'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0b2920] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DELETE CONFIRMATION DIALOG */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Delete Driver Banner
            </h3>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to remove this banner image? It will no longer appear in the Driver partner app.
            </p>

            {/* Banner Quick Item Preview */}
            <div className="my-4 p-3 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center gap-3 text-left">
              <img
                src={bannerToDelete.imageUrl}
                alt=""
                className="w-14 h-11 rounded-lg object-cover border border-stone-200 shrink-0 bg-slate-900"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Slide #{bannerToDelete.order}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                  {bannerToDelete.actionUrl ? bannerToDelete.actionUrl : (bannerToDelete.imageUrl.split('/').pop() || 'driver-banner.jpg')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
