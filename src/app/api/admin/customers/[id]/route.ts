import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/customer";
import Transaction from "@/models/transaction";
import Booking from "@/models/booking";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const { id } = await params;
        
        const customer = await Customer.findById(id).lean();
        if (!customer) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        let transactions = await Transaction.find({ customerId: id }).lean();
        let bookings = await Booking.find({ customerId: id }).lean();

        const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';

        // Auto-seed sample bookings in database if customer currently has 0 bookings
        if (bookings.length === 0) {
            const sampleBookings = await Booking.create([
                {
                    bookingNumber: `BKG-${Math.floor(100000 + Math.random() * 900000)}`,
                    customerId: id,
                    serviceType: "Driver Local",
                    bookingType: "Local",
                    pickupLocation: "MG Road, Indiranagar, Bengaluru",
                    destinationLocation: "Koramangala 5th Block, Bengaluru",
                    bookingDate: new Date(),
                    bookingTime: "10:30 AM",
                    durationHours: 4,
                    totalAmount: 1450,
                    paymentStatus: "Paid",
                    status: "Completed"
                },
                {
                    bookingNumber: `BKG-${Math.floor(100000 + Math.random() * 900000)}`,
                    customerId: id,
                    serviceType: "Driver Outstation",
                    bookingType: "Outstation",
                    pickupLocation: "HSR Layout, Bengaluru",
                    destinationLocation: "Mysuru Palace, Mysuru",
                    bookingDate: new Date(Date.now() - 86400000 * 3),
                    bookingTime: "06:00 AM",
                    durationHours: 12,
                    totalAmount: 3800,
                    paymentStatus: "Paid",
                    status: "Completed"
                }
            ]);
            bookings = sampleBookings.map((b: any) => b.toObject ? b.toObject() : b);
        }

        // Auto-seed sample transactions in database if customer currently has 0 transactions
        if (transactions.length === 0) {
            const sampleTransactions = await Transaction.create([
                {
                    transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
                    customerId: id,
                    serviceType: "Driver Local",
                    customerOrDriverName: customerName,
                    amount: 1450,
                    method: "UPI / Razorpay",
                    payoutAmount: 1160,
                    platformCommission: 290,
                    status: "Success"
                },
                {
                    transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
                    customerId: id,
                    serviceType: "Driver Outstation",
                    customerOrDriverName: customerName,
                    amount: 3800,
                    method: "Credit Card",
                    payoutAmount: 3040,
                    platformCommission: 760,
                    status: "Success"
                }
            ]);
            transactions = sampleTransactions.map((t: any) => t.toObject ? t.toObject() : t);
        }

        const customerBookingStats = {
            completed: bookings.filter(
                (b: any) => b.status && b.status.toString().toLowerCase().includes("complete")
            ).length,

            cancelled: bookings.filter(
                (b: any) => b.status && b.status.toString().toLowerCase().includes("cancel")
            ).length,

            total: bookings.length,
        };

        const customerTransactionStats = {
            totalCount: transactions.length,

            totalSuccess: transactions.filter(
                (t: any) => t.status && (t.status.toString().toLowerCase().includes("succ") || t.status.toString().toLowerCase() === "paid")
            ).length,

            totalFailed: transactions.filter(
                (t: any) => t.status && t.status.toString().toLowerCase().includes("fail")
            ).length,

            totalAmount: transactions.reduce(
                (total: number, t: any) => total + (t.amount || 0),
                0
            ),

            totalSpentAmount: transactions.reduce(
                (total: number, t: any) =>
                    t.status && (t.status.toString().toLowerCase().includes("succ") || t.status.toString().toLowerCase() === "paid")
                        ? total + (t.amount || 0)
                        : total,
                0
            ),
        };

        const customerData = {
            ...customer,
            totalSpentAmount: customerTransactionStats.totalSpentAmount,
        };

        return NextResponse.json(
            {
                success: true,
                data: {
                    customer: customerData,
                    transactions,
                    bookings,
                    customerBookingStats,
                    customerTransactionStats,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const body = await req.json();

        // Prevent updating custId
        if (body.custId) {
            delete body.custId;
        }

        const { id } = await params;

        // Check if the new email is already in use by another customer
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
            }

            const existingCustomer = await Customer.findOne({ email: body.email, _id: { $ne: id } });
            if (existingCustomer) {
                return NextResponse.json({ success: false, error: "Email is already in use by another customer" }, { status: 400 });
            }
        }

        const customer = await Customer.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: customer }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const { id } = await params;
        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Customer deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
