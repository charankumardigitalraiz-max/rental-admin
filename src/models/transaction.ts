import mongoose, { Schema, Document } from "mongoose";

export interface TransactionInterface extends Document {
    transactionId: string;
    bookingId?: mongoose.Types.ObjectId | string;
    customerId?: mongoose.Types.ObjectId;
    driverId?: mongoose.Types.ObjectId;
    serviceType: string;
    customerOrDriverName: string;
    amount: number;
    method: string;
    payoutAmount: number;
    platformCommission: number;
    refundAmount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema: Schema = new Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            default: function () {
                return "TXN-" + Math.floor(10000000 + Math.random() * 90000000);
            }
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "DriverBooking",
            default: null
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            default: null
        },
        driverId: {
            type: Schema.Types.ObjectId,
            ref: "Driver",
            default: null
        },
        serviceType: {
            type: String,
            required: true,
            default: "Driver Local"
        },
        customerOrDriverName: {
            type: String,
            default: ""
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        method: {
            type: String,
            default: "online"
        },
        payoutAmount: {
            type: Number,
            default: 0
        },
        platformCommission: {
            type: Number,
            default: 0
        },
        refundAmount: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["Success", "Pending", "Failed", "Refunded"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

const Transaction = mongoose.models.Transaction || mongoose.model<TransactionInterface>("Transaction", transactionSchema);
export default Transaction;
