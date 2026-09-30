import { create } from 'zustand';

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthStoreState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  checkAuth: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AUTH_STORAGE_KEY = 'drivepulse_admin_session';

export const useAuthStore = create<AuthStoreState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isSubmitting: false,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: () => {
    try {
      if (typeof window !== 'undefined') {
        const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedSession) {
          const parsedUser = JSON.parse(savedSession);
          set({ user: parsedUser, isAuthenticated: true, isLoading: false });
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved auth session', e);
    }
    set({ isLoading: false });
  },

  login: async (email, password) => {
    set({ isSubmitting: true, error: null });

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const adminData = data.data || {};
        const authUser: AuthUser = {
          id: adminData._id || adminData.id,
          email: adminData.email || email,
          name:
            adminData.name ||
            email.split('@')[0].replace('.', ' ').toUpperCase() ||
            'Admin User',
          role: adminData.role || 'Super Admin',
          avatar:
            adminData.avatar ||
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        }

        set({
          user: authUser,
          isAuthenticated: true,
          isSubmitting: false,
          error: null,
        });

        return true;
      } else {
        set({
          error: data.error || 'Invalid administrator credentials.',
          isSubmitting: false,
        });
        return false;
      }
    } catch (err: any) {
      set({
        error: err.message || 'Failed to connect to authentication API.',
        isSubmitting: false,
      });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    set({ user: null, isAuthenticated: false });
  },
}));
