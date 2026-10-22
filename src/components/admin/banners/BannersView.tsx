'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Smartphone,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Edit3,
  RotateCcw,
  Check,
  X,
  MoreHorizontal,
  Link as LinkIcon,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Layers,
} from 'lucide-react';
import { BannerItem, UserBannerSection } from '@/types';
import { useBannerStore } from '@/store/useBannerStore';
import { useToast } from '@/context/ToastContext';

export default function BannersView() {
  const { toast } = useToast();
  const {
    banners,
    isLoading,
    isUploading,
    isSaving,
    selectedBannerForEdit,
    isPreviewOpen,
    openEditModal,
    closeEditModal,
    openPreview,
    closePreview,
    fetchBanners,
    uploadMultipleImages,
    addSingleBannerUrl,
    updateBanner,
    deleteBanner,
    toggleActive,
    moveOrder,
  } = useBannerStore();

  // Primary Tabs matching reference image:
  // Tab 1: "Section banner" (Intro Screen)
  // Tab 2: "Position banners" (Home Screen Top & Middle)
  const [activeMainTab, setActiveMainTab] = useState<'intro' | 'home'>('intro');

  // Sub-tab for Home Screen (Top Hero vs Middle Section)
  const [homeSubTab, setHomeSubTab] = useState<'home_hero' | 'home_middle'>('home_hero');

  // Active section currently selected
  const activeSection: UserBannerSection =
    activeMainTab === 'intro' ? 'intro_screen' : homeSubTab;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Active dropdown menu for queue item
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Delete modal state
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);

  // Quick Add via URL modal state
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlForm, setUrlForm] = useState({ imageUrl: '', title: '', subtitle: '', actionUrl: '' });

  // Edit modal state
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', actionUrl: '', isActive: true });

  // Simulator state
  const [simSlide, setSimSlide] = useState(0);

  useEffect(() => {
    fetchBanners();
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

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleOutside);
      return () => document.removeEventListener('click', handleOutside);
    }
  }, [openMenuId]);

  // Counts
  const introBanners = banners
    .filter((b) => b.section === 'intro_screen')
    .sort((a, b) => a.order - b.order);

  const heroBanners = banners
    .filter((b) => b.section === 'home_hero')
    .sort((a, b) => a.order - b.order);

  const middleBanners = banners
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
        `File "${nonImages[0].name}" is not an image. Only PNG, JPG, JPEG, and WEBP formats are accepted.`
      );
      return;
    }

    const { success, count } = await uploadMultipleImages(activeSection, filesArray);
    if (success) {
      toast.success(
        'Upload Complete',
        `Added ${count} banner image${count > 1 ? 's' : ''} to ${activeSection === 'intro_screen'
          ? 'Intro Screen'
          : activeSection === 'home_hero'
            ? 'Homepage Hero'
            : 'Homepage Middle Section'
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
      toast.success('Updated', 'Banner details updated successfully.');
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
      urlForm.actionUrl.trim()
    );

    if (ok) {
      toast.success('Added', 'Banner image added successfully.');
      setIsUrlModalOpen(false);
      setUrlForm({ imageUrl: '', title: '', subtitle: '', actionUrl: '' });
    }
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    const ok = await deleteBanner(bannerToDelete.id || bannerToDelete._id!);
    if (ok) {
      toast.success('Deleted', 'Banner image removed.');
    }
    setBannerToDelete(null);
  };

  // Section titles and subtitles matching reference
  const sectionMeta = {
    intro_screen: {
      title: 'Section hero',
      subtitle: 'User app intro / onboarding walkthrough',
      desc: 'Intro onboarding screen',
    },
    home_hero: {
      title: 'Section hero',
      subtitle: 'Homepage / editorial top carousel',
      desc: 'Home hero top carousel',
    },
    home_middle: {
      title: 'Position banners',
      subtitle: 'Homepage / middle promotional strip',
      desc: 'Home middle promo strip',
    },
  }[activeSection];

  return (
    <div className="p-4 md:p-8 space-y-4 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER: "Creative library" + "All placements synced" badge */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-normal text-slate-900 tracking-tight font-serif">
            Creative library
          </h1>
          <p className="text-sm text-slate-500 mt-1">Keep every placement ready for launch.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#e6f4ea] text-[#137333] border border-[#ceead6] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-[#137333]" />
            <span>All placements synced</span>
          </div>

          <button
            onClick={() => fetchBanners()}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-stone-200 rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Refresh / Sync"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>
      </div> */}

      {/* 2. MODERN SEGMENTED TABS & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Main Segmented Pill Tabs */}
        <div className="inline-flex items-center bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 shadow-inner gap-1">
          {/* Tab 1: Intro Screen Banners */}
          <button
            type="button"
            onClick={() => setActiveMainTab('intro')}
            className={`group flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${activeMainTab === 'intro'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/[0.06]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
              }`}
          >
            <Smartphone
              className={`w-4 h-4 transition-colors ${activeMainTab === 'intro' ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
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

          {/* Tab 2: Home Screen Banners */}
          <button
            type="button"
            onClick={() => setActiveMainTab('home')}
            className={`group flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${activeMainTab === 'home'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/[0.06]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
              }`}
          >
            <LayoutGrid
              className={`w-4 h-4 transition-colors ${activeMainTab === 'home' ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
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

        {/* Action Controls & Sub-tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sub-position selector when Home Screen tab is active */}
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

          {/* Quick Sync Button */}
          {/* <button
            type="button"
            onClick={() => fetchBanners()}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-medium"
            title="Refresh and sync banners"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} />
            <span className="hidden sm:inline text-slate-600">Sync</span>
          </button> */}
        </div>
      </div>

      {/* 3. TWO-COLUMN MAIN CONTENT: LEFT (UPLOAD DROPZONE) & RIGHT (QUEUE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: SECTION HERO & UPLOAD DROPZONE (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {sectionMeta.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{sectionMeta.subtitle}</p>
              </div>

              <button
                onClick={() => setIsUrlModalOpen(true)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Add via URL</span>
              </button>
            </div>

            {/* Hidden Input strictly for images */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            {/* LARGE DASHED DROP AREA EXACTLY MATCHING DESIGN */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all my-4 flex flex-col items-center justify-center ${isDragOver
                ? 'border-emerald-600 bg-emerald-50/50 scale-[1.01]'
                : 'border-stone-200 bg-stone-50/30 hover:bg-emerald-50/20 hover:border-emerald-700/60'
                }`}
            >
              {/* Cloud Upload Icon Circle */}
              <div className="w-16 h-16 rounded-full bg-white border border-stone-200 flex items-center justify-center text-slate-800 shadow-2xs mb-4">
                <UploadCloud className="w-7 h-7 text-slate-700 stroke-[1.5]" />
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Drop your images here
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                or choose files from your computer
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
                    <span>Uploading images...</span>
                  </>
                ) : (
                  <span>Select images</span>
                )}
              </button>

              <span className="text-[11px] text-slate-400 mt-5 font-mono tracking-wide">
                JPG · PNG · WEBP · 10 MB max
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-stone-100 flex items-center justify-between">
            <span>Target placement: <strong>{sectionMeta.desc}</strong></span>
            <span>Batch upload enabled</span>
          </div>
        </div>

        {/* RIGHT COLUMN: QUEUE LIST EXACTLY MATCHING DESIGN (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Queue <span className="text-slate-400 font-medium">({currentSectionBanners.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Ready for dispatch</span>
          </div>

          {/* Queue Items List */}
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 flex-1">
            {currentSectionBanners.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-slate-400 mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span>No images in queue for this section.</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Use the upload box on the left to add slides.</span>
              </div>
            ) : (
              currentSectionBanners.map((banner, index) => {
                const isFirst = index === 0;
                const isLast = index === currentSectionBanners.length - 1;
                const filename =
                  banner.imageUrl.split('/').pop() || banner.title || `image-${banner.order}.jpg`;

                return (
                  <div
                    key={banner.id || banner._id}
                    className="bg-white rounded-xl p-3 border border-stone-200/80 hover:border-stone-300 transition-all flex items-center gap-3.5 relative shadow-2xs group"
                  >
                    {/* Thumbnail Matching Exact Proportions */}
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || filename}
                      className="w-32 sm:w-36 h-20 rounded-xl object-cover border border-stone-200/80 shrink-0 bg-slate-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
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
                        {banner.isActive ? (
                          <span className="bg-[#e6f4ea] text-[#137333] text-[10.5px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-[#137333]" />
                            <span>Ready</span>
                          </span>
                        ) : (
                          <span className="bg-stone-100 text-slate-500 text-[10.5px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Hidden</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Three Dots Menu Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === banner.id ? null : banner.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === banner.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-30 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            onClick={() => {
                              openEditModal(banner);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-stone-100 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit action link</span>
                          </button>

                          <button
                            onClick={() => {
                              moveOrder(banner.id || banner._id!, 'up');
                              setOpenMenuId(null);
                            }}
                            disabled={isFirst}
                            className={`w-full text-left px-3.5 py-1.5 hover:bg-stone-100 flex items-center gap-2 cursor-pointer ${isFirst ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                            <span>Move up in sequence</span>
                          </button>

                          <button
                            onClick={() => {
                              moveOrder(banner.id || banner._id!, 'down');
                              setOpenMenuId(null);
                            }}
                            disabled={isLast}
                            className={`w-full text-left px-3.5 py-1.5 hover:bg-stone-100 flex items-center gap-2 cursor-pointer ${isLast ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                            <span>Move down in sequence</span>
                          </button>

                          <button
                            onClick={() => {
                              toggleActive(banner.id || banner._id!);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-stone-100 flex items-center gap-2 cursor-pointer"
                          >
                            {banner.isActive ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                <span>Hide from app</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Activate in app</span>
                              </>
                            )}
                          </button>

                          <div className="my-1 border-t border-stone-100" />

                          <button
                            onClick={() => {
                              setBannerToDelete(banner);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete image</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ACTION BAR MATCHING EXACT SCREENSHOT */}
      <div className="bg-[#f0eee6]/80 rounded-2xl border border-stone-200/80 p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {currentSectionBanners.length} image{currentSectionBanners.length === 1 ? '' : 's'} selected
          </h4>
          <p className="text-xs text-slate-500">
            Ready to publish to your {sectionMeta.desc.toLowerCase()}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              toast.success('Saved as Live', 'Current banner placement is active.');
            }}
            className="bg-[#0b2920] hover:bg-[#064233] text-white text-xs md:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Publish to section
          </button>

          <button
            onClick={openPreview}
            className="bg-white hover:bg-stone-50 border border-stone-300 text-slate-700 text-xs md:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span>App Preview</span>
          </button>
        </div>
      </div>

      {/* 5. APP PHONE SIMULATOR MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
              <span className="text-xs font-bold">User Mobile App Simulator</span>
              <button
                onClick={closePreview}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold text-center">
              <button
                onClick={() => {
                  setActiveMainTab('intro');
                  setSimSlide(0);
                }}
                className={`py-1.5 rounded-lg transition-all ${activeMainTab === 'intro' ? 'bg-[#0b2920] text-white' : 'text-slate-400'
                  }`}
              >
                Intro Screen
              </button>
              <button
                onClick={() => {
                  setActiveMainTab('home');
                  setSimSlide(0);
                }}
                className={`py-1.5 rounded-lg transition-all ${activeMainTab === 'home' ? 'bg-[#0b2920] text-white' : 'text-slate-400'
                  }`}
              >
                Home Screen
              </button>
            </div>

            {/* Mock Screen */}
            <div className="mt-4 bg-slate-950 rounded-[32px] p-3.5 border-4 border-slate-800 shadow-inner relative overflow-hidden select-none">
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

              {activeMainTab === 'intro' ? (
                <div className="bg-[#0b131f] rounded-2xl p-3 min-h-[400px] text-white flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                    <span className="font-bold text-white">DrivePulse</span>
                    <span className="text-amber-400">Skip</span>
                  </div>

                  {introBanners.length > 0 ? (
                    <div className="my-auto space-y-3">
                      <div className="aspect-[4/5] rounded-xl overflow-hidden relative shadow-lg bg-slate-900 border border-slate-800">
                        <img
                          src={introBanners[simSlide % introBanners.length]?.imageUrl}
                          alt="Intro"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h4 className="text-sm font-bold text-white">
                            {introBanners[simSlide % introBanners.length]?.title || 'Welcome'}
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {introBanners[simSlide % introBanners.length]?.subtitle || ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-1.5">
                        {introBanners.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === simSlide % introBanners.length ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-700'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center my-auto text-xs text-slate-400">No intro banners</div>
                  )}

                  <button
                    onClick={() => setSimSlide((s) => (s + 1) % (introBanners.length || 1))}
                    className="w-full py-2 bg-[#0b2920] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <span>Next Slide</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              ) : (
                <div className="bg-[#0b131f] rounded-2xl p-3 min-h-[400px] text-white space-y-3 overflow-y-auto max-h-[400px]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                    <span className="font-bold text-white">DrivePulse</span>
                    <span className="text-[10px] text-amber-400">Home Feed</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Top Hero Carousel
                    </span>
                    {heroBanners.length > 0 ? (
                      <div className="aspect-[16/7] rounded-xl overflow-hidden relative border border-amber-500/30">
                        <img
                          src={heroBanners[0]?.imageUrl}
                          alt="Hero"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <h5 className="text-[11px] font-bold text-white">
                            {heroBanners[0]?.title || 'Hero Banner'}
                          </h5>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-[10px] text-slate-500 bg-slate-900 rounded-lg">
                        No hero banners
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Middle Section Promo
                    </span>
                    {middleBanners.length > 0 ? (
                      <div className="aspect-[16/6] rounded-xl overflow-hidden relative border border-purple-500/30">
                        <img
                          src={middleBanners[0]?.imageUrl}
                          alt="Middle"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <h5 className="text-[11px] font-bold text-white">
                            {middleBanners[0]?.title || 'Middle Banner'}
                          </h5>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-[10px] text-slate-500 bg-slate-900 rounded-lg">
                        No middle banners
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. EDIT BANNER MODAL */}
      {selectedBannerForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Slide #{selectedBannerForEdit.order}
              </h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Click Action Route / Link (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /booking/driver"
                  value={editForm.actionUrl}
                  onChange={(e) => setEditForm({ ...editForm, actionUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b2920] focus:outline-none font-mono"
                />
                <span className="text-[10.5px] text-slate-400">Where the customer is redirected upon clicking this slide.</span>
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

      {/* 7. ADD VIA URL MODAL */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Image via Direct URL</h3>
              <button onClick={() => setIsUrlModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUrlSubmit} className="mt-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Image Direct URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={urlForm.imageUrl}
                  onChange={(e) => setUrlForm({ ...urlForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b2920] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Click Action Route (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /booking/driver"
                  value={urlForm.actionUrl}
                  onChange={(e) => setUrlForm({ ...urlForm, actionUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b2920] focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0b2920] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Add Banner Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 8. DELETE CONFIRMATION DIALOG */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Delete Banner Image?</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove this banner image? It will no longer appear in the User mobile app.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setBannerToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
