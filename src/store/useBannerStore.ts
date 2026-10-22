import { create } from 'zustand';
import { BannerItem, UserBannerSection, BannerAppType } from '@/types';

const INITIAL_USER_BANNERS: BannerItem[] = [
  // 1. Intro Screen
  {
    id: 'intro-1',
    _id: 'intro-1',
    section: 'intro_screen',
    title: 'Elite Personal Chauffeur On Demand',
    subtitle: 'Professional, background-verified chauffeurs for your personal car at hourly rates.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/onboarding/step-1',
    order: 1,
    isActive: true,
  },
  {
    id: 'intro-2',
    _id: 'intro-2',
    section: 'intro_screen',
    title: 'Safe, Verified & Uniformed Drivers',
    subtitle: 'Complete peace of mind with thorough KYC, commercial licenses, and driving test verification.',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/onboarding/step-2',
    order: 2,
    isActive: true,
  },
  {
    id: 'intro-3',
    _id: 'intro-3',
    section: 'intro_screen',
    title: 'Seamless City & Outstation Drives',
    subtitle: 'Flexible bookings for late night returns, shopping trips, outstation getaways, or corporate meetings.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/onboarding/step-3',
    order: 3,
    isActive: true,
  },

  // 2. Home Screen - Hero Section
  {
    id: 'hero-1',
    _id: 'hero-1',
    section: 'home_hero',
    title: '50% Off First Personal Chauffeur Drive',
    subtitle: 'Use code LUXE50 at checkout for your first local city booking.',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/booking/driver?coupon=LUXE50',
    order: 1,
    isActive: true,
  },
  {
    id: 'hero-2',
    _id: 'hero-2',
    section: 'home_hero',
    title: 'Weekend Outstation Getaways',
    subtitle: 'Hire expert highway drivers for seamless round trips with family.',
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/booking/outstation',
    order: 2,
    isActive: true,
  },
  {
    id: 'hero-3',
    _id: 'hero-3',
    section: 'home_hero',
    title: 'Luxury Valet Event Service',
    subtitle: 'Dedicated valet parking attendants for weddings and corporate gatherings.',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/booking/valet',
    order: 3,
    isActive: true,
  },

  // 3. Home Screen - Middle Section
  {
    id: 'middle-1',
    _id: 'middle-1',
    section: 'home_middle',
    title: 'Late Night Safe Returns Guaranteed',
    subtitle: 'Heading out for parties or dinner? Book a chauffeur to drive you back in your vehicle.',
    imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/booking/driver?type=night',
    order: 1,
    isActive: true,
  },
  {
    id: 'middle-2',
    _id: 'middle-2',
    section: 'home_middle',
    title: 'Corporate Monthly Retainer Packages',
    subtitle: 'Exclusive business rates for executive daily travel and client hospitality.',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    actionUrl: '/corporate-enquiry',
    order: 2,
    isActive: true,
  },
];

interface BannerStoreState {
  banners: BannerItem[];
  activeAppType: BannerAppType;
  activeSection: UserBannerSection;
  isLoading: boolean;
  isUploading: boolean;
  isSaving: boolean;
  selectedBannerForEdit: BannerItem | null;
  isPreviewOpen: boolean;

  setActiveAppType: (appType: BannerAppType) => void;
  setActiveSection: (section: UserBannerSection) => void;
  openEditModal: (banner: BannerItem) => void;
  closeEditModal: () => void;
  openPreview: () => void;
  closePreview: () => void;

  fetchBanners: (appType?: BannerAppType, section?: UserBannerSection) => Promise<void>;
  uploadMultipleImages: (section: UserBannerSection, files: File[], overrideAppType?: BannerAppType) => Promise<{ success: boolean; count: number }>;
  addSingleBannerUrl: (section: UserBannerSection, imageUrl: string, title?: string, subtitle?: string, actionUrl?: string, overrideAppType?: BannerAppType) => Promise<boolean>;
  updateBanner: (id: string, data: Partial<BannerItem>) => Promise<boolean>;
  deleteBanner: (id: string) => Promise<boolean>;
  toggleActive: (id: string) => Promise<boolean>;
  moveOrder: (id: string, direction: 'up' | 'down') => Promise<boolean>;
}

