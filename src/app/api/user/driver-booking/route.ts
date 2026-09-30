import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverBooking from "@/models/driverBooking";
import DriverPricing from "@/models/driverPricing";
import { verifyUser } from "@/lib/auth";

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
