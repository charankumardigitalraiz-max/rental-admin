import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverToDriverBooking from "@/models/driverToDriverBooking";
import Driver from "@/models/driver";
import Customer from "@/models/customer";
import DriverBooking from "@/models/driverBooking";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * GET /api/admin/d-to-d-bookings
 * Fetches paginated Driver-to-Driver bookings with lookups for source driver, assigned driver, and customer.
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

    // Filter by sourceDriverId
    const sourceDriverId = url.searchParams.get("sourceDriverId");
    if (sourceDriverId && mongoose.Types.ObjectId.isValid(sourceDriverId)) {
      matchStage.sourceDriverId = new mongoose.Types.ObjectId(sourceDriverId);
    }

    // Filter by driverId (assigned driver)
    const driverId = url.searchParams.get("driverId");
    if (driverId && mongoose.Types.ObjectId.isValid(driverId)) {
      matchStage.driverId = new mongoose.Types.ObjectId(driverId);
    }

    // Filter by linked driverBookingId
    const driverBookingId = url.searchParams.get("driverBookingId") || url.searchParams.get("linkedBookingId");
    if (driverBookingId && mongoose.Types.ObjectId.isValid(driverBookingId)) {
      matchStage.driverBookingId = new mongoose.Types.ObjectId(driverBookingId);
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

    // Search query for bookingId, vehicle number, pickup/drop location, or driver info
    const search = url.searchParams.get("search");
    if (search && search.trim() !== "") {
      const cleanSearch = search.trim();
      const escapedSearch = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const orClauses: any[] = [
        { bookingId: { $regex: escapedSearch, $options: "i" } },
        { vehicleNumber: { $regex: escapedSearch, $options: "i" } },
        { "pickupLocation.address": { $regex: escapedSearch, $options: "i" } },
        { "dropLocation.address": { $regex: escapedSearch, $options: "i" } },
      ];

      try {
        const matchedDrivers = await Driver.find({
          $or: [
            { firstName: { $regex: escapedSearch, $options: "i" } },
            { lastName: { $regex: escapedSearch, $options: "i" } },
            { phone: { $regex: escapedSearch, $options: "i" } },
            { driverId: { $regex: escapedSearch, $options: "i" } },
          ],
        })
          .select("_id")
          .lean();

        if (matchedDrivers.length > 0) {
          const driverIds = matchedDrivers.map((d: any) => d._id);
          orClauses.push({ sourceDriverId: { $in: driverIds } });
          orClauses.push({ driverId: { $in: driverIds } });
        }
      } catch {
        // Driver search fallback
      }

      matchStage.$or = orClauses;
    }

    // Aggregation pipeline using $facet
    const [result] = await DriverToDriverBooking.aggregate([
      {
        $facet: {
          // 1. Paginated results
          paginatedResults: [
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            // Lookup Source Driver (requester)
            {
              $lookup: {
                from: "drivers",
                localField: "sourceDriverId",
                foreignField: "_id",
                as: "sourcedriverdetails",
                pipeline: [
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                      email: 1,
                      phone: 1,
                      driverId: 1,
                      profilePicture: 1,
                      rating: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$sourcedriverdetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            // Lookup Assigned Driver (fulfiller)
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
                      rating: 1,
                      status: 1,
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
            // Lookup Customer (if originated from a customer)
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
            // Lookup Original Driver Booking if linked
            {
              $lookup: {
                from: "driverbookings",
                localField: "driverBookingId",
                foreignField: "_id",
                as: "linkedbookingdetails",
                pipeline: [
                  {
                    $project: {
                      bookingId: 1,
                      serviceType: 1,
                      tripType: 1,
                      bookingStatus: 1,
                      totalAmount: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$linkedbookingdetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],

          // 2. Filtered Count
          filteredCount: [
            { $match: matchStage },
            { $count: "total" },
          ],

          // 3. Global Summary Metrics
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
                totalVolume: {
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
      totalVolume: 0,
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
    console.error("Admin D-to-D bookings GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/d-to-d-bookings
 * Admin manually creates a Driver-to-Driver booking (strictly zero platform charge)
 * Validates driver records, links optional customer DriverBooking, and populates full details in response.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      sourceDriverId,
      driverId,
      userId,
      driverBookingId,
      linkedBookingId,
      serviceType = "local",
      tripType = "one_way",
      bookingMode = "now",
      scheduledStartTime,
      durationHours,
      durationDays,
      pickupLocation,
      dropLocation,
      vehicleType = "sedan",
      transmission = "manual",
      vehicleNumber = "",
      baseAmount = 0,
      extraKmAmount = 0,
      driverAllowance = 0,
      driverFee = 0,
      taxAmount = 0,
      totalAmount = 0,
      paymentMethod = "cash",
      adminNotes = "",
    } = body;

    // 1. Verify Source Driver (Requester / Initiator)
    if (!sourceDriverId || !mongoose.Types.ObjectId.isValid(sourceDriverId)) {
      return NextResponse.json(
        { success: false, error: "A valid sourceDriverId ObjectId is required." },
        { status: 400 }
      );
    }

    const sourceDriver = await Driver.findById(sourceDriverId).lean();
    if (!sourceDriver) {
      return NextResponse.json(
        { success: false, error: `Source driver not found in database with ID: ${sourceDriverId}` },
        { status: 404 }
      );
    }

    // 2. Verify Assigned Fulfilling Driver (if provided)
    let validatedDriverId: mongoose.Types.ObjectId | null = null;
    let fulfillingDriver: any = null;
    if (driverId) {
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
        return NextResponse.json(
          { success: false, error: "Invalid driverId ObjectId format." },
          { status: 400 }
        );
      }
      if (driverId.toString() === sourceDriverId.toString()) {
        return NextResponse.json(
          { success: false, error: "Source driver cannot be assigned as the fulfilling driver for their own peer handoff." },
          { status: 400 }
        );
      }
      fulfillingDriver = await Driver.findById(driverId).lean();
      if (!fulfillingDriver) {
        return NextResponse.json(
          { success: false, error: `Assigned fulfilling driver not found in database with ID: ${driverId}` },
          { status: 404 }
        );
      }
      validatedDriverId = new mongoose.Types.ObjectId(driverId);
    }

    // 3. Verify and Link Original Customer DriverBooking (if provided)
    const targetBookingId = driverBookingId || linkedBookingId;
    let linkedBookingDoc: any = null;
    let validatedBookingId: mongoose.Types.ObjectId | null = null;
    if (targetBookingId) {
      linkedBookingDoc = await DriverBooking.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(targetBookingId) ? [{ _id: new mongoose.Types.ObjectId(targetBookingId) }] : []),
          { bookingId: targetBookingId },
        ],
      });

      if (!linkedBookingDoc) {
        return NextResponse.json(
          { success: false, error: `Linked customer driver booking not found with identifier: ${targetBookingId}` },
          { status: 404 }
        );
      }
      validatedBookingId = linkedBookingDoc._id;
    }

    // 4. Verify Customer / User (if provided directly or derived from linked booking)
    const effectiveUserId = userId || linkedBookingDoc?.userId;
    let validatedUserId: mongoose.Types.ObjectId | null = null;
    if (effectiveUserId) {
      if (!mongoose.Types.ObjectId.isValid(effectiveUserId)) {
        return NextResponse.json(
          { success: false, error: "Invalid userId ObjectId format." },
          { status: 400 }
        );
      }
      const customerDoc = await Customer.findById(effectiveUserId).lean();
      if (!customerDoc) {
        return NextResponse.json(
          { success: false, error: `Customer not found with ID: ${effectiveUserId}` },
          { status: 404 }
        );
      }
      validatedUserId = new mongoose.Types.ObjectId(effectiveUserId);
    }

    // 5. Normalize pickupLocation and dropLocation (with fallback to linked booking)
    const rawPickup = pickupLocation || linkedBookingDoc?.pickupLocation;
    let pickupCoords = [0, 0];
    if (rawPickup?.location?.coordinates && Array.isArray(rawPickup.location.coordinates) && rawPickup.location.coordinates.length === 2) {
      pickupCoords = [Number(rawPickup.location.coordinates[0]) || 0, Number(rawPickup.location.coordinates[1]) || 0];
    } else if (rawPickup?.coordinates && Array.isArray(rawPickup.coordinates) && rawPickup.coordinates.length === 2) {
      pickupCoords = [Number(rawPickup.coordinates[0]) || 0, Number(rawPickup.coordinates[1]) || 0];
    } else if (rawPickup?.longitude !== undefined && rawPickup?.latitude !== undefined) {
      pickupCoords = [Number(rawPickup.longitude) || 0, Number(rawPickup.latitude) || 0];
    }

    const normalizedPickup = {
      address: rawPickup?.address || "Pickup Point",
      location: {
        type: "Point",
        coordinates: pickupCoords,
      },
    };

    const rawDrop = dropLocation || linkedBookingDoc?.dropLocation;
    let dropCoords = [0, 0];
    if (rawDrop?.location?.coordinates && Array.isArray(rawDrop.location.coordinates) && rawDrop.location.coordinates.length === 2) {
      dropCoords = [Number(rawDrop.location.coordinates[0]) || 0, Number(rawDrop.location.coordinates[1]) || 0];
    } else if (rawDrop?.coordinates && Array.isArray(rawDrop.coordinates) && rawDrop.coordinates.length === 2) {
      dropCoords = [Number(rawDrop.coordinates[0]) || 0, Number(rawDrop.coordinates[1]) || 0];
    } else if (rawDrop?.longitude !== undefined && rawDrop?.latitude !== undefined) {
      dropCoords = [Number(rawDrop.longitude) || 0, Number(rawDrop.latitude) || 0];
    }

    const normalizedDrop = {
      address: rawDrop?.address || "",
      location: {
        type: "Point",
        coordinates: dropCoords,
      },
    };

    // 6. Inherit trip & vehicle details from linked booking if not specified
    const effectiveServiceType = serviceType || linkedBookingDoc?.serviceType || "local";
    const effectiveTripType = tripType || linkedBookingDoc?.tripType || "one_way";
    const effectiveVehicleType = vehicleType || linkedBookingDoc?.vehicleType || "sedan";
    const effectiveTransmission = transmission || linkedBookingDoc?.transmission || "manual";
    const effectiveVehicleNumber = vehicleNumber || linkedBookingDoc?.vehicleNumber || "";

    const calculatedBaseAmount = Number(baseAmount) || Number(linkedBookingDoc?.baseAmount) || 0;
    const calculatedExtraKmAmount = Number(extraKmAmount) || Number(linkedBookingDoc?.extraKmAmount) || 0;
    const calculatedDriverAllowance = Number(driverAllowance) || Number(linkedBookingDoc?.driverAllowance) || 0;
    const calculatedDriverFee = Number(driverFee) || Number(linkedBookingDoc?.driverFee) || 0;
    const calculatedTaxAmount = Number(taxAmount) || Number(linkedBookingDoc?.taxAmount) || 0;
    const calculatedTotalAmount =
      Number(totalAmount) ||
      (calculatedBaseAmount + calculatedExtraKmAmount + calculatedDriverAllowance + calculatedDriverFee + calculatedTaxAmount);

    // 7. Enforce 0 platform fee for D-to-D bookings
    const newBooking = await DriverToDriverBooking.create({
      sourceDriverId: new mongoose.Types.ObjectId(sourceDriverId),
      driverId: validatedDriverId,
      userId: validatedUserId,
      driverBookingId: validatedBookingId,
      serviceType: effectiveServiceType,
      tripType: effectiveTripType,
      bookingMode,
      scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : (linkedBookingDoc?.scheduledStartTime || new Date()),
      durationHours: effectiveServiceType === "local" ? Number(durationHours) || Number(linkedBookingDoc?.durationHours) || 2 : null,
      durationDays: effectiveServiceType === "outstation" ? Number(durationDays) || Number(linkedBookingDoc?.durationDays) || 1 : null,
      pickupLocation: normalizedPickup,
      dropLocation: normalizedDrop,
      vehicleType: effectiveVehicleType,
      transmission: effectiveTransmission,
      vehicleNumber: effectiveVehicleNumber,
      baseAmount: calculatedBaseAmount,
      extraKmAmount: calculatedExtraKmAmount,
      driverAllowance: calculatedDriverAllowance,
      driverFee: calculatedDriverFee,
      platformFee: 0, // STRICTLY ZERO PLATFORM FEE
      taxAmount: calculatedTaxAmount,
      totalAmount: calculatedTotalAmount,
      paymentMethod,
      bookingStatus: validatedDriverId ? "driver_assigned" : "pending",
      driverAssignedAt: validatedDriverId ? new Date() : null,
      adminNotes: adminNotes || (linkedBookingDoc ? `Created as peer handoff from DriverBooking ${linkedBookingDoc.bookingId}` : ""),
    });

    // 8. Update linked DriverBooking with peer delegation note
    if (linkedBookingDoc) {
      try {
        const updateNote = `Handed off to peer driver via D2D booking ${newBooking.bookingId}`;
        await DriverBooking.findByIdAndUpdate(linkedBookingDoc._id, {
          adminNotes: linkedBookingDoc.adminNotes ? `${linkedBookingDoc.adminNotes} | ${updateNote}` : updateNote,
        });
      } catch (err) {
        console.warn("Could not update linked DriverBooking note:", err);
      }
    }

    // 9. Query created booking with full lookups for drivers, customer, and linked booking
    const [populatedBooking] = await DriverToDriverBooking.aggregate([
      { $match: { _id: newBooking._id } },
      // Lookup Source Driver
      {
        $lookup: {
          from: "drivers",
          localField: "sourceDriverId",
          foreignField: "_id",
          as: "sourcedriverdetails",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                driverId: 1,
                profilePicture: 1,
                rating: 1,
                status: 1,
                licenseNumber: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$sourcedriverdetails", preserveNullAndEmptyArrays: true } },
      // Lookup Assigned Fulfilling Driver
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
                rating: 1,
                status: 1,
                licenseNumber: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$driverdetails", preserveNullAndEmptyArrays: true } },
      // Lookup Customer
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
              },
            },
          ],
        },
      },
      { $unwind: { path: "$userdetails", preserveNullAndEmptyArrays: true } },
      // Lookup Original Driver Booking
      {
        $lookup: {
          from: "driverbookings",
          localField: "driverBookingId",
          foreignField: "_id",
          as: "linkedbookingdetails",
          pipeline: [
            {
              $project: {
                bookingId: 1,
                serviceType: 1,
                tripType: 1,
                bookingStatus: 1,
                totalAmount: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$linkedbookingdetails", preserveNullAndEmptyArrays: true } },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: populatedBooking || newBooking,
        message: "Driver-to-Driver booking created successfully with 0 platform charge.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin D-to-D bookings POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create D-to-D booking" },
      { status: 500 }
    );
  }
}
