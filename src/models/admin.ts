import mongoose, { Schema, Document } from "mongoose";


export interface AdminInterface extends Document {
    name: string,
    username: string,
    email: string,
    role: string,
    password: string,
    status: boolean,
    createdAt: Date,
    updatedAt: Date
}



const adminSchema: Schema = new Schema(
    {
        name: String,
        username: { type: String, unique: true },
        email: { type: String, unique: true },
        role: String,
        password: String,
        status: Boolean,
    }, {
    timestamps: true,
}
);

const Admin = mongoose.models.Admin || mongoose.model<AdminInterface>('Admin', adminSchema);
export default Admin;