import mongoose, { Schema, Document } from "mongoose";

export interface BookingInterface extends Document {
    bookingNumber: string;
    customerId: mongoose.Types.ObjectId;
    driverId?: mongoose.Types.ObjectId | null;
    serviceType: string;
    bookingType?: string;
    pickupLocation: string;
    destinationLocation: string;
    bookingDate: Date;
    bookingTime: string;
    durationHours?: number;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema: Schema = new Schema(
    {
        bookingNumber: {
            type: String,
            required: true,
            unique: true,
            default: function () {
                return "BK-" + Math.floor(100000 + Math.random() * 900000);
            }
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index: true
        },
        driverId: {
            type: Schema.Types.ObjectId,
            ref: "Driver",
            default: null,
            index: true
        },
        serviceType: {
            type: String,
            default: "Driver Local"
        },
        bookingType: {
            type: String,
            enum: ["Local", "Outstation"],
            default: "Local"
        },
        pickupLocation: {
            type: String,
            required: true
        },
        destinationLocation: {
            type: String,
            default: ""
        },
        bookingDate: {
            type: Date,
            default: Date.now
        },
        bookingTime: {
            type: String,
            default: ""
        },
        durationHours: {
            type: Number,
            default: 1
        },
        totalAmount: {
            type: Number,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded", "pending", "paid", "failed", "refunded"],
            default: "Pending"
        },
        status: {
            type: String,
            enum: ["Pending", "Active", "Driver Assigned", "Service Started", "Completed", "Cancelled", "pending", "active", "driver_assigned", "service_started", "completed", "cancelled"],
            default: "Pending",
            index: true
        }
    },
    {
        timestamps: true
    }
);

const Booking = mongoose.models.Booking || mongoose.model<BookingInterface>("Booking", bookingSchema);
export default Booking;