export const useBannerStore = create<BannerStoreState>((set, get) => ({
  banners: INITIAL_USER_BANNERS,
  activeAppType: 'user',
  activeSection: 'home_hero',
  isLoading: false,
  isUploading: false,
  isSaving: false,
  selectedBannerForEdit: null,
  isPreviewOpen: false,

  setActiveAppType: (appType) => {
    set({ activeAppType: appType });
    get().fetchBanners(appType);
  },
  setActiveSection: (section) => set({ activeSection: section }),
  openEditModal: (banner) => set({ selectedBannerForEdit: banner }),
  closeEditModal: () => set({ selectedBannerForEdit: null }),
  openPreview: () => set({ isPreviewOpen: true }),
  closePreview: () => set({ isPreviewOpen: false }),

  fetchBanners: async (overrideAppType) => {
    const targetAppType = overrideAppType || get().activeAppType || 'user';
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/admin/banners?appType=${targetAppType}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.banners)) {
        set({ banners: data.banners });
      }
    } catch (err) {
      console.warn('API error, using active state:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Upload multiple images in one go
  uploadMultipleImages: async (section, files, overrideAppType) => {
    if (!files || files.length === 0) return { success: false, count: 0 };
    set({ isUploading: true });

    try {
      const currentAppType = overrideAppType || get().activeAppType || 'user';
      const formData = new FormData();
      formData.append('appType', currentAppType);
      formData.append('section', section);

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          formData.append('images', file);
        }
      }

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload images');
      }

      const resData = await res.json();
      if (resData.success && Array.isArray(resData.banners)) {
        set((state) => ({
          banners: [...state.banners, ...resData.banners],
        }));
        return { success: true, count: resData.banners.length };
      }
      return { success: false, count: 0 };
    } catch (err: any) {
      console.error('Error uploading multiple images:', err);
      // Local fallback for offline/dev demonstration
      const currentAppType = overrideAppType || get().activeAppType || 'user';
      const localCreated: BannerItem[] = files.map((file, idx) => ({
        id: `local-${Date.now()}-${idx}`,
        _id: `local-${Date.now()}-${idx}`,
        appType: currentAppType,
        section,
        title: '',
        subtitle: '',
        imageUrl: URL.createObjectURL(file),
        order: get().banners.filter((b) => b.section === section).length + idx + 1,
        isActive: true,
      }));

      set((state) => ({
        banners: [...state.banners, ...localCreated],
      }));
      return { success: true, count: localCreated.length };
    } finally {
      set({ isUploading: false });
    }
  },

  addSingleBannerUrl: async (section, imageUrl, title, subtitle, actionUrl, overrideAppType) => {
    set({ isSaving: true });
    try {
      const currentAppType = overrideAppType || get().activeAppType || 'user';
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appType: currentAppType,
          section,
          imageUrl,
          title,
          subtitle,
          actionUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to create banner');
      const resData = await res.json();
      if (resData.success && resData.banner) {
        set((state) => ({
          banners: [...state.banners, resData.banner],
        }));
        return true;
      }
      return false;
    } catch (err) {
      // Local fallback
      const localItem: BannerItem = {
        id: `local-${Date.now()}`,
        _id: `local-${Date.now()}`,
        section,
        title: title || '',
        subtitle: subtitle || '',
        imageUrl,
        actionUrl: actionUrl || '',
        order: get().banners.filter((b) => b.section === section).length + 1,
        isActive: true,
      };
      set((state) => ({
        banners: [...state.banners, localItem],
      }));
      return true;
    } finally {
      set({ isSaving: false });
    }
  },

  updateBanner: async (id, data) => {
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update banner');
      const resData = await res.json();
      if (resData.success && resData.banner) {
        set((state) => ({
          banners: state.banners.map((b) => (b.id === id || b._id === id ? resData.banner : b)),
          selectedBannerForEdit: null,
        }));
        return true;
      }
      return false;
    } catch (err) {
      // Local fallback
      set((state) => ({
        banners: state.banners.map((b) =>
          b.id === id || b._id === id ? { ...b, ...data } : b
        ),
        selectedBannerForEdit: null,
      }));
      return true;
    } finally {
      set({ isSaving: false });
    }
  },

  deleteBanner: async (id) => {
    try {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      set((state) => ({
        banners: state.banners.filter((b) => b.id !== id && b._id !== id),
      }));
      return true;
    } catch (err) {
      set((state) => ({
        banners: state.banners.filter((b) => b.id !== id && b._id !== id),
      }));
      return true;
    }
  },

  toggleActive: async (id) => {
    const banner = get().banners.find((b) => b.id === id || b._id === id);
    if (!banner) return false;
    const nextActive = !banner.isActive;

    // Optimistically update
    set((state) => ({
      banners: state.banners.map((b) =>
        b.id === id || b._id === id ? { ...b, isActive: nextActive } : b
      ),
    }));

    try {
      await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });
      return true;
    } catch (err) {
      return true;
    }
  },

  moveOrder: async (id, direction) => {
    const state = get();
    const current = state.banners.find((b) => b.id === id || b._id === id);
    if (!current) return false;

    // Filter section banners sorted by order
    const sectionBanners = state.banners
      .filter((b) => b.section === current.section)
      .sort((a, b) => a.order - b.order);

    const index = sectionBanners.findIndex((b) => b.id === id || b._id === id);
    if (index === -1) return false;

    if (direction === 'up' && index === 0) return false;
    if (direction === 'down' && index === sectionBanners.length - 1) return false;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const target = sectionBanners[swapIndex];

    const currentNewOrder = target.order;
    const targetNewOrder = current.order;

    const updatedBanners = state.banners.map((b) => {
      if (b.id === current.id || b._id === current._id) return { ...b, order: currentNewOrder };
      if (b.id === target.id || b._id === target._id) return { ...b, order: targetNewOrder };
      return b;
    });

    set({ banners: updatedBanners });

    try {
      await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          items: [
            { id: current.id || current._id, order: currentNewOrder },
            { id: target.id || target._id, order: targetNewOrder },
          ],
        }),
      });
      return true;
    } catch (err) {
      return true;
    }
  },
}));
