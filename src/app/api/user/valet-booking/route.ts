import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ValetBooking from "@/models/valetBooking";
import DriverPricing from "@/models/driverPricing";
import Customer from "@/models/customer";
import Admin from "@/models/admin";
import { verifyUser } from "@/lib/auth";
import { dispatchNotification } from "@/lib/notifications";

/**
 * POST /api/user/valet-booking
 * Create a new Valet Parking Booking from customer side.
 */
export async function POST(req: NextRequest) {
  try {
    const userPayload: any = verifyUser(req);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing user token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      eventName,
      eventType,
      eventDate,
      startTime,
      endTime,
      hours,
      person,
      location,
      venueName,
      specialInstructions,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!eventName || !eventDate || !location) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: eventName, eventDate, and location are required.",
        },
        { status: 400 }
      );
    }

    // Validate location structure
    if (!location.address) {
      return NextResponse.json(
        { success: false, message: "location.address is required." },
        { status: 400 }
      );
    }

    const coordinates = Array.isArray(location.coordinates) && location.coordinates.length === 2
      ? location.coordinates
      : [77.5946, 12.9716]; // Default fallback coordinates (Indiranagar / Bengaluru)

    const numHours = Number(hours) || 4;
    const numPerson = Number(person) || 1;

    await connectToDatabase();

    // Check pricing config in DB
    const pricingConfig = await DriverPricing.findOne({});
    const valetPriceConf = pricingConfig?.valletparking;

    const basePersonPrice = valetPriceConf?.customerprice || 600;
    const baseDriverPayout = valetPriceConf?.driverprice || 480;
    const standardHours = valetPriceConf?.hours || 4;
    const standardPersons = valetPriceConf?.person || 1;

    // Calculate rates per person-hour
    const pricePerPersonPerHour = basePersonPrice / (standardHours * standardPersons || 1);
    const driverPayoutPerPersonPerHour = baseDriverPayout / (standardHours * standardPersons || 1);

    const calculatedCustomerPrice = Math.round(pricePerPersonPerHour * numPerson * numHours);
    const calculatedDriverPayout = Math.round(driverPayoutPerPersonPerHour * numPerson * numHours);
    const taxAmount = Math.round(calculatedCustomerPrice * 0.18);
    const totalAmount = calculatedCustomerPrice + taxAmount;
    const platformCommission = Math.max(0, calculatedCustomerPrice - calculatedDriverPayout);

    // Create Valet Booking document
    const newBooking = await ValetBooking.create({
      userId: userPayload.id,
      eventName: eventName.trim(),
      eventType: eventType || "general",
      eventDate: new Date(eventDate),
      startTime: startTime || "18:00",
      endTime: endTime || "22:00",
      hours: numHours,
      person: numPerson,
      location: {
        type: "Point",
        coordinates,
        address: location.address.trim(),
      },
      address: body.address ? body.address.trim() : location.address.trim(),
      venueName: venueName || "",
      specialInstructions: specialInstructions || "",
      pricing: {
        customerPrice: calculatedCustomerPrice,
        driverPrice: calculatedDriverPayout,
        taxAmount,
        totalAmount,
        staffPayoutTotal: calculatedDriverPayout,
        platformCommission,
      },
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "online",
      status: "new_request",
    });

    // Send push notification to Admin
    dispatchNotification({
      title: `New Valet Booking Request #${newBooking.bookingId || "New"}`,
      message: `Event "${eventName}" on ${new Date(eventDate).toLocaleDateString()} (${startTime || "18:00"} - ${endTime || "22:00"}). Requested staff: ${numPerson}. Tap to review and assign staff.`,
      targetAudience: "Admin",
      type: "Booking",
      data: {
        bookingId: String(newBooking._id),
        bookingCode: String(newBooking.bookingId || ""),
        eventName: String(eventName),
        serviceType: "valet_parking",
        personCount: String(numPerson),
        hours: String(numHours),
        url: `/admin/valet-parking?bookingId=${newBooking._id}`,
      },
      sentBy: "Customer Booking Engine",
    }).catch((err) => console.warn("[ValetBooking] Admin push notification warning:", err?.message));

    return NextResponse.json(
      {
        success: true,
        message: "Valet parking booking created successfully",
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user valet booking:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/valet-booking
 * List user's valet parking bookings.
 */
export async function GET(req: NextRequest) {
  try {
    const userPayload: any = verifyUser(req);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing user token" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const query: any = { userId: userPayload.id };
    const status = url.searchParams.get("status");
    if (status && status !== "All") {
      query.status = status;
    }

    const bookings = await ValetBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ValetBooking.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: bookings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching user valet bookings:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
