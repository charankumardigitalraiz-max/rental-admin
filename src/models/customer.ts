import mongoose, { Schema, Document } from "mongoose";

export interface CustomerInterface extends Document {
    firstName: string;
    lastName: string;
    custId: string;
    email: string;
    phone: string;
    address?: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema: Schema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        custId: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        address: { type: String },
        status: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const Customer = mongoose.models.Customer || mongoose.model<CustomerInterface>("Customer", customerSchema);
export default Customer;
