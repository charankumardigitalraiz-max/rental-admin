import mongoose, { Schema, Document } from "mongoose";

export interface SupportQueryInterface extends Document {
    ticketId: string;
    name: string;
    email: string;
    phone: string;
    category: string;
    subject: string;
    message: string;
    bookingId?: string;
    priority: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const supportQuerySchema: Schema = new Schema(
    {
        ticketId: { type: String, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        category: { type: String, default: "General Support" },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        bookingId: { type: String, default: "" },
        priority: { type: String, default: "Normal", enum: ["Normal", "High", "Urgent"] },
        status: { type: String, default: "Open", enum: ["Open", "In Review", "Resolved", "Closed"] },
    },
    {
        timestamps: true,
    }
);

if (mongoose.models && mongoose.models.SupportQuery) {
    delete (mongoose.models as any).SupportQuery;
}

const SupportQuery = mongoose.model<SupportQueryInterface>("SupportQuery", supportQuerySchema);
export default SupportQuery;
