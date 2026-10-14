import mongoose, { Schema, Document } from "mongoose";

export interface NotificationInterface extends Document {
  title: string;
  message: string;
  targetAudience: 'All' | 'Drivers' | 'Customers' | 'Valet Staff' | 'Custom';
  targetType: 'topic' | 'token' | 'user' | 'broadcast';
  topic?: string;
  targetTokens?: string[];
  type: 'Booking' | 'Subscription' | 'Payment' | 'Cancellation' | 'Assignment' | 'General' | 'Alert';
  imageUrl?: string;
  data?: Record<string, string>;
  status: 'sent' | 'failed' | 'scheduled';
  successCount: number;
  failureCount: number;
  fcmMessageId?: string;
  errorDetails?: string;
  sentBy?: string;
  read?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetAudience: {
      type: String,
      enum: ['All', 'Drivers', 'Customers', 'Valet Staff', 'Custom'],
      default: 'All',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['topic', 'token', 'user', 'broadcast'],
      default: 'topic',
      required: true,
    },
    topic: { type: String },
    targetTokens: [{ type: String }],
    type: {
      type: String,
      enum: ['Booking', 'Subscription', 'Payment', 'Cancellation', 'Assignment', 'General', 'Alert'],
      default: 'General',
      required: true,
    },
    imageUrl: { type: String },
    data: { type: Map, of: String },
    status: {
      type: String,
      enum: ['sent', 'failed', 'scheduled'],
      default: 'sent',
    },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    fcmMessageId: { type: String },
    errorDetails: { type: String },
    sentBy: { type: String, default: 'Admin System' },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Delete old model from cache if exists to prevent hot reload issues
if (mongoose.models && mongoose.models.Notification) {
  delete (mongoose.models as any).Notification;
}

const Notification = mongoose.model<NotificationInterface>("Notification", notificationSchema);

export default Notification;
