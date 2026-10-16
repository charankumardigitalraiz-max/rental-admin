import mongoose, { Schema, Document } from "mongoose";

export interface DriverSubscriptionInterface extends Document {
    driverId: mongoose.Types.ObjectId;
    driverCustomId?: string; // e.g. "DRV-101"
    driverName: string;
    driverPhone: string;
    driverAvatar?: string;
    planId: mongoose.Types.ObjectId;
    planName: string;
    amount: number;
    durationDays: number;
    billingCycle?: string;
    features: string[];
    localEligible: boolean;
    outstationEligible: boolean;
    maxRequestsPerDay: number;
    startDate: Date;
    expiryDate: Date;
    paymentStatus: 'Successful' | 'Pending' | 'Failed';
    paymentMethod: string;
    transactionId?: string;
    subscriptionStatus: 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled' | 'Suspended';
    bookingsReceived: number;
    completedBookings: number;
    createdAt: Date;
    updatedAt: Date;
}

const driverSubscriptionSchema: Schema = new Schema(
    {
        driverId: {
            type: Schema.Types.ObjectId,
            ref: "Driver",
            required: true,
            index: true,
        },
        driverCustomId: {
            type: String,
            default: "",
        },
        driverName: {
            type: String,
            required: true,
            trim: true,
        },
        driverPhone: {
            type: String,
            default: "",
        },
        driverAvatar: {
            type: String,
            default: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        },
        planId: {
            type: Schema.Types.ObjectId,
            ref: "Subscription",
            required: true,
        },
        planName: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        durationDays: {
            type: Number,
            required: true,
            default: 30,
        },
        billingCycle: {
            type: String,
            default: "monthly",
        },
        features: [{ type: String }],
        localEligible: {
            type: Boolean,
            default: true,
        },
        outstationEligible: {
            type: Boolean,
            default: true,
        },
        maxRequestsPerDay: {
            type: Number,
            default: 999,
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['Successful', 'Pending', 'Failed'],
            default: 'Successful',
        },
        paymentMethod: {
            type: String,
            default: 'UPI / Card',
        },
        transactionId: {
            type: String,
            default: function () {
                return "SUBTXN-" + Math.floor(10000000 + Math.random() * 90000000);
            },
        },
        subscriptionStatus: {
            type: String,
            enum: ['Active', 'Expiring Soon', 'Expired', 'Cancelled', 'Suspended'],
            default: 'Active',
            index: true,
        },
        bookingsReceived: {
            type: Number,
            default: 0,
        },
        completedBookings: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual id
driverSubscriptionSchema.virtual('id').get(function (this: any) {
    return this._id?.toString();
});

// Avoid caching issues during hot reload
if (mongoose.models && mongoose.models.DriverSubscription) {
    delete (mongoose.models as any).DriverSubscription;
}

const DriverSubscription = mongoose.model<DriverSubscriptionInterface>(
    "DriverSubscription",
    driverSubscriptionSchema
);

export default DriverSubscription;
