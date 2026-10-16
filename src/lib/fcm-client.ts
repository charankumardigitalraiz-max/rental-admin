'use client';

export const DEFAULT_FIREBASE_VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  'BGmb_sg2JVJn9RIKu0jzCSIKNMehMVlC_sO_wolSaEduaUqImA-A8AAL9wyPHufBV2qUNzeTiRh4EzSIQA_KjBI';

/**
 * Converts a base64url encoded VAPID key to a Uint8Array required by pushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests browser notification permission and retrieves an FCM / Web Push device token.
 * Non-blocking: returns null if unsupported, denied, or unavailable without throwing.
 */
export async function getOrGenerateFcmToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check browser capability
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('[FCM Client] Push notifications or Service Workers not supported in this browser environment.');
    return null;
  }

  try {
    // 1. Request notification permission if not already decided
    let permission = Notification.permission;
    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission();
      } catch (permErr) {
        console.warn('[FCM Client] Error requesting notification permission:', permErr);
      }
    }

    if (permission !== 'granted') {
      console.warn('[FCM Client] Notification permission was not granted (status:', permission, ')');
      // Return cached token if previously stored
      return localStorage.getItem('admin_fcm_token') || null;
    }

    // 2. Register service worker
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;

    // 3. Standard Web Push subscribe using VAPID key
    let subscription = await swRegistration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(DEFAULT_FIREBASE_VAPID_KEY);
      subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    if (subscription && subscription.endpoint) {
      // For Chromium/Firebase, the token is at the end of the endpoint URL
      let token = subscription.endpoint;
      if (token.includes('/fcm/send/')) {
        token = token.split('/fcm/send/')[1];
      }

      if (token) {
        localStorage.setItem('admin_fcm_token', token);
        console.log('[FCM Client] Push token generated and ready:', token.substring(0, 25) + '...');
        return token;
      }
    }

    return localStorage.getItem('admin_fcm_token') || null;
  } catch (error: any) {
    console.warn('[FCM Client] Failed to generate FCM push token:', error?.message || error);
    return localStorage.getItem('admin_fcm_token') || null;
  }
}

/**
 * Secondary synchronization: registers the FCM token to /api/admin/notifications/token
 */
export async function syncFcmTokenToBackend(token: string, identifier: string): Promise<boolean> {
  if (!token || !identifier) return false;
  try {
    const res = await fetch('/api/admin/notifications/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        role: 'admin',
        identifier,
      }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err: any) {
    console.warn('[FCM Client] Failed syncing FCM token to backend:', err?.message);
    return false;
  }
}

/**
 * Removes cached FCM token and unsubscribes the browser push manager subscription
 */
export async function clearFcmTokenAndUnsubscribe(): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Remove cached token from localStorage
  try {
    localStorage.removeItem('admin_fcm_token');
  } catch (e) {
    console.warn('[FCM Client] Error removing local token:', e);
  }

  // 2. Unsubscribe push subscription
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
    } catch (unsubErr: any) {
      console.warn('[FCM Client] Error unsubscribing browser push manager:', unsubErr?.message);
    }
  }
}

