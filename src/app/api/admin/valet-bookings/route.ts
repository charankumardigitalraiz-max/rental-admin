import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ValetBooking from "@/models/valetBooking";
import Customer from "@/models/customer";
import Driver from "@/models/driver";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * GET /api/admin/valet-bookings
 * List valet bookings using MongoDB aggregation pipeline with facet, count, and summary metrics.
 */
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

    const status = url.searchParams.get("status");
    if (status && status !== "All" && status !== "all") {
      const s = status.toLowerCase();
      if (s === "pending") {
        matchStage.status = {
          $in: ["new_request", "pending_assignment", "partially_assigned", "Pending", "pending"],
        };
      } else if (s === "in progress" || s === "in_progress") {
        matchStage.status = {
          $in: ["in_progress", "fully_assigned", "In Progress"],
        };
      } else if (s === "completed") {
        matchStage.status = {
          $in: ["completed", "Completed"],
        };
      } else if (s === "cancelled") {
        matchStage.status = {
          $in: ["cancelled", "Cancelled"],
        };
      } else {
        matchStage.status = status;
      }
    }

    const paymentStatus = url.searchParams.get("paymentStatus");
    if (paymentStatus && paymentStatus !== "All" && paymentStatus !== "all") {
      matchStage.paymentStatus = paymentStatus.toLowerCase();
    }

    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    if (startDate || endDate) {
      matchStage.eventDate = {};
      if (startDate) matchStage.eventDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.eventDate.$lte = end;
      }
    }

    const search = url.searchParams.get("search");
    if (search) {
      const orClauses: any[] = [
        { bookingId: { $regex: search, $options: "i" } },
        { eventName: { $regex: search, $options: "i" } },
        { venueName: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
      ];

      try {
        const CustomerModel = mongoose.models.Customer || mongoose.model("Customer");
        const matchingCustomers = await CustomerModel.find({
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { custId: { $regex: search, $options: "i" } },
          ],
        })
          .select("_id")
          .lean();

        if (matchingCustomers.length > 0) {
          orClauses.push({ userId: { $in: matchingCustomers.map((c: any) => c._id) } });
        }
      } catch (e) {
        // Fallback if Customer lookup fails
      }

      matchStage.$or = orClauses;
    }

    const [result] = await ValetBooking.aggregate([
      {
        $facet: {
          paginatedResults: [
            { $match: matchStage },
            { $sort: { eventDate: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "customers",
                localField: "userId",
                foreignField: "_id",
                as: "customer",
                pipeline: [
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                      email: 1,
                      phone: 1,
                      custId: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$customer",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "drivers",
                localField: "assignedStaffIds",
                foreignField: "_id",
                as: "assignedStaff",
                pipeline: [
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                      phone: 1,
                      driverId: 1,
                      profilePicture: 1,
                      rating: 1,
                    },
                  },
                ],
              },
            },
          ],
          filteredCount: [
            { $match: matchStage },
            { $count: "total" },
          ],
          globalCounts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                newRequests: {
                  $sum: { $cond: [{ $eq: ["$status", "new_request"] }, 1, 0] },
                },
                pendingAssignment: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$status",
                          ["pending_assignment", "partially_assigned"],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                inProgress: {
                  $sum: {
                    $cond: [
                      {
                        $in: ["$status", ["fully_assigned", "in_progress"]],
                      },
                      1,
                      0,
                    ],
                  },
                },
                completed: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                cancelled: {
                  $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                },
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $ne: ["$status", "cancelled"] },
                      { $ifNull: ["$pricing.totalAmount", 0] },
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
      newRequests: 0,
      pendingAssignment: 0,
      inProgress: 0,
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
    console.error("Admin valet bookings GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/valet-bookings
 * Admin direct creation of valet bookings.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    const newBooking = await ValetBooking.create(body);
    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error: any) {
    console.error("Admin valet booking POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
