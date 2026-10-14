import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import Customer from "@/models/customer";
import { verifyDriver } from "@/lib/auth";
import mongoose from "mongoose";

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

    const query: any = {
      driverId: new mongoose.Types.ObjectId(driverPayload.id),
    };

    // Filter by booking status if provided
    const bookingStatus = searchParams.get("bookingStatus");
    if (bookingStatus) {
      query.bookingStatus = bookingStatus;
    }

    // Filter by trip status (active, completed, cancelled)
    const status = searchParams.get("status");
    if (status) {
      if (status === "completed") {
        query.bookingStatus = "trip_completed";
      } else if (status === "cancelled") {
        query.bookingStatus = "cancelled";
      } else if (status === "active") {
        query.bookingStatus = {
          $in: ["driver_assigned", "driver_arriving", "driver_arrived", "trip_started", "confirmed"],
        };
      }
    }

    // Filter by service type (local / outstation)
    const serviceType = searchParams.get("serviceType");
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Filter by pricing type (e.g. km based)
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
    }

    const pipeline: any[] = [
      { $match: query },
      { $sort: { scheduledStartTime: -1, createdAt: -1 } },
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
    const bookings = result[0]?.data || [];

    return NextResponse.json(
      {
        success: true,
        data: {
          bookings,
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
    console.error("Error fetching driver bookings:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
