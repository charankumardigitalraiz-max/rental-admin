import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import Customer from "@/models/customer";
import { verifyDriver } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * GET /api/driver/available-rides
 * Dedicated endpoint for drivers to view rides available to be accepted.
 *
 * Query parameters:
 *  - pricingType: "km" | "hourly" | "outstation" (filters by pricing/distance model)
 *  - serviceType: "local" | "outstation"
 *  - tripType: "one_way" | "round_trip"
 *  - page, limit: pagination
 */
export async function GET(request: Request) {
  try {

    const driverPayload: any = verifyDriver(request);


    if (!driverPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing driver token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Available rides condition: not yet assigned to any driver, not rejected by this driver (multi-driver support), and in pending/confirmed status
    const driverObjectId = new mongoose.Types.ObjectId(driverPayload.id);
    const query: any = {
      bookingStatus: { $in: ["pending", "confirmed"] },
      $or: [{ driverId: null }, { driverId: { $exists: false } }],
      "rejectedDrivers.driverId": { $nin: [driverObjectId] },
      rejectedDrivers: { $nin: [driverObjectId] },
    };

    // Filter by pricing type:
    // "km": rides that have estimatedDistance > 0 or extraKmAmount
    // "hourly": local rides based on durationHours
    // "outstation": outstation rides based on durationDays
    const pricingType = searchParams.get("pricingType")?.toLowerCase();
    if (pricingType === "km") {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { estimatedDistance: { $gt: 0 } },
            { actualDistance: { $gt: 0 } },
            { extraKmAmount: { $gt: 0 } },
          ],
        },
      ];
    } else if (pricingType === "hourly" || pricingType === "time") {
      query.serviceType = "local";
      query.durationHours = { $gt: 0 };
    } else if (pricingType === "outstation") {
      query.serviceType = "outstation";
    }

    // Filter by serviceType (local | outstation)
    const serviceType = searchParams.get("serviceType");
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Filter by tripType (one_way | round_trip)
    const tripType = searchParams.get("tripType");
    if (tripType) {
      query.tripType = tripType;
    }
    // scheduledStartTime: 1, 
    const pipeline: any[] = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "customers",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                phone: 1,
                email: 1,
                custId: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          userDetails: { $arrayElemAt: ["$userDetails", 0] },
          isKmBased: {
            $or: [
              { $gt: [{ $ifNull: ["$estimatedDistance", 0] }, 0] },
              { $gt: [{ $ifNull: ["$extraKmAmount", 0] }, 0] },
            ],
          },
          distanceKm: { $ifNull: ["$estimatedDistance", 0] },
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await DriverBooking.aggregate(pipeline);

    const totalBookings = result[0]?.metadata[0]?.total || 0;
    const rides = result[0]?.data || [];

    return NextResponse.json(
      {
        success: true,
        data: {
          rides,
          pagination: {
            total: totalBookings,
            page,
            limit,
            totalPages: Math.ceil(totalBookings / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching available rides:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
