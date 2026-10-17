import mongoose, { Schema, Document } from "mongoose";

export interface AdminInterface extends Document {
    name: string;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: string;
    password?: string;
    status: boolean;
    lastLogin?: Date;
    fcmToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const adminSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        username: { type: String, unique: true },
        email: { type: String, unique: true, required: true },
        phone: { type: String, default: "" },
        avatar: { type: String, default: "" },
        role: { type: String, default: "Operations Admin" },
        password: { type: String },
        status: { type: Boolean, default: true },
        lastLogin: { type: Date },
        fcmToken: { type: String },
    },
    {
        timestamps: true,
    }
);

const Admin = mongoose.models.Admin || mongoose.model<AdminInterface>('Admin', adminSchema);
export default Admin;