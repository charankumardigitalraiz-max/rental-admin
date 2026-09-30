import mongoose, { Schema, Document } from "mongoose";

export interface OtpInterface extends Document {
    phone: string;
    otp: string;
    createdAt: Date;
}

const otpSchema: Schema = new Schema(
    {
        phone: { type: String, required: true },
        otp: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 300 } // Expires in 5 minutes (300 seconds)
    }
);

const Otp = mongoose.models.Otp || mongoose.model<OtpInterface>("Otp", otpSchema);
export default Otp;
