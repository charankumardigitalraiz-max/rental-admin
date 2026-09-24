import mongoose, { Schema, Document } from "mongoose";

export interface DriverInterface extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    driverId: string;
    licenseNumber: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const driverSchema: Schema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        address: { type: String },
        driverId: { type: String, required: true, unique: true },
        licenseNumber: { type: String, required: true, unique: true },
        status: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const Driver = mongoose.models.Driver || mongoose.model<DriverInterface>("Driver", driverSchema);
export default Driver;
