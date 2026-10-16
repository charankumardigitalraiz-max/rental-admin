import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/customer";
import Transaction from "@/models/transaction";
import DriverBooking from "@/models/driverBooking";
import ValetBooking from "@/models/valetBooking";
import "@/models/driver";
import "@/models/valetStaff";
import { verifyAdmin } from "@/lib/auth";

function mapValetStatus(status?: string): string {
    if (!status) return "Pending";
    const s = status.toLowerCase();
    if (s === "completed") return "Completed";
    if (s === "cancelled") return "Cancelled";
    if (s === "in_progress") return "Service Started";
    if (s === "fully_assigned" || s === "partially_assigned") return "Driver Assigned";
    if (s === "pending_assignment") return "Searching Driver";
    if (s === "new_request") return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function mapDriverStatus(status?: string): string {
    if (!status) return "Completed";
    const s = status.toLowerCase();
    if (s.includes("complete")) return "Completed";
    if (s.includes("cancel")) return "Cancelled";
    if (s.includes("start")) return "Service Started";
    if (s.includes("assign")) return "Driver Assigned";
    if (s.includes("arriv")) return "Driver Arriving";
    if (s.includes("search")) return "Searching Driver";
    if (s.includes("pend")) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

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

        // Fetch driver bookings, valet bookings, and transactions concurrently
        const userMatch = { $or: [{ userId: id }, { customerId: id }] };

        const [rawDriverBookings, rawValetBookings, rawTransactions] = await Promise.all([
            DriverBooking.find(userMatch)
                .populate("driverId", "name phone avatar")
                .sort({ createdAt: -1 })
                .lean(),
            ValetBooking.find(userMatch)
                .populate("assignedStaffIds", "name phone")
                .sort({ eventDate: -1, createdAt: -1 })
                .lean(),
            Transaction.find({ $or: [{ customerId: id }, { userId: id }] })
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        // Normalize Driver Bookings
        const formattedDriverBookings = rawDriverBookings.map((b: any) => {
            const bookingNum = b.bookingId || b.bookingNumber || `BKG-${Math.floor(100000 + Math.random() * 900000)}`;
            const sType = b.serviceType === "outstation" || b.tripType === "outstation" ? "Driver Outstation" : "Driver Local";
            const bType = b.serviceType === "outstation" || b.tripType === "outstation" ? "Outstation" : "Local";
            const pLoc = typeof b.pickupLocation === "string" ? b.pickupLocation : b.pickupLocation?.address || "Pickup Location";
            const dLoc = typeof b.dropLocation === "string" ? b.dropLocation : b.dropLocation?.address || b.destinationLocation || "Drop Location";
            const bDate = b.scheduledStartTime || b.bookingDate || b.createdAt;
            const bTime = b.scheduledStartTime
                ? new Date(b.scheduledStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : (b.bookingTime || "10:30 AM");
            const duration = b.durationHours || (b.durationDays ? b.durationDays * 24 : 4);

            return {
                _id: String(b._id),
                id: String(b._id),
                bookingId: bookingNum,
                bookingNumber: bookingNum,
                serviceCategory: "driver",
                serviceType: sType,
                bookingType: bType,
                tripType: b.tripType || "round_trip",
                pickupLocation: pLoc,
                destinationLocation: dLoc,
                bookingDate: bDate,
                bookingTime: bTime,
                durationHours: Number(duration),
                vehicleInfo: {
                    type: b.vehicleType || "SUV",
                    model: b.vehicleNumber ? `${b.vehicleType || "Car"} (${b.vehicleNumber})` : (b.vehicleInfo?.model || "Customer Car"),
                    plateNumber: b.vehicleNumber || b.vehicleInfo?.plateNumber || "KA-01-MJ-8821",
                    fuelType: b.fuelType || "Petrol",
                    transmission: b.transmission || "Automatic",
                },
                totalAmount: b.totalAmount || b.pricing?.totalCustomerAmount || b.baseAmount || 0,
                paymentStatus: b.paymentStatus || "Paid",
                status: mapDriverStatus(b.bookingStatus || b.status),
                driverName: b.driverId?.name || b.driverName || "Assigned Driver",
                driverPhone: b.driverId?.phone || b.driverPhone || "",
                detailsUrl: `/admin/driver-bookings/${b._id}`,
                createdAt: b.createdAt || bDate,
            };
        });

        // Normalize Valet Bookings
        const formattedValetBookings = rawValetBookings.map((v: any) => {
            const bookingNum = v.bookingId || `VLT-${Math.floor(100000 + Math.random() * 900000)}`;
            const pLoc = v.venueName || v.address || v.location?.address || "Event Venue";
            const dLoc = `${v.person || 1} Staff · ${v.hours || 4}h Package (${v.startTime || "18:00"} - ${v.endTime || "22:00"})`;
            const bDate = v.eventDate || v.createdAt;
            const bTime = v.startTime || "06:00 PM";
            const staffCount = v.assignedStaffIds ? v.assignedStaffIds.length : 0;

            return {
                _id: String(v._id),
                id: String(v._id),
                bookingId: bookingNum,
                bookingNumber: bookingNum,
                serviceCategory: "valet",
                serviceType: "Valet Parking",
                bookingType: "Valet",
                eventName: v.eventName || "Valet Event",
                pickupLocation: pLoc,
                destinationLocation: dLoc,
                bookingDate: bDate,
                bookingTime: bTime,
                durationHours: Number(v.hours || 4),
                vehicleInfo: {
                    type: "Valet Staff",
                    model: v.eventName || "Valet Event",
                    plateNumber: `${v.person || 1} Attendants Required`,
                    fuelType: "N/A",
                    transmission: "N/A",
                },
                totalAmount: v.pricing?.totalAmount || v.pricing?.customerPrice || v.totalAmount || 0,
                paymentStatus: v.paymentStatus === "paid" ? "Paid" : (v.paymentStatus || "Pending"),
                status: mapValetStatus(v.status),
                driverName: staffCount > 0 ? `${staffCount} Staff Assigned` : "Pending Assignment",
                driverPhone: v.assignedStaffIds?.[0]?.phone || "",
                detailsUrl: `/admin/valet-bookings/${v._id}`,
                createdAt: v.createdAt || bDate,
            };
        });

        const { searchParams } = new URL(req.url);
        const bookingPage = Math.max(1, parseInt(searchParams.get("bookingPage") || "1", 10));
        const bookingLimit = Math.max(1, parseInt(searchParams.get("bookingLimit") || "5", 10));
        const bookingFilter = searchParams.get("bookingFilter") || "all";

        const transactionPage = Math.max(1, parseInt(searchParams.get("transactionPage") || "1", 10));
        const transactionLimit = Math.max(1, parseInt(searchParams.get("transactionLimit") || "5", 10));

        // Combined Bookings list sorted chronologically
        let allCombinedBookings = [...formattedDriverBookings, ...formattedValetBookings].sort(
            (a, b) => new Date(b.createdAt || b.bookingDate).getTime() - new Date(a.createdAt || a.bookingDate).getTime()
        );

        const customerBookingStats = {
            completed: allCombinedBookings.filter(
                (b: any) => b.status && b.status.toString().toLowerCase().includes("complete")
            ).length,
            cancelled: allCombinedBookings.filter(
                (b: any) => b.status && b.status.toString().toLowerCase().includes("cancel")
            ).length,
            total: allCombinedBookings.length,
            driverTripsCount: formattedDriverBookings.length,
            valetTripsCount: formattedValetBookings.length,
        };

        const customerTransactionStats = {
            totalCount: rawTransactions.length,
            totalSuccess: rawTransactions.filter(
                (t: any) => t.status && (t.status.toString().toLowerCase().includes("succ") || t.status.toString().toLowerCase() === "paid")
            ).length,
            totalFailed: rawTransactions.filter(
                (t: any) => t.status && t.status.toString().toLowerCase().includes("fail")
            ).length,
            totalAmount: rawTransactions.reduce(
                (total: number, t: any) => total + (t.amount || 0),
                0
            ),
            totalSpentAmount: rawTransactions.reduce(
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
            totalBookings: customerBookingStats.total,
            completedBookings: customerBookingStats.completed,
            cancelledBookings: customerBookingStats.cancelled,
        };

        // Filter bookings by selected tab filter
        let filteredBookings = allCombinedBookings;
        if (bookingFilter === "driver") {
            filteredBookings = allCombinedBookings.filter((b: any) => b.serviceCategory === "driver" || b.bookingType !== "Valet");
        } else if (bookingFilter === "valet") {
            filteredBookings = allCombinedBookings.filter((b: any) => b.serviceCategory === "valet" || b.bookingType === "Valet");
        } else if (bookingFilter === "completed") {
            filteredBookings = allCombinedBookings.filter((b: any) => b.status && b.status.toString().toLowerCase().includes("complete"));
        } else if (bookingFilter === "cancelled") {
            filteredBookings = allCombinedBookings.filter((b: any) => b.status && b.status.toString().toLowerCase().includes("cancel"));
        }

        // Apply pagination
        const totalFilteredBookings = filteredBookings.length;
        const totalBookingPages = Math.ceil(totalFilteredBookings / bookingLimit) || 1;
        const paginatedBookings = filteredBookings.slice((bookingPage - 1) * bookingLimit, bookingPage * bookingLimit);

        const bookingsPagination = {
            page: bookingPage,
            limit: bookingLimit,
            total: totalFilteredBookings,
            totalPages: totalBookingPages,
        };

        const totalTransactions = rawTransactions.length;
        const totalTxnPages = Math.ceil(totalTransactions / transactionLimit) || 1;
        const paginatedTransactions = rawTransactions.slice((transactionPage - 1) * transactionLimit, transactionPage * transactionLimit);

        const transactionsPagination = {
            page: transactionPage,
            limit: transactionLimit,
            total: totalTransactions,
            totalPages: totalTxnPages,
        };

        return NextResponse.json(
            {
                success: true,
                data: {
                    customer: customerData,
                    bookings: paginatedBookings,
                    transactions: paginatedTransactions,
                    customerBookingStats,
                    customerTransactionStats,
                    bookingsPagination,
                    transactionsPagination,
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
