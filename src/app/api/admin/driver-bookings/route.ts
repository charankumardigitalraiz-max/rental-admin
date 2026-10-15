import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const matchStage: any = {};

    // Filter by booking status
    const status = url.searchParams.get("status") || url.searchParams.get("bookingStatus");
    if (status && status !== "All") {
      matchStage.bookingStatus = status;
    }

    // Filter by service type (local, outstation)
    const serviceType = url.searchParams.get("serviceType") || url.searchParams.get("type");
    if (serviceType && serviceType !== "All") {
      matchStage.serviceType = serviceType.toLowerCase();
    }

    // Filter by payment status
    const paymentStatus = url.searchParams.get("paymentStatus");
    if (paymentStatus && paymentStatus !== "All") {
      matchStage.paymentStatus = paymentStatus.toLowerCase();
    }

    // Filter by driverId
    const driverId = url.searchParams.get("driverId");
    if (driverId && mongoose.Types.ObjectId.isValid(driverId)) {
      matchStage.driverId = new mongoose.Types.ObjectId(driverId);
    }

    // Filter by userId / customerId
    const userId = url.searchParams.get("userId") || url.searchParams.get("customerId");
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      matchStage.userId = new mongoose.Types.ObjectId(userId);
    }

    // Date range filter on scheduledStartTime
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    if (startDate || endDate) {
      matchStage.scheduledStartTime = {};
      if (startDate) matchStage.scheduledStartTime.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.scheduledStartTime.$lte = end;
      }
    }

    // Search query for bookingId or vehicle number
    const search = url.searchParams.get("search");
    if (search) {
      matchStage.$or = [
        { bookingId: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
        { "pickupLocation.address": { $regex: search, $options: "i" } },
        { "dropLocation.address": { $regex: search, $options: "i" } },
      ];
    }

    // Aggregation pipeline using $facet to fetch paginated data, total counts, and summary metrics in a single query
    const [result] = await DriverBooking.aggregate([
      {
        $facet: {
          // 1. Paginated Bookings List with Lookups
          paginatedResults: [
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            // Lookup customer (userId)
            {
              $lookup: {
                from: "customers",
                localField: "userId",
                foreignField: "_id",
                as: "userdetails",
                pipeline: [
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                      email: 1,
                      phone: 1,
                      custId: 1,
                      avatar: 1,
                      profileImage: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$userdetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            // Lookup driver (driverId)
            {
              $lookup: {
                from: "drivers",
                localField: "driverId",
                foreignField: "_id",
                as: "driverdetails",
                pipeline: [
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                      email: 1,
                      phone: 1,
                      driverId: 1,
                      profilePicture: 1,
                      status: 1,
                      vehicle: 1,
                      rating: 1,
                      licenseNumber: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$driverdetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],

          // 2. Filtered Count for current filters
          filteredCount: [
            { $match: matchStage },
            { $count: "total" },
          ],

          // 3. Global Summary Counts for dashboard cards across all records
          globalCounts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                pending: {
                  $sum: {
                    $cond: [
                      { $in: ["$bookingStatus", ["pending", "confirmed"]] },
                      1,
                      0,
                    ],
                  },
                },
                active: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$bookingStatus",
                          [
                            "driver_assigned",
                            "driver_arriving",
                            "driver_arrived",
                            "trip_started",
                          ],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                completed: {
                  $sum: {
                    $cond: [{ $eq: ["$bookingStatus", "trip_completed"] }, 1, 0],
                  },
                },
                cancelled: {
                  $sum: {
                    $cond: [{ $eq: ["$bookingStatus", "cancelled"] }, 1, 0],
                  },
                },
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $ne: ["$bookingStatus", "cancelled"] },
                      { $ifNull: ["$totalAmount", 0] },
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const bookings = result?.paginatedResults || [];
    const totalFiltered = result?.filteredCount?.[0]?.total || 0;
    const counts = result?.globalCounts?.[0] || {
      total: 0,
      pending: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0,
    };
    delete counts._id;

    return NextResponse.json(
      {
        success: true,
        data: bookings,
        counts,
        pagination: {
          page,
          limit,
          total: totalFiltered,
          totalPages: Math.ceil(totalFiltered / limit) || 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin driver bookings aggregation GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
