import mongoose, { Schema, Document } from "mongoose";

export interface DriverInterface extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    driverId: string;
    licenseNumber: string;
    pancardNumber?: string;
    pancard?: string;
    aadhaarNumber?: string;
    aadhaarCardFront?: string;
    aadhaarCardBack?: string;
    drivingLicense?: string;
    selfie?: string;
    passportId?: string;
    passport?: string;
    status: string;
    isOnline?: boolean;
    isVerified?: boolean;
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
        pancardNumber: { type: String },
        pancard: { type: String },
        aadhaarNumber: { type: String },
        aadhaarCardFront: { type: String },
        aadhaarCardBack: { type: String },
        drivingLicense: { type: String },
        selfie: { type: String },
        passportId: { type: String },
        passport: { type: String },
        status: { type: String, default: "pending" },
        isOnline: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        strict: true,
    }
);

// Delete old model from cache if exists so schema changes (isVerified) apply in hot reload
if (mongoose.models && mongoose.models.Driver) {
    delete (mongoose.models as any).Driver;
}

const Driver = mongoose.model<DriverInterface>("Driver", driverSchema);
export default Driver;
