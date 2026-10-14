import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let firebaseApp: admin.app.App | null = null;
let initError: string | null = null;

function loadServiceAccount(): admin.ServiceAccount | null {
  // 1. Try JSON string from environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (err: any) {
      console.error('[Firebase Admin] Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', err.message);
    }
  }

  // 2. Try configured path from environment variable
  const possiblePaths: string[] = [];
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    possiblePaths.push(path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
  }

  // 3. Try standard secure config directory
  possiblePaths.push(path.resolve(process.cwd(), 'config', 'firebase-service-account.json'));

  // 4. Try public directory fallback
  possiblePaths.push(
    path.resolve(process.cwd(), 'public', 'driverbooking-4b700-firebase-adminsdk-fbsvc-df68e4aa01.json')
  );

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed.project_id && parsed.private_key && parsed.client_email) {
          return parsed;
        }
      } catch (err: any) {
        console.warn(`[Firebase Admin] Failed reading service account from ${filePath}:`, err.message);
      }
    }
  }

  return null;
}

export function getFirebaseAdminApp(): admin.app.App | null {
  if (firebaseApp) return firebaseApp;

  if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0]!;
    return firebaseApp;
  }

  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      initError = 'No valid Firebase service account found. Please check FIREBASE_SERVICE_ACCOUNT_PATH or config/firebase-service-account.json';
      console.warn('[Firebase Admin]', initError);
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
    initError = null;
    return firebaseApp;
  } catch (err: any) {
    initError = err.message || 'Failed to initialize Firebase Admin SDK';
    console.error('[Firebase Admin] Initialization failed:', initError);
    return null;
  }
}

export function getFirebaseMessaging(): admin.messaging.Messaging | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return admin.messaging(app);
}

export const FIREBASE_VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  process.env.FIREBASE_VAPID_KEY ||
  'BGmb_sg2JVJn9RIKu0jzCSIKNMehMVlC_sO_wolSaEduaUqImA-A8AAL9wyPHufBV2qUNzeTiRh4EzSIQA_KjBI';

export function getFirebaseStatus(): {
  configured: boolean;
  projectId?: string;
  clientEmail?: string;
  vapidKey?: string;
  error?: string;
} {
  try {
    const serviceAccount = loadServiceAccount();
    const app = getFirebaseAdminApp();

    if (!app || !serviceAccount) {
      return {
        configured: false,
        error: initError || 'Firebase service account not loaded',
        vapidKey: FIREBASE_VAPID_KEY,
      };
    }

    return {
      configured: true,
      projectId: serviceAccount.projectId,
      clientEmail: serviceAccount.clientEmail,
      vapidKey: FIREBASE_VAPID_KEY,
    };
  } catch (err: any) {
    return {
      configured: false,
      error: err.message,
      vapidKey: FIREBASE_VAPID_KEY,
    };
  }
}


export interface PushNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface SendToTopicOptions extends PushNotificationPayload {
  topic: string;
}

export interface SendToTokenOptions extends PushNotificationPayload {
  token: string;
}

export interface SendToTokensOptions extends PushNotificationPayload {
  tokens: string[];
}

/**
 * Send push notification to a specific device token
 */
export async function sendPushNotification(options: SendToTokenOptions) {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    throw new Error('Firebase Messaging not initialized. Check your service account credentials.');
  }

  const message: admin.messaging.Message = {
    token: options.token,
    notification: {
      title: options.title,
      body: options.body,
      imageUrl: options.imageUrl,
    },
    data: options.data,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'high_importance_channel',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    webpush: {
      notification: {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      },
      fcmOptions: {
        link: options.data?.url || '/admin/notifications',
      },
    },
  };

  return await messaging.send(message);
}

/**
 * Send push notification to a topic (e.g., 'all', 'drivers', 'customers')
 */
export async function sendTopicNotification(options: SendToTopicOptions) {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    throw new Error('Firebase Messaging not initialized. Check your service account credentials.');
  }

  // Clean topic name (only alphanumeric and - ~ % allowed)
  const cleanTopic = options.topic.replace(/[^a-zA-Z0-9-_.~%]+/g, '_');

  const message: admin.messaging.Message = {
    topic: cleanTopic,
    notification: {
      title: options.title,
      body: options.body,
      imageUrl: options.imageUrl,
    },
    data: options.data,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'high_importance_channel',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    webpush: {
      notification: {
        icon: '/icons/icon-192x192.png',
      },
      fcmOptions: {
        link: options.data?.url || '/admin/notifications',
      },
    },
  };

  return await messaging.send(message);
}

/**
 * Send push notification to multiple device tokens
 */
export async function sendMulticastNotification(options: SendToTokensOptions) {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    throw new Error('Firebase Messaging not initialized. Check your service account credentials.');
  }

  if (!options.tokens || options.tokens.length === 0) {
    return { successCount: 0, failureCount: 0, responses: [] };
  }

  // Firebase allows max 500 tokens per batch
  const batchSize = 500;
  const results = {
    successCount: 0,
    failureCount: 0,
    failedTokens: [] as string[],
  };

  for (let i = 0; i < options.tokens.length; i += batchSize) {
    const chunk = options.tokens.slice(i, i + batchSize);
    const multicastMessage: admin.messaging.MulticastMessage = {
      tokens: chunk,
      notification: {
        title: options.title,
        body: options.body,
        imageUrl: options.imageUrl,
      },
      data: options.data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(multicastMessage);
    results.successCount += response.successCount;
    results.failureCount += response.failureCount;

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        results.failedTokens.push(chunk[idx]);
      }
    });
  }

  return results;
}

/**
 * Subscribe devices to a topic
 */
export async function subscribeTokensToTopic(tokens: string[], topic: string) {
  const messaging = getFirebaseMessaging();
  if (!messaging) throw new Error('Firebase Messaging not initialized');
  return await messaging.subscribeToTopic(tokens, topic);
}

/**
 * Unsubscribe devices from a topic
 */
export async function unsubscribeTokensFromTopic(tokens: string[], topic: string) {
  const messaging = getFirebaseMessaging();
  if (!messaging) throw new Error('Firebase Messaging not initialized');
  return await messaging.unsubscribeFromTopic(tokens, topic);
}
