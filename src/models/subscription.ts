import mongoose, { Schema, Document } from "mongoose";

export interface SubscriptionInterface extends Document {
    planName: string;
    description: string;
    price: number;
    billingCycle: 'weekly' | 'monthly' | 'yearly';
    features: string[];
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema: Schema = new Schema(
    {
        planName: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        billingCycle: { type: String, enum: ['weekly', 'monthly', 'yearly'], default: 'monthly' },
        features: [{ type: String }],
        status: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const Subscription = mongoose.models.Subscription || mongoose.model<SubscriptionInterface>("Subscription", subscriptionSchema);
export default Subscription;
