import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const STORAGE_KEY = 'drivepulse_sidebar_collapsed';

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isCollapsed: false,
  isMobileOpen: false,

  toggleCollapse: () => {
    const next = !get().isCollapsed;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
    }
    set({ isCollapsed: next });
  },

  setCollapsed: (collapsed: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
      } catch (e) {
        console.error(e);
      }
    }
    set({ isCollapsed: collapsed });
  },

  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setMobileOpen: (open: boolean) => set({ isMobileOpen: open }),

  toggleSidebar: () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      set((state) => ({ isMobileOpen: !state.isMobileOpen }));
    } else {
      get().toggleCollapse();
    }
  },
}));
