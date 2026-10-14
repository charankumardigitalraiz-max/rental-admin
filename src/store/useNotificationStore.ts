import { create } from 'zustand';
import { NotificationRecord } from '@/types';
import { initialNotifications } from '@/data/mockData';

export interface NotificationCounts {
  total: number;
  sent: number;
  failed: number;
  unread: number;
}

export interface FirebaseStatus {
  configured: boolean;
  projectId?: string;
  clientEmail?: string;
  vapidKey?: string;
  error?: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DispatchNotificationPayload {
  title: string;
  message: string;
  targetAudience: 'All' | 'Drivers' | 'Customers' | 'Valet Staff' | 'Custom';
  targetType?: 'topic' | 'token';
  customToken?: string;
  token?: string;
  topic?: string;
  type: 'Booking' | 'Subscription' | 'Payment' | 'Cancellation' | 'Assignment' | 'General' | 'Alert';
  imageUrl?: string;
  actionUrl?: string;
  data?: Record<string, string>;
}

export interface SendTestPushPayload {
  title: string;
  message: string;
  targetType: 'topic' | 'token';
  topic?: string;
  token?: string;
}

export interface NotificationFetchParams {
  search?: string;
  audience?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface NotificationStoreState {
  notifications: NotificationRecord[];
  isLoading: boolean;
  isSending: boolean;
  isTesting: boolean;
  error: string | null;
  counts: NotificationCounts;
  firebaseStatus: FirebaseStatus;
  pagination: NotificationPagination | null;
  testResult: any | null;

  // Actions
  fetchNotifications: (params?: NotificationFetchParams) => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  dispatchNotification: (
    payload: DispatchNotificationPayload
  ) => Promise<{ success: boolean; error?: string; fcmMessageId?: string; data?: any }>;
  sendTestPush: (
    payload: SendTestPushPayload
  ) => Promise<{ success: boolean; message?: string; error?: string; [key: string]: any }>;
  setTestResult: (result: any) => void;
  clearTestResult: () => void;
  clearError: () => void;
  setNotifications: (notifications: NotificationRecord[]) => void;
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: initialNotifications,
  isLoading: false,
  isSending: false,
  isTesting: false,
  error: null,
  counts: {
    total: initialNotifications.length,
    sent: initialNotifications.length,
    failed: 0,
    unread: initialNotifications.filter((n) => !n.read).length,
  },
  firebaseStatus: {
    configured: false,
  },
  pagination: null,
  testResult: null,

  setTestResult: (result) => set({ testResult: result }),
  clearTestResult: () => set({ testResult: null }),
  clearError: () => set({ error: null }),
  setNotifications: (notifications) => set({ notifications }),

  fetchNotifications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.audience && params.audience !== 'All') query.set('audience', params.audience);
      if (params?.type && params.type !== 'All') query.set('type', params.type);
      if (params?.status && params.status !== 'All') query.set('status', params.status);
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());

