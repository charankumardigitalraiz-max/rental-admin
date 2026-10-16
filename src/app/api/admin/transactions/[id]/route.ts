import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import Customer from "@/models/customer";
import Driver from "@/models/driver";
import DriverBooking from "@/models/driverBooking";
import DriverSubscription from "@/models/driverSubscription";
import { verifyAdmin } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 });
        }

        let transaction = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            transaction = await Transaction.findById(id);
        }
        if (!transaction) {
            transaction = await Transaction.findOne({
                $or: [
                    { transactionId: id },
                    { transactionId: { $regex: new RegExp(`^${id}$`, "i") } }
                ]
            });
        }

        if (!transaction) {
            return NextResponse.json(
                { success: false, error: "Transaction not found" },
                { status: 404 }
            );
        }

        // Look up related customer info if available
        let customerInfo: any = null;
        if (transaction.customerId && mongoose.Types.ObjectId.isValid(transaction.customerId)) {
            const cust = await Customer.findById(transaction.customerId).lean() as any;
            if (cust) {
                customerInfo = {
                    id: cust._id.toString(),
                    name: cust.name || `${cust.firstName || ""} ${cust.lastName || ""}`.trim(),
                    email: cust.email || "",
                    phone: cust.phone || "",
                    avatar: cust.avatar || cust.profileImage || "",
                };
            }
        }
        if (!customerInfo && transaction.customerOrDriverName) {
            const cust = await Customer.findOne({
                name: { $regex: new RegExp(`^${transaction.customerOrDriverName.trim()}$`, "i") }
            }).lean() as any;
            if (cust) {
                customerInfo = {
                    id: cust._id.toString(),
                    name: cust.name || `${cust.firstName || ""} ${cust.lastName || ""}`.trim(),
                    email: cust.email || "",
                    phone: cust.phone || "",
                    avatar: cust.avatar || cust.profileImage || "",
                };
            }
        }

        // Look up related driver info if available
        let driverInfo: any = null;
        if (transaction.driverId && mongoose.Types.ObjectId.isValid(transaction.driverId)) {
            const drv = await Driver.findById(transaction.driverId).lean() as any;
            if (drv) {
                driverInfo = {
                    id: drv._id.toString(),
                    driverId: drv.driverId || "",
                    name: `${drv.firstName || ""} ${drv.lastName || ""}`.trim(),
                    phone: drv.phone || "",
                    avatar: drv.selfie || drv.avatar || "",
                };
            }
        }

        // Look up related booking info if available
        let bookingInfo: any = null;
        if (transaction.bookingId) {
            const bookingQuery = mongoose.Types.ObjectId.isValid(transaction.bookingId)
                ? { _id: transaction.bookingId }
                : { bookingNumber: transaction.bookingId };
            const bk = await DriverBooking.findOne(bookingQuery).lean() as any;
            if (bk) {
                bookingInfo = {
                    id: bk._id.toString(),
                    bookingNumber: bk.bookingNumber || "",
                    status: bk.status || "",
                    tripType: bk.tripType || "",
                    pickupLocation: bk.pickupLocation || bk.pickupAddress || "",
                    dropLocation: bk.dropLocation || bk.dropAddress || "",
                    pickupDate: bk.pickupDate || bk.date || "",
                    pickupTime: bk.pickupTime || bk.time || "",
                };
            }
        }

        // Look up related subscription info if available
        let subscriptionInfo: any = null;
        if (transaction.subscriptionId && mongoose.Types.ObjectId.isValid(transaction.subscriptionId)) {
            const sub = await DriverSubscription.findById(transaction.subscriptionId).lean() as any;
            if (sub) {
                subscriptionInfo = {
                    id: sub._id.toString(),
                    planName: sub.planName || "",
                    status: sub.subscriptionStatus || "",
                    price: sub.amountPaid || 0,
                    startDate: sub.startDate,
                    expiryDate: sub.expiryDate,
                };
            }
        }

        const formatted = {
            id: transaction._id.toString(),
            _id: transaction._id.toString(),
            transactionId: transaction.transactionId,
            bookingId: transaction.bookingId ? transaction.bookingId.toString() : (transaction.transactionId || ""),
            subscriptionId: transaction.subscriptionId ? transaction.subscriptionId.toString() : "",
            customerId: transaction.customerId ? transaction.customerId.toString() : "",
            driverId: transaction.driverId ? transaction.driverId.toString() : "",
            serviceType: transaction.serviceType || "Driver Local",
            customerOrDriverName: transaction.customerOrDriverName || "Customer",
            planName: transaction.planName || "",
            amount: Number(transaction.amount) || 0,
            method: transaction.method || "UPI",
            paymentMethod: transaction.method || "UPI",
            payoutAmount: Number(transaction.payoutAmount) || 0,
            platformCommission: Number(transaction.platformCommission) || 0,
            refundAmount: Number(transaction.refundAmount) || 0,
            status: transaction.status || "Pending",
            date: transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("en-IN") : "",
            paymentDate: transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("en-IN") : "",
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            customer: customerInfo,
            driver: driverInfo,
            booking: bookingInfo,
            subscription: subscriptionInfo,
        };

        return NextResponse.json({
            success: true,
            data: formatted,
        });
    } catch (error: any) {
        console.error("Error in GET /api/admin/transactions/[id]:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch transaction details" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const { id } = await context.params;
        const body = await req.json();
        const { status, refundAmount } = body;

        let transaction = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            transaction = await Transaction.findById(id);
        }
        if (!transaction) {
            transaction = await Transaction.findOne({
                $or: [
                    { transactionId: id },
                    { transactionId: { $regex: new RegExp(`^${id}$`, "i") } }
                ]
            });
        }

        if (!transaction) {
            return NextResponse.json(
                { success: false, error: "Transaction not found" },
                { status: 404 }
            );
        }

        const validStatuses = ["Success", "Pending", "Failed", "Refunded"];
        if (status) {
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                    { status: 400 }
                );
            }
            transaction.status = status;
            if (status === "Refunded" && (refundAmount === undefined || refundAmount === null)) {
                transaction.refundAmount = transaction.amount;
            }
        }

        if (refundAmount !== undefined && refundAmount !== null) {
            const numRefund = Number(refundAmount);
            if (!isNaN(numRefund) && numRefund >= 0) {
                transaction.refundAmount = numRefund;
            }
        }

        await transaction.save();

        const formatted = {
            id: transaction._id.toString(),
            _id: transaction._id.toString(),
            transactionId: transaction.transactionId,
            bookingId: transaction.bookingId ? transaction.bookingId.toString() : "",
            subscriptionId: transaction.subscriptionId ? transaction.subscriptionId.toString() : "",
            customerId: transaction.customerId ? transaction.customerId.toString() : "",
            driverId: transaction.driverId ? transaction.driverId.toString() : "",
            serviceType: transaction.serviceType,
            customerOrDriverName: transaction.customerOrDriverName,
            planName: transaction.planName,
            amount: Number(transaction.amount) || 0,
            method: transaction.method,
            paymentMethod: transaction.method,
            payoutAmount: Number(transaction.payoutAmount) || 0,
            platformCommission: Number(transaction.platformCommission) || 0,
            refundAmount: Number(transaction.refundAmount) || 0,
            status: transaction.status,
            date: transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("en-IN") : "",
            paymentDate: transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("en-IN") : "",
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };

        return NextResponse.json({
            success: true,
            message: "Transaction updated successfully",
            data: formatted,
        });
    } catch (error: any) {
        console.error("Error in PATCH /api/admin/transactions/[id]:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update transaction" },
            { status: 500 }
        );
    }
}
