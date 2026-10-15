import mongoose, { Schema, Document } from "mongoose";

export interface SubscriptionInterface extends Document {
    planName: string;
    description: string;
    price: number;
    durationDays: number;
    billingCycle: string;
    localEligible: boolean;
    outstationEligible: boolean;
    maxRequestsPerDay: number;
    features: string[];
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema: Schema = new Schema(
    {
        planName: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
        durationDays: { type: Number, default: 30, min: 1 },
        billingCycle: { type: String, default: 'monthly' },
        localEligible: { type: Boolean, default: true },
        outstationEligible: { type: Boolean, default: true },
        maxRequestsPerDay: { type: Number, default: 999 },
        features: [{ type: String }],
        status: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for name (alias to planName)
subscriptionSchema.virtual('name').get(function (this: any) {
    return this.planName;
});

// Delete old model from cache if exists so schema changes apply in hot reload
if (mongoose.models && mongoose.models.Subscription) {
    delete (mongoose.models as any).Subscription;
}

const Subscription = mongoose.model<SubscriptionInterface>("Subscription", subscriptionSchema);
export default Subscription;