      const queryString = query.toString();
      const endpoint = `/api/admin/notifications${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const list: NotificationRecord[] = json.data.map((item: any) => ({
          ...item,
          id: item._id || item.id,
          sentAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : item.sentAt || 'Recently',
        }));

        set({
          notifications: list,
          counts: json.counts || {
            total: list.length,
            sent: list.filter((n) => n.status !== 'failed').length,
            failed: list.filter((n) => n.status === 'failed').length,
            unread: list.filter((n) => !n.read).length,
          },
          firebaseStatus: json.firebase || get().firebaseStatus,
          pagination: json.pagination || null,
          isLoading: false,
        });
      } else {
        set({
          error: json.error || 'Failed to fetch notifications',
          isLoading: false,
        });
      }
    } catch (err: any) {
      console.warn('Could not fetch notifications from API:', err);
      set({
        error: err.message || 'Network error while fetching notifications',
        isLoading: false,
      });
    }
  },

  markAsRead: async (id: string) => {
    const prevNotifications = get().notifications;
    const prevCounts = get().counts;

    set({
      notifications: prevNotifications.map((n) =>
        n.id === id || n._id === id ? { ...n, read: true } : n
      ),
      counts: {
        ...prevCounts,
        unread: Math.max(0, prevCounts.unread - 1),
      },
    });

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!json.success) {
        set({ notifications: prevNotifications, counts: prevCounts });
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      set({ notifications: prevNotifications, counts: prevCounts });
      return false;
    }
  },

  markAllAsRead: async () => {
    const prevNotifications = get().notifications;
    const prevCounts = get().counts;

    set({
      notifications: prevNotifications.map((n) => ({ ...n, read: true })),
      counts: { ...prevCounts, unread: 0 },
    });

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      const json = await res.json();
      if (!json.success) {
        set({ notifications: prevNotifications, counts: prevCounts });
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
      set({ notifications: prevNotifications, counts: prevCounts });
      return false;
    }
  },

  deleteNotification: async (id: string) => {
    const prevNotifications = get().notifications;
    const prevCounts = get().counts;
    const target = prevNotifications.find((n) => n.id === id || n._id === id);

    set({
      notifications: prevNotifications.filter((n) => n.id !== id && n._id !== id),
      counts: {
        ...prevCounts,
        total: Math.max(0, prevCounts.total - 1),
        unread: target && !target.read ? Math.max(0, prevCounts.unread - 1) : prevCounts.unread,
        sent: target && target.status !== 'failed' ? Math.max(0, prevCounts.sent - 1) : prevCounts.sent,
        failed: target && target.status === 'failed' ? Math.max(0, prevCounts.failed - 1) : prevCounts.failed,
      },
    });

    try {
      const res = await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) {
        set({ notifications: prevNotifications, counts: prevCounts });
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
      set({ notifications: prevNotifications, counts: prevCounts });
      return false;
    }
  },

  dispatchNotification: async (payload) => {
    set({ isSending: true, error: null });
    try {
      const requestBody: any = {
        title: payload.title,
        message: payload.message,
        targetAudience: payload.targetAudience,
        type: payload.type,
        imageUrl: payload.imageUrl || undefined,
        data: payload.actionUrl ? { url: payload.actionUrl } : payload.data,
      };

      if (payload.targetAudience === 'Custom') {
        const token = payload.token || payload.customToken;
        requestBody.token = token?.trim();
        requestBody.targetType = 'token';
      } else if (payload.targetType) {
        requestBody.targetType = payload.targetType;
        if (payload.topic) requestBody.topic = payload.topic;
      }

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const json = await res.json();

      if (json.success) {
        if (json.data) {
          const newRecord: NotificationRecord = {
            ...json.data,
            id: json.data._id || json.data.id,
            sentAt: json.data.createdAt ? new Date(json.data.createdAt).toLocaleString() : 'Just now',
          };
          set((state) => ({
            notifications: [newRecord, ...state.notifications],
            counts: {
              ...state.counts,
              total: state.counts.total + 1,
              sent: newRecord.status !== 'failed' ? state.counts.sent + 1 : state.counts.sent,
              failed: newRecord.status === 'failed' ? state.counts.failed + 1 : state.counts.failed,
              unread: state.counts.unread + 1,
            },
            isSending: false,
          }));
        } else {
          set({ isSending: false });
        }
        return {
          success: true,
          fcmMessageId: json.fcmMessageId,
          data: json.data,
        };
      } else {
        set({
          isSending: false,
          error: json.error || 'Failed to dispatch notification via Firebase',
        });
        return {
          success: false,
          error: json.error || 'Failed to dispatch notification via Firebase',
        };
      }
    } catch (err: any) {
      set({
        isSending: false,
        error: err.message || 'Network error dispatching notification',
      });
      return {
        success: false,
        error: err.message || 'Network error dispatching notification',
      };
    }
  },

  sendTestPush: async (payload) => {
    set({ isTesting: true, testResult: null });
    try {
      const requestBody: any = {
        title: payload.title,
        message: payload.message,
      };

      if (payload.targetType === 'token') {
        requestBody.token = payload.token?.trim();
      } else {
        requestBody.topic = payload.topic?.trim() || 'test-channel';
      }

      const res = await fetch('/api/admin/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const json = await res.json();
      set({
        isTesting: false,
        testResult: json,
      });
      return json;
    } catch (err: any) {
      const errorResult = { success: false, error: err.message || 'Failed to execute test push' };
      set({
        isTesting: false,
        testResult: errorResult,
      });
      return errorResult;
    }
  },
}));
