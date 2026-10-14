import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import Customer from "@/models/customer";
import { verifyDriver } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * GET /api/driver/bookings/[id]
 * Fetch detailed information for a specific driver booking.
 * Can be fetched using either MongoDB _id or custom bookingId (e.g. BKG-123456).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const driverPayload: any = verifyDriver(request);

    if (!driverPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing driver token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const driverObjectId = new mongoose.Types.ObjectId(driverPayload.id);

    // Build matching criteria:
    // Support MongoDB ObjectId OR string bookingId, must belong to the driver
    const matchCriteria: any = {
      driverId: driverObjectId,
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null },
        { bookingId: id },
      ],
    };

    const pipeline: any[] = [
      { $match: matchCriteria },
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
                address: 1,
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
    ];

    const bookings = await DriverBooking.aggregate(pipeline);

    if (!bookings || bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "Booking not found or not assigned to this driver" },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          booking,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching driver booking details:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
