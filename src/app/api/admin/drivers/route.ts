import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const matchQuery: any = {};

        const search = url.searchParams.get("search");
        if (search && search.trim() !== "") {
            const cleanSearch = search.trim();
            const escapedSearch = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const terms = cleanSearch.split(/\s+/).filter(Boolean);

            const searchOrConditions: any[] = [
                { firstName: { $regex: escapedSearch, $options: "i" } },
                { lastName: { $regex: escapedSearch, $options: "i" } },
                { email: { $regex: escapedSearch, $options: "i" } },
                { phone: { $regex: escapedSearch, $options: "i" } },
                { driverId: { $regex: escapedSearch, $options: "i" } },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                            regex: escapedSearch,
                            options: "i"
                        }
                    }
                }
            ];

            if (terms.length > 1) {
                searchOrConditions.push({
                    $and: terms.map(term => {
                        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        return {
                            $or: [
                                { firstName: { $regex: escapedTerm, $options: "i" } },
                                { lastName: { $regex: escapedTerm, $options: "i" } },
                                { email: { $regex: escapedTerm, $options: "i" } },
                                { phone: { $regex: escapedTerm, $options: "i" } },
                                { driverId: { $regex: escapedTerm, $options: "i" } }
                            ]
                        };
                    })
                });
            }

            matchQuery.$or = searchOrConditions;
        }

        const status = url.searchParams.get("status");
        if (status && status !== "all" && status !== "All") {
            const s = status.toLowerCase();
            if (s === "pending" || s === "pending approval" || s === "pending-approval") {
                matchQuery.status = "pending";
            } else if (s === "approved" || s === "verified") {
                matchQuery.status = "verified";
            } else if (s === "online" || s === "duty") {
                matchQuery.isOnline = true;
            } else if (s === "offline") {
                matchQuery.isOnline = false;
            } else if (s === "suspended") {
                matchQuery.status = { $in: ["suspended", "rejected"] };
            } else if (s === "rejected") {
                matchQuery.status = "rejected";
            } else {
                matchQuery.status = status;
            }
        }

        const isOnlineParam = url.searchParams.get("isOnline");
        if (isOnlineParam !== null) {
            matchQuery.isOnline = isOnlineParam === "true";
        }

        const pipeline: any[] = [
            { $match: matchQuery },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "driverbookings",
                                let: { dId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$driverId", "$$dId"] },
                                                    { $eq: ["$bookingStatus", "trip_completed"] }
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: null,
                                            completedTrips: { $sum: 1 },
                                            totalEarnings: {
                                                $sum: {
                                                    $add: [
                                                        { $ifNull: ["$driverFee", 0] },
                                                        { $ifNull: ["$driverAllowance", 0] }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                ],
                                as: "tripStats"
                            }
                        },
                        {
                            $addFields: {
                                completedTrips: {
                                    $ifNull: [{ $arrayElemAt: ["$tripStats.completedTrips", 0] }, 0]
                                },
                                totalEarnings: {
                                    $ifNull: [{ $arrayElemAt: ["$tripStats.totalEarnings", 0] }, 0]
                                }
                            }
                        },
                        {
                            $project: {
                                tripStats: 0
                            }
                        }
                    ]
                }
            }
        ];

        const [aggregateResult, totalDrivers, activeDrivers, pendingDrivers, onlineDrivers, suspendedDrivers] = await Promise.all([
            Driver.aggregate(pipeline),
            Driver.countDocuments(),
            Driver.countDocuments({ status: "verified" }),
            Driver.countDocuments({ status: "pending" }),
            Driver.countDocuments({ isOnline: true }),
            Driver.countDocuments({ status: { $in: ["suspended", "rejected"] } })
        ]);

        const drivers = aggregateResult[0]?.data || [];
        const filteredTotal = aggregateResult[0]?.metadata[0]?.total || 0;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newDriversThisMonth = await Driver.countDocuments({ createdAt: { $gte: startOfMonth } });

        return NextResponse.json({
            success: true,
            data: {
                drivers,
                counts: {
                    total: totalDrivers,
                    approved: activeDrivers,
                    pending: pendingDrivers,
                    online: onlineDrivers,
                    suspended: suspendedDrivers,
                    active: activeDrivers,
                    inactive: suspendedDrivers,
                    newThisMonth: newDriversThisMonth
                },
                pagination: {
                    total: filteredTotal,
                    page,
                    limit,
                    totalPages: Math.ceil(filteredTotal / limit)
                }
            },

        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = verifyAdmin(req);
        if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const body = await req.json();
        const { firstName, lastName, email, phone, address, licenseNumber, status } = body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
        }

        // Check if driver with this email already exists
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return NextResponse.json({ success: false, error: "Driver with this email already exists" }, { status: 400 });
        }

        // Generate driverId (e.g., DR20240001)
        const year = new Date().getFullYear();
        const prefix = `DR${year}`;

        const lastDriver = await Driver.findOne({ driverId: new RegExp(`^${prefix}`) })
            .sort({ driverId: -1 })
            .select("driverId");

        let sequence = 1;
        if (lastDriver && lastDriver.driverId) {
            const lastSequenceStr = lastDriver.driverId.replace(prefix, "");
            const lastSequence = parseInt(lastSequenceStr, 10);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }

        const driverId = `${prefix}${sequence.toString().padStart(4, "0")}`;

        // Create new driver
        const isVerified = status && ["verified", "approved", "active"].includes(status.toLowerCase()) ? true : false;

        const newDriver = await Driver.create({
            firstName,
            lastName,
            driverId,
            email,
            phone,
            address,
            licenseNumber,
            status: status !== undefined ? status : "pending",
            isVerified,
        });

        return NextResponse.json({ success: true, data: newDriver }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
