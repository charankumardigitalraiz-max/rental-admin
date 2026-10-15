import { create } from 'zustand';
import { ValetPricingConfig, PricingRule, ValetParkingPricingTier } from '@/types';
import { initialValetPricing, initialPricingRules } from '@/data/mockData';

export type { ValetParkingPricingTier };

export interface TimePricingTier {
  hours: number;
  timeRange: string;
  customerPrice: number;
  driverPrice: number;
}

export interface LocalPricingTiers {
  one_way: {
    morningHours: TimePricingTier;
    nightHours: TimePricingTier;
  };
  round_trip: {
    morningHours: TimePricingTier;
    nightHours: TimePricingTier;
  };
}

export interface OutstationPricingTiers {
  one_way: {
    day: number;
    customerPrice: number;
    driverPrice: number;
    morningHours: TimePricingTier;
    nightHours: TimePricingTier;
  };
  round_trip: {
    day: number;
    customerPrice: number;
    driverPrice: number;
    morningHours: TimePricingTier;
    nightHours: TimePricingTier;
  };
}

export interface DriverPricingData {
  _id?: string;
  id?: string;
  local: LocalPricingTiers;
  outstation: OutstationPricingTiers;
  valletparking?: ValetParkingPricingTier;
  createdAt?: string;
  updatedAt?: string;
}

export const defaultDriverPricingData: DriverPricingData = {
  local: {
    one_way: {
      morningHours: {
        hours: 4,
        timeRange: '06:00-18:00',
        customerPrice: 400,
        driverPrice: 320,
      },
      nightHours: {
        hours: 4,
        timeRange: '18:00-06:00',
        customerPrice: 500,
        driverPrice: 400,
      },
    },
    round_trip: {
      morningHours: {
        hours: 8,
        timeRange: '06:00-18:00',
        customerPrice: 800,
        driverPrice: 650,
      },
      nightHours: {
        hours: 8,
        timeRange: '18:00-06:00',
        customerPrice: 950,
        driverPrice: 780,
      },
    },
  },
  outstation: {
    one_way: {
      day: 1,
      customerPrice: 1500,
      driverPrice: 1200,
      morningHours: {
        hours: 12,
        timeRange: '06:00-18:00',
        customerPrice: 1500,
        driverPrice: 1200,
      },
      nightHours: {
        hours: 12,
        timeRange: '18:00-06:00',
        customerPrice: 1800,
        driverPrice: 1450,
      },
    },
    round_trip: {
      day: 1,
      customerPrice: 2000,
      driverPrice: 1600,
      morningHours: {
        hours: 12,
        timeRange: '06:00-18:00',
        customerPrice: 2000,
        driverPrice: 1600,
      },
      nightHours: {
        hours: 12,
        timeRange: '18:00-06:00',
        customerPrice: 2400,
        driverPrice: 1950,
      },
    },
  },
  valletparking: {
    person: 1,
    hours: 4,
    customerprice: 600,
    driverprice: 480,
  },
};

interface PricingStoreState {
  driverPricing: DriverPricingData | null;
  pricingList: DriverPricingData[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  valetPricing: ValetPricingConfig;
  pricingRules: PricingRule[];

  // Actions
  fetchDriverPricing: () => Promise<void>;
  saveDriverPricing: (
    payload: DriverPricingData
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  saveValetParkingTier: (
    valletparking: ValetParkingPricingTier
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateValetPricing: (config: ValetPricingConfig) => void;
  addPricingRule: (rule: Omit<PricingRule, 'id'>) => void;
  togglePricingRuleStatus: (id: string) => void;
  clearError: () => void;
}

export const usePricingStore = create<PricingStoreState>((set, get) => ({
  driverPricing: defaultDriverPricingData,
  pricingList: [],
  isLoading: false,
  isSaving: false,
  error: null,

  valetPricing: initialValetPricing,
  pricingRules: initialPricingRules,

  clearError: () => set({ error: null }),

  fetchDriverPricing: async () => {
    set({ isLoading: true, error: null });
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token') ||
            localStorage.getItem('admin_token') ||
            document.cookie.split('; ').find((r) => r.startsWith('admin_token=') || r.startsWith('token='))?.split('=')[1]
          : null;

      const res = await fetch('/api/admin/driver-pricing', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const list: DriverPricingData[] = Array.isArray(json.data)
          ? json.data
          : json.data
          ? [json.data]
          : [];
        const current = list.length > 0 ? list[0] : defaultDriverPricingData;

        // Ensure valletparking fallback if not yet configured in DB
        if (!current.valletparking) {
          current.valletparking = defaultDriverPricingData.valletparking;
        }

        set({
          driverPricing: current,
          pricingList: list,
          isLoading: false,
        });
      } else {
        set({
          error: json.message || 'Failed to fetch driver pricing configuration.',
          isLoading: false,
        });
      }
    } catch (err: any) {
      console.error('Error fetching driver pricing in usePricingStore:', err);
      set({
        error: err.message || 'Network error while fetching driver pricing.',
        isLoading: false,
      });
    }
  },

  saveDriverPricing: async (payload: DriverPricingData) => {
    set({ isSaving: true, error: null });
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token') ||
            localStorage.getItem('admin_token') ||
            document.cookie.split('; ').find((r) => r.startsWith('admin_token=') || r.startsWith('token='))?.split('=')[1]
          : null;

      const res = await fetch('/api/admin/driver-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const savedData = json.data || payload;
        set({
          driverPricing: savedData,
          isSaving: false,
        });
        return {
          success: true,
          message: json.message || 'Driver pricing saved successfully.',
        };
      } else {
        set({
          error: json.message || 'Failed to save driver pricing.',
          isSaving: false,
        });
        return {
          success: false,
          error: json.message || 'Failed to save driver pricing.',
        };
      }
    } catch (err: any) {
      console.error('Error saving driver pricing in usePricingStore:', err);
      set({
        error: err.message || 'Network error while saving driver pricing.',
        isSaving: false,
      });
      return {
        success: false,
        error: err.message || 'Network error while saving driver pricing.',
      };
    }
  },

  saveValetParkingTier: async (valletparking: ValetParkingPricingTier) => {
    const current = get().driverPricing || defaultDriverPricingData;
    const payload: DriverPricingData = {
      ...current,
      valletparking,
    };
    return get().saveDriverPricing(payload);
  },

  updateValetPricing: (config) => set({ valetPricing: config }),

  addPricingRule: (ruleData) =>
    set((state) => ({
      pricingRules: [...state.pricingRules, { ...ruleData, id: `rule-${Date.now()}` }],
    })),

  togglePricingRuleStatus: (id) =>
    set((state) => ({
      pricingRules: state.pricingRules.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r
      ),
    })),
}));
