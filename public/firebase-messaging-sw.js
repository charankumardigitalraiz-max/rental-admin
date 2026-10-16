// Firebase Cloud Messaging & Web Push Service Worker
/* eslint-disable no-restricted-globals */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Web Push / FCM Push notification listener
self.addEventListener('push', (event) => {
  let title = 'DrivePulse Admin Alert';
  let body = 'You have a new administrative notification';
  let icon = '/logo.png';
  let data = {};

  if (event.data) {
    try {
      const parsed = event.data.json();
      title = parsed.notification?.title || parsed.title || title;
      body = parsed.notification?.body || parsed.body || body;
      icon = parsed.notification?.icon || parsed.icon || icon;
      data = parsed.data || parsed;
    } catch {
      body = event.data.text() || body;
    }
  }

  const options = {
    body,
    icon,
    badge: '/logo.png',
    data,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click notification listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && client.url.includes('/admin') && 'focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
