import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import DriverPricing from "@/models/driverPricing";
import Customer from "@/models/customer";
import { verifyUser } from "@/lib/auth";
import { emitNewAvailableRide } from "@/lib/socket";
import { dispatchNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const userPayload: any = verifyUser(request);

    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    body.userId = userPayload.id;

    const {
      serviceType,
      tripType,
      scheduledStartTime,
    } = body;

    // Validate required fields
    if (!serviceType || !tripType || !scheduledStartTime) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: serviceType, tripType, and scheduledStartTime are required.",
        },
        { status: 400 }
      );
    }

    // You can add more complex validations here (e.g., if serviceType is 'local', durationHours must exist)
    if (serviceType === "local" && !body.durationHours) {
      return NextResponse.json(
        { success: false, message: "durationHours is required for local service type." },
        { status: 400 }
      );
    }

    if (serviceType === "outstation" && !body.durationDays) {
      return NextResponse.json(
        { success: false, message: "durationDays is required for outstation service type." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch pricing configuration
    const pricing = await DriverPricing.findOne({});
    if (!pricing) {
      return NextResponse.json(
        { success: false, message: "Pricing configuration not found." },
        { status: 500 }
      );
    }

    let baseAmount = 0;
    let driverFee = 0;

    if (serviceType === "local") {
      const localPricing = pricing.local[tripType as "one_way" | "round_trip"];
      if (!localPricing) {
        return NextResponse.json(
          { success: false, message: "Invalid trip type for local service." },
          { status: 400 }
        );
      }

      const date = new Date(scheduledStartTime);
      const hour = date.getHours();

      // Parse timeRange e.g., "06:00-18:00"
      const parseTime = (timeStr: string) => parseInt(timeStr.split(":")[0]);
      const [morningStart, morningEnd] = localPricing.morningHours.timeRange.split("-").map(parseTime);

      let pricingTier;
      if (hour >= morningStart && hour < morningEnd) {
        pricingTier = localPricing.morningHours;
      } else {
        pricingTier = localPricing.nightHours;
      }

      // Calculate based on requested duration vs package hours (simplistic assumption)
      const durationRatio = body.durationHours ? Math.ceil(body.durationHours / pricingTier.hours) : 1;
      baseAmount = pricingTier.customerPrice * durationRatio;
      driverFee = pricingTier.driverPrice * durationRatio;

    } else if (serviceType === "outstation") {
      const outstationPricing = pricing.outstation[tripType as "one_way" | "round_trip"];
      if (!outstationPricing) {
        return NextResponse.json(
          { success: false, message: "Invalid trip type for outstation service." },
          { status: 400 }
        );
      }

      const daysRatio = body.durationDays ? Math.ceil(body.durationDays / outstationPricing.day) : 1;
      baseAmount = outstationPricing.customerPrice * daysRatio;
      driverFee = outstationPricing.driverPrice * daysRatio;
    }

    body.pricingId = pricing._id;
    body.baseAmount = baseAmount;
    body.driverFee = driverFee;

    // Add tax and calculate total
    const taxRate = 0.05; // Assuming 5% tax, can be adjusted
    let taxType = body.taxType ?? "exclusive";

    if (taxType === "inclusive") {
      body.totalAmount = baseAmount;
      body.taxAmount = baseAmount - (baseAmount / (1 + taxRate));
      body.baseAmount = baseAmount - body.taxAmount; // Adjust base amount to be pre-tax
    } else {
      // default to exclusive
      body.taxAmount = baseAmount * taxRate;
      body.totalAmount = baseAmount + body.taxAmount;
      body.baseAmount = baseAmount;
    }

    // Create the booking in the database
    const newBooking = await DriverBooking.create(body);

    // Fetch customer details to broadcast complete ride info to drivers
    const customer = await Customer.findById(userPayload.id).select("firstName lastName phone email custId").lean();

    // Broadcast in real-time to all connected drivers
    emitNewAvailableRide({
      _id: newBooking._id,
      bookingId: newBooking.bookingId,
      serviceType: newBooking.serviceType,
      tripType: newBooking.tripType,
      scheduledStartTime: newBooking.scheduledStartTime,
      durationHours: newBooking.durationHours,
      durationDays: newBooking.durationDays,
      pickupLocation: newBooking.pickupLocation,
      dropLocation: newBooking.dropLocation,
      vehicleType: newBooking.vehicleType,
      baseAmount: newBooking.baseAmount,
      totalAmount: newBooking.totalAmount,
      estimatedDistance: newBooking.estimatedDistance || 0,
      isKmBased: (newBooking.estimatedDistance && newBooking.estimatedDistance > 0) || (newBooking.extraKmAmount && newBooking.extraKmAmount > 0) || false,
      distanceKm: newBooking.estimatedDistance || 0,
      bookingStatus: newBooking.bookingStatus,
      userDetails: customer || null,
      createdAt: newBooking.createdAt,
    });
    // Trigger Firebase push notification to drivers and system
    dispatchNotification({
      title: `New Booking Request #${newBooking.bookingId || 'New'}`,
      message: `${serviceType.toUpperCase()} trip requested for ${new Date(scheduledStartTime).toLocaleString()}. Tap to view details.`,
      targetAudience: 'Drivers',
      type: 'Booking',
      data: {
        bookingId: String(newBooking._id),
        serviceType: String(serviceType),
        tripType: String(tripType),
      },
      sentBy: 'System Booking Engine',
    }).catch((err) => console.warn('[DriverBooking] Firebase push warning:', err?.message));

    return NextResponse.json(
      {
        success: true,
        message: "Driver booking created successfully",
        booking: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating driver booking:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const userPayload: any = verifyUser(request);

    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build Query
    // Aggregation pipelines do not auto-cast strings to ObjectIds, so we must manually cast it
    const mongoose = require("mongoose");
    const query: any = {
      userId: mongoose.Types.ObjectId.isValid(userPayload.id)
        ? new mongoose.Types.ObjectId(userPayload.id)
        : userPayload.id
    };
    const andConditions: any[] = [];

    // Status Filter (checks status OR bookingMode)
    const status = searchParams.get("status");
    if (status) {
      andConditions.push({
        $or: [{ status: status }, { bookingMode: status }]
      });
    }

    // Date Range Filter (based on createdAt or scheduledStartTime)
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search (e.g., searching by serviceType, tripType, or booking ID if applicable)
    const search = searchParams.get("search");
    if (search) {
      andConditions.push({
        $or: [
          { serviceType: { $regex: search, $options: "i" } },
          { tripType: { $regex: search, $options: "i" } },
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Aggregation pipeline for bookings
    const pipeline: any[] = [
      { $match: query },
      { $sort: { createdAt: -1 } },
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
