import connectToDatabase from '@/lib/mongodb';
import Notification, { NotificationInterface } from '@/models/notification';
import Driver from '@/models/driver';
import Customer from '@/models/customer';
import Admin from '@/models/admin';
import {
  sendPushNotification,
  sendTopicNotification,
  sendMulticastNotification,
  getFirebaseStatus,
} from '@/lib/firebase-admin';

export interface DispatchNotificationOptions {
  title: string;
  message: string;
  targetAudience: 'All' | 'Drivers' | 'Customers' | 'Valet Staff' | 'Admin' | 'Custom';
  targetType?: 'topic' | 'token' | 'user' | 'broadcast';
  topic?: string;
  token?: string;
  tokens?: string[];
  type?: 'Booking' | 'Subscription' | 'Payment' | 'Cancellation' | 'Assignment' | 'General' | 'Alert';
  imageUrl?: string;
  data?: Record<string, string>;
  sentBy?: string;
}

/**
 * High-level helper to dispatch push notifications via Firebase and record them in MongoDB.
 */
export async function dispatchNotification(options: DispatchNotificationOptions) {
  await connectToDatabase();

  const title = options.title.trim();
  const message = options.message.trim();
  const audience = options.targetAudience || 'All';
  const type = options.type || 'General';
  const targetType = options.targetType || (options.token ? 'token' : 'topic');
  const sentBy = options.sentBy || 'Admin System';

  let successCount = 0;
  let failureCount = 0;
  let fcmMessageId: string | undefined;
  let errorDetails: string | undefined;
  let status: 'sent' | 'failed' = 'sent';

  const fbStatus = getFirebaseStatus();

  try {
    if (!fbStatus.configured) {
      throw new Error(fbStatus.error || 'Firebase Admin is not configured');
    }

    // 1. Single Token
    if (options.token) {
      fcmMessageId = await sendPushNotification({
        token: options.token,
        title,
        body: message,
        imageUrl: options.imageUrl,
        data: options.data,
      });
      successCount = 1;
    }
    // 2. Specific Token List
    else if (options.tokens && options.tokens.length > 0) {
      const res = await sendMulticastNotification({
        tokens: options.tokens,
        title,
        body: message,
        imageUrl: options.imageUrl,
        data: options.data,
      });
      successCount = res.successCount;
      failureCount = res.failureCount;
      if (res.failureCount > 0 && res.successCount === 0) {
        status = 'failed';
        errorDetails = `Failed delivering to ${res.failureCount} tokens`;
      }
    }
    // 3. By Audience / Topic
    else {
      // Determine topic
      let topic = options.topic;
      if (!topic) {
        if (audience === 'Drivers') topic = 'drivers';
        else if (audience === 'Customers') topic = 'customers';
        else if (audience === 'Valet Staff') topic = 'valet_staff';
        else if (audience === 'Admin') topic = 'admin';
        else topic = 'all';
      }

      // Also gather stored device tokens if any exist in the database
      let dbTokens: string[] = [];
      if (audience === 'Drivers') {
        const driversWithToken = await Driver.find({ fcmToken: { $exists: true, $ne: '' } }).select('fcmToken');
        dbTokens = driversWithToken.map((d) => d.fcmToken).filter(Boolean) as string[];
      } else if (audience === 'Customers') {
        const customersWithToken = await Customer.find({ fcmToken: { $exists: true, $ne: '' } }).select('fcmToken');
        dbTokens = customersWithToken.map((c) => c.fcmToken).filter(Boolean) as string[];
      } else if (audience === 'Admin') {
        const adminsWithToken = await Admin.find({ fcmToken: { $exists: true, $ne: '' } }).select('fcmToken');
        dbTokens = adminsWithToken.map((a) => a.fcmToken).filter(Boolean) as string[];
      }

      // Send to topic (Firebase FCM Topic Broadcast)
      // Since devices are automatically subscribed to their audience topic on login/token registration,
      // topic broadcast delivers to all devices in one shot without sending duplicates.
      fcmMessageId = await sendTopicNotification({
        topic,
        title,
        body: message,
        imageUrl: options.imageUrl,
        data: {
          ...(options.data || {}),
          audience,
          type,
        },
      });

      successCount = dbTokens.length > 0 ? dbTokens.length : 1;
    }
  } catch (err: any) {
    status = 'failed';
    errorDetails = err.message || 'Error communicating with Firebase';
    failureCount += 1;
    console.error('[dispatchNotification] Error:', err);
  }

  // Save record to MongoDB Notification collection
  const record = await Notification.create({
    title,
    message,
    targetAudience: audience,
    targetType,
    topic: options.topic || (audience === 'All' ? 'all' : audience.toLowerCase()),
    targetTokens: options.token ? [options.token] : options.tokens || [],
    type,
    imageUrl: options.imageUrl,
    data: options.data,
    status,
    successCount,
    failureCount,
    fcmMessageId,
    errorDetails,
    sentBy,
    read: false,
  });

  return {
    success: status === 'sent',
    record,
    fcmMessageId,
    error: errorDetails,
    firebaseConfigured: fbStatus.configured,
  };
}
