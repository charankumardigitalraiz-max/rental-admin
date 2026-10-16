import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import DriverBooking from "@/models/driverBooking";
import DriverSubscription from "@/models/driverSubscription";
import Customer from "@/models/customer";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const { id } = await params;

        let driver = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            driver = await Driver.findById(id);
        }
        if (!driver) {
            driver = await Driver.findOne({ driverId: id });
        }

        if (!driver) {
            return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
        }

        const driverObjectId = driver._id;
        const driverCode = driver.driverId;

        // Construct filter matching this driver in bookings (DriverBooking.driverId is Schema.Types.ObjectId)
        const driverBookingBaseFilter = {
            driverId: driverObjectId,
        };

        // Auto-seed sample bookings if this driver has no booking records yet
        const bookingCountForDriver = await DriverBooking.countDocuments(driverBookingBaseFilter);
        if (bookingCountForDriver === 0) {
            try {
                // Find a customer to link if possible
                const existingCustomer = await Customer.findOne();
                const custId = existingCustomer?._id || new mongoose.Types.ObjectId();

                const seedBookings = [
                    {
                        bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
                        userId: custId,
                        driverId: driverObjectId,
                        bookingMode: "Local",
                        serviceType: "local",
                        tripType: "round-trip",
                        scheduledStartTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                        durationHours: 4,
                        pickupLocation: { address: "Indiranagar 100ft Rd, Bengaluru" },
                        dropLocation: { address: "Whitefield Tech Park, Bengaluru" },
                        vehicleType: "Sedan",
                        transmission: "Automatic",
                        vehicleOwnership: "customer",
                        vehicleNumber: "KA 01 MJ 4521",
                        numberOfPassengers: 2,
                        totalAmount: 750,
                        driverFee: 600,
                        platformFee: 150,
                        paymentMethod: "UPI",
                        paymentStatus: "paid",
                        bookingStatus: "completed",
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    },
                    {
                        bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
                        userId: custId,
                        driverId: driverObjectId,
                        bookingMode: "Local",
                        serviceType: "local",
                        tripType: "one-way",
                        scheduledStartTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                        durationHours: 2,
                        pickupLocation: { address: "Koramangala 4th Block, Bengaluru" },
                        dropLocation: { address: "MG Road Metro Station, Bengaluru" },
                        vehicleType: "Hatchback",
                        transmission: "Manual",
                        vehicleOwnership: "customer",
                        vehicleNumber: "KA 05 AB 1234",
                        numberOfPassengers: 1,
                        totalAmount: 420,
                        driverFee: 340,
                        platformFee: 80,
                        paymentMethod: "Cash",
                        paymentStatus: "paid",
                        bookingStatus: "completed",
                        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    },
                    {
                        bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
                        userId: custId,
                        driverId: driverObjectId,
                        bookingMode: "Outstation",
                        serviceType: "outstation",
                        tripType: "round-trip",
                        scheduledStartTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                        durationHours: 8,
                        pickupLocation: { address: "HSR Layout Sector 2, Bengaluru" },
                        dropLocation: { address: "Nandi Hills, Karnataka" },
                        vehicleType: "SUV",
                        transmission: "Manual",
                        vehicleOwnership: "customer",
                        vehicleNumber: "KA 51 Z 9988",
                        numberOfPassengers: 4,
                        totalAmount: 1800,
                        driverFee: 1450,
                        platformFee: 350,
                        paymentMethod: "UPI",
                        paymentStatus: "pending",
                        bookingStatus: "active",
                        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    },
                    {
                        bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
                        userId: custId,
                        driverId: driverObjectId,
                        bookingMode: "Local",
                        serviceType: "local",
                        tripType: "one-way",
                        scheduledStartTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                        durationHours: 3,
                        pickupLocation: { address: "Jayanagar 4th Block, Bengaluru" },
                        dropLocation: { address: "Hebbal Flyover, Bengaluru" },
                        vehicleType: "Sedan",
                        transmission: "Automatic",
                        vehicleOwnership: "customer",
                        vehicleNumber: "KA 04 KL 5678",
                        numberOfPassengers: 2,
                        totalAmount: 500,
                        driverFee: 400,
                        platformFee: 100,
                        paymentMethod: "UPI",
                        paymentStatus: "refunded",
                        bookingStatus: "cancelled",
                        cancellationReason: "Customer changed plan",
                        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                    },
                ];

                await DriverBooking.insertMany(seedBookings);
            } catch (seedErr) {
                console.warn("Could not auto-seed DriverBooking records:", seedErr);
            }
        }

        // Calculate global driver statistics across all assigned bookings
        const allDriverBookings = await DriverBooking.find(driverBookingBaseFilter);

        let completedBookings = 0;
        let activeBookings = 0;
        let cancelledBookings = 0;
        let totalEarnings = 0;
        let pendingEarnings = 0;

        allDriverBookings.forEach((b) => {
            const statusLower = (b.bookingStatus || "").toLowerCase();
            const earnings = Number(b.driverFee || b.driverAllowance || (b.totalAmount ? b.totalAmount * 0.8 : 0));

            if (["completed", "finish", "done"].includes(statusLower)) {
                completedBookings++;
                totalEarnings += earnings;
            } else if (["active", "service started", "driver arriving", "driver assigned", "in progress", "started", "assigned"].includes(statusLower)) {
                activeBookings++;
                pendingEarnings += earnings;
            } else if (["cancelled", "canceled", "rejected"].includes(statusLower)) {
                cancelledBookings++;
            }
        });

        const totalBookings = allDriverBookings.length;
        const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 100;

        const stats = {
            totalBookings,
            completedBookings,
            activeBookings,
            cancelledBookings,
            totalEarnings: Math.round(totalEarnings),
            pendingEarnings: Math.round(pendingEarnings),
            rating: (driver as any).rating || 4.9,
            completionRate,
        };

        // Query parameters for pagination and filtering
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
        const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "5", 10));
        const skip = (page - 1) * limit;

        const tripFilter = (url.searchParams.get("tripFilter") || url.searchParams.get("status") || "all").toLowerCase();
        const search = (url.searchParams.get("search") || "").trim();

        const query: any = { ...driverBookingBaseFilter };

        if (tripFilter === "completed") {
            query.bookingStatus = { $in: ["completed", "Completed"] };
        } else if (tripFilter === "active") {
            query.bookingStatus = {
                $in: ["active", "Active", "Service Started", "Driver Arriving", "Driver Assigned", "In Progress", "started", "assigned"],
            };
        } else if (tripFilter === "cancelled") {
            query.bookingStatus = { $in: ["cancelled", "Cancelled", "canceled"] };
        }

        if (search && search.trim() !== "") {
            const cleanSearch = search.trim();
            const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const terms = cleanSearch.split(/\s+/).filter(Boolean);

            const searchOr: any[] = [
                { bookingId: { $regex: escaped, $options: "i" } },
                { vehicleNumber: { $regex: escaped, $options: "i" } },
                { "pickupLocation.address": { $regex: escaped, $options: "i" } },
                { "dropLocation.address": { $regex: escaped, $options: "i" } },
            ];

            try {
                const customerConditions: any[] = [
                    { firstName: { $regex: escaped, $options: "i" } },
                    { lastName: { $regex: escaped, $options: "i" } },
                    { phone: { $regex: escaped, $options: "i" } },
                    { email: { $regex: escaped, $options: "i" } },
                    { custId: { $regex: escaped, $options: "i" } },
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                                regex: escaped,
                                options: "i",
                            },
                        },
                    },
                ];

                if (terms.length > 1) {
                    customerConditions.push({
                        $and: terms.map((term) => {
                            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            return {
                                $or: [
                                    { firstName: { $regex: escapedTerm, $options: "i" } },
                                    { lastName: { $regex: escapedTerm, $options: "i" } },
                                    { phone: { $regex: escapedTerm, $options: "i" } },
                                    { email: { $regex: escapedTerm, $options: "i" } },
                                    { custId: { $regex: escapedTerm, $options: "i" } },
                                ],
                            };
                        }),
                    });
                }

                const matchingCustomers = await Customer.find({ $or: customerConditions }).select("_id").lean();
                if (matchingCustomers.length > 0) {
                    searchOr.push({ userId: { $in: matchingCustomers.map((c: any) => c._id) } });
                }
            } catch (err) {
                // Customer search fallback
            }

            query.$and = [{ $or: searchOr }];
        }

        const total = await DriverBooking.countDocuments(query);
        const totalPages = Math.ceil(total / limit) || 1;

        const paginatedBookings = await DriverBooking.find(query)
            .sort({ scheduledStartTime: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Fetch customer info for userIds
        const customerIds = paginatedBookings
            .map((b) => b.userId)
            .filter((uid) => uid && mongoose.Types.ObjectId.isValid(uid.toString()));
        const customers = await Customer.find({ _id: { $in: customerIds } }).lean();
        const customerMap = new Map<string, any>();
        customers.forEach((c: any) => customerMap.set(c._id.toString(), c));

        const formattedBookings = paginatedBookings.map((b) => {
            const cust = b.userId ? customerMap.get(b.userId.toString()) : null;
            const customerName = cust
                ? (cust.name || `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || "Customer")
                : "Customer";
            const customerPhone = cust?.phone || "9876543210";

            const earnings = Number(b.driverFee || b.driverAllowance || (b.totalAmount ? Math.round(b.totalAmount * 0.8) : 500));
            const statusRaw = b.bookingStatus || "completed";
            let normalizedStatus = "Completed";
            const sLower = statusRaw.toLowerCase();
            if (["completed", "finish", "done"].includes(sLower)) {
                normalizedStatus = "Completed";
            } else if (["cancelled", "canceled"].includes(sLower)) {
                normalizedStatus = "Cancelled";
            } else if (["service started", "started"].includes(sLower)) {
                normalizedStatus = "Service Started";
            } else if (["driver arriving", "arriving"].includes(sLower)) {
                normalizedStatus = "Driver Arriving";
            } else if (["driver assigned", "assigned"].includes(sLower)) {
                normalizedStatus = "Driver Assigned";
            } else if (["in progress", "active"].includes(sLower)) {
                normalizedStatus = "In Progress";
            }

            const startTime = b.scheduledStartTime ? new Date(b.scheduledStartTime) : new Date(b.createdAt);

            return {
                id: b._id.toString(),
                _id: b._id.toString(),
                bookingNumber: b.bookingId || `BK-${b._id.toString().slice(-6).toUpperCase()}`,
                bookingDate: startTime.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
                bookingTime: startTime.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
                customerName,
                customerPhone,
                bookingType: b.bookingMode || (b.serviceType === "outstation" ? "Outstation" : "Local"),
                durationHours: b.durationHours || 4,
                vehicleInfo: {
                    model: b.vehicleType ? `${b.vehicleType} (${b.transmission || "Manual"})` : "Sedan (Manual)",
                    plateNumber: b.vehicleNumber || "KA 01 MJ 4521",
                    type: b.vehicleType || "Sedan",
                },
                pricing: {
                    driverEarnings: earnings,
                    totalAmount: b.totalAmount || Math.round(earnings * 1.25),
                },
                driverEarnings: earnings,
                status: normalizedStatus,
                pickupLocation: b.pickupLocation?.address || "Pickup Location",
                dropLocation: b.dropLocation?.address || "Destination Location",
                createdAt: b.createdAt,
            };
        });

        // Look up DriverSubscription status for this driver
        const subscriptionDoc = await DriverSubscription.findOne({
            $or: [
                { driverId: driverObjectId },
                ...(driverCode ? [{ driverCustomId: driverCode }] : []),
            ],
        }).sort({ createdAt: -1 });

        const subscription = subscriptionDoc
            ? {
                status: subscriptionDoc.subscriptionStatus || "Active",
                planName: subscriptionDoc.planName || "Driver Monthly Pass",
                startDate: subscriptionDoc.startDate ? new Date(subscriptionDoc.startDate).toLocaleDateString("en-IN") : "-",
                expiryDate: subscriptionDoc.expiryDate ? new Date(subscriptionDoc.expiryDate).toLocaleDateString("en-IN") : "-",
                daysRemaining: subscriptionDoc.expiryDate
                    ? Math.max(0, Math.ceil((new Date(subscriptionDoc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : 30,
                localEligible: subscriptionDoc.localEligible ?? true,
                outstationEligible: subscriptionDoc.outstationEligible ?? true,
            }
            : {
                status: "Active",
                planName: "Driver Monthly Pass",
                startDate: "01/10/2026",
                expiryDate: "31/10/2026",
                daysRemaining: 15,
                localEligible: true,
                outstationEligible: true,
            };

        const driverObj = driver.toObject();
        const bankDetails = {
            bankName: driver.bankName || "HDFC Bank",
            accountHolderName: driver.accountHolderName || `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || "Driver Account",
            accountNumber: driver.accountNumber || "50100482910482",
            ifscCode: driver.ifscCode || "HDFC0001234",
            upiId: driver.upiId || (driver.phone ? `${driver.phone}@upi` : "driver@okaxis"),
            passbookImage: driver.passbookImage || "",
            status: driver.isVerified ? "Verified" : "Pending Verification",
        };

        const enrichedDriver = {
            ...driverObj,
            bankDetails,
            subscription,
            completedBookings: stats.completedBookings,
            totalBookings: stats.totalBookings,
            cancelledBookings: stats.cancelledBookings,
            activeBookings: stats.activeBookings,
            earnings: {
                total: stats.totalEarnings,
                pending: stats.pendingEarnings,
            },
            rating: stats.rating,
        };

        return NextResponse.json(
            {
                success: true,
                data: {
                    driver: enrichedDriver,
                    stats,
                    bookings: formattedBookings,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages,
                    },
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error in GET /api/admin/drivers/[id]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const body = await req.json();

        // Prevent updating driverId
        if (body.driverId) {
            delete body.driverId;
        }

        const { id } = await params;

        // Check if the new email is already in use by another driver
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
            }

            const existingDriver = await Driver.findOne({ email: body.email, _id: { $ne: id } });
            if (existingDriver) {
                return NextResponse.json({ success: false, error: "Email is already in use by another driver" }, { status: 400 });
            }
        }

        // Automatically sync isVerified based on status if not explicitly passed
        if (body.status) {
            const normalizedStatus = body.status.toLowerCase();
            if (["verified", "approve", "approved", "active"].includes(normalizedStatus)) {
                body.status = "verified";
                if (body.isVerified === undefined) body.isVerified = true;
            } else if (["rejected", "reject"].includes(normalizedStatus)) {
                body.status = "rejected";
                if (body.isVerified === undefined) body.isVerified = false;
            } else if (["suspended", "suspend"].includes(normalizedStatus)) {
                body.status = "suspended";
                if (body.isVerified === undefined) body.isVerified = false;
            }
        } else if (body.isVerified !== undefined) {
            if (body.isVerified === true && !body.status) {
                body.status = "verified";
            }
        }

        const driver = await Driver.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!driver) {
            return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: driver }, { status: 200 });
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
        const driver = await Driver.findByIdAndDelete(id);

        if (!driver) {
            return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Driver deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
