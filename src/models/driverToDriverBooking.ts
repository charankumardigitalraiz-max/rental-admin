import mongoose, { Schema, Document } from "mongoose";

export interface DriverToDriverBookingInterface extends Document {
    bookingId: string;

    // The driver requesting / handing off the booking
    sourceDriverId: mongoose.Types.ObjectId;

    // The driver assigned / accepting the booking
    driverId?: mongoose.Types.ObjectId | null;

    // Optional reference to original customer if available
    userId?: mongoose.Types.ObjectId | null;

    // Optional reference to original customer driver booking if this is a delegated/transferred ride
    driverBookingId?: mongoose.Types.ObjectId | null;

    bookingMode: string;
    serviceType: string;
    tripType: string;

    scheduledStartTime: Date;

    durationHours?: number | null;
    durationDays?: number | null;
    returnDate?: Date | null;

    pickupLocation?: {
        address?: string;
        location?: {
            type: string;
            coordinates: number[];
        };
    };

    dropLocation?: {
        address?: string;
        location?: {
            type: string;
            coordinates: number[];
        };
    };

    vehicleType: string;
    transmission: string;
    vehicleOwnership: string;
    vehicleId?: mongoose.Types.ObjectId | null;
    vehicleNumber?: string;

    numberOfPassengers: number;

    estimatedDistance?: number;
    actualDistance?: number;
    estimatedDuration?: number;

    driverAssignedAt?: Date | null;
    driverArrivedAt?: Date | null;
    tripStartedAt?: Date | null;
    tripCompletedAt?: Date | null;
    startOtp?: string;

    pricingId?: mongoose.Types.ObjectId | null;
    baseAmount?: number;
    extraKmAmount?: number;
    driverAllowance?: number;
    driverFee?: number;

    // NOTE: Platform charge does NOT apply for Driver-to-Driver bookings
    platformFee: number;

    taxAmount?: number;
    discountAmount?: number;
    totalAmount?: number;

    paymentMethod?: string;
    paymentStatus?: string;
    paymentId?: string;

    bookingStatus?: string;

    isUserRated?: boolean;
    isDriverRated?: boolean;

    cancelledBy?: string | null;
    cancellationReason?: string;
    cancelledAt?: Date | null;

    rejectedDrivers?: {
        _id?: mongoose.Types.ObjectId | string;
        id?: string;
        driverId: mongoose.Types.ObjectId;
        reason?: string;
        rejectTime?: Date;
    }[];

    userNotes?: string;
    driverNotes?: string;
    adminNotes?: string;

    createdAt: Date;
    updatedAt: Date;
}

const driverToDriverBookingSchema: Schema = new Schema(
    {
        bookingId: {
            type: String,
            unique: true,
            required: true,
            default: function () {
                return "D2D-" + Math.floor(100000 + Math.random() * 900000);
            }
        },

        // Requesting / Source Driver
        sourceDriverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true,
            index: true
        },

        // Assigned / Fulfilling Driver
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            default: null,
            index: true
        },

        // Optional customer reference if originated from a client
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            default: null,
            index: true
        },

        // Optional original customer DriverBooking reference if ride was handed off
        driverBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DriverBooking",
            default: null,
            index: true
        },

        bookingMode: {
            type: String,
            enum: ["now", "scheduled"],
            default: "scheduled"
        },

        serviceType: {
            type: String,
            enum: ["local", "outstation"],
            required: true,
            index: true
        },

        tripType: {
            type: String,
            enum: ["one_way", "round_trip"],
            required: true
        },

        scheduledStartTime: {
            type: Date,
            required: true,
            index: true
        },

        durationHours: {
            type: Number,
            required: function (this: any) {
                return this.serviceType === "local";
            }
        },

        durationDays: {
            type: Number,
            required: function (this: any) {
                return this.serviceType === "outstation";
            }
        },

        returnDate: {
            type: Date,
            default: null
        },

        pickupLocation: {
            address: {
                type: String,
                default: ""
            },
            location: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], required: true }
            }
        },

        dropLocation: {
            address: {
                type: String,
                default: ""
            },
            location: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], default: [0, 0] }
            }
        },

        vehicleType: {
            type: String,
            enum: [
                "hatchback",
                "sedan",
                "suv",
                "mpv",
                "coupe",
                "convertible",
                "wagon",
                "luxury"
            ],
            default: "sedan"
        },

        transmission: {
            type: String,
            enum: [
                "manual",
                "amt",
                "automatic",
                "cvt",
                "dct"
            ],
            default: "manual"
        },

        vehicleOwnership: {
            type: String,
            enum: [
                "user_vehicle",
                "driver_vehicle"
            ],
            default: "user_vehicle"
        },

        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            default: null
        },

        vehicleNumber: {
            type: String,
            default: ""
        },

        numberOfPassengers: {
            type: Number,
            default: 1,
            min: 1
        },

        estimatedDistance: {
            type: Number,
            default: 0
        },

        actualDistance: {
            type: Number,
            default: 0
        },

        estimatedDuration: {
            type: Number,
            default: 0
        },

        driverAssignedAt: {
            type: Date,
            default: null
        },

        driverArrivedAt: {
            type: Date,
            default: null
        },

        tripStartedAt: {
            type: Date,
            default: null
        },

        tripCompletedAt: {
            type: Date,
            default: null
        },

        startOtp: {
            type: String,
            default: function () {
                return Math.floor(1000 + Math.random() * 9000).toString();
            }
        },

        pricingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DriverPricing",
            default: null
        },

        baseAmount: {
            type: Number,
            default: 0
        },

        extraKmAmount: {
            type: Number,
            default: 0
        },

        driverAllowance: {
            type: Number,
            default: 0
        },

        driverFee: {
            type: Number,
            default: 0
        },

        // NOTE: PLATFORM FEE IS 0 FOR DRIVER-TO-DRIVER BOOKINGS
        platformFee: {
            type: Number,
            default: 0
        },

        taxAmount: {
            type: Number,
            default: 0
        },

        discountAmount: {
            type: Number,
            default: 0
        },

        totalAmount: {
            type: Number,
            default: 0
        },

        paymentMethod: {
            type: String,
            enum: [
                "cash",
                "online",
                "wallet"
            ],
            default: "online"
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded",
                "partially_refunded"
            ],
            default: "pending"
        },

        paymentId: {
            type: String,
            default: ""
        },

        bookingStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "driver_assigned",
                "driver_arriving",
                "driver_arrived",
                "trip_started",
                "trip_completed",
                "cancelled",
                "rejected",
                "expired"
            ],
            default: "pending",
            index: true
        },

        isUserRated: {
            type: Boolean,
            default: false
        },

        isDriverRated: {
            type: Boolean,
            default: false
        },

        cancelledBy: {
            type: String,
            enum: [
                "source_driver",
                "assigned_driver",
                "user",
                "admin",
                null
            ],
            default: null
        },

        cancellationReason: {
            type: String,
            default: ""
        },

        cancelledAt: {
            type: Date,
            default: null
        },

        rejectedDrivers: [
            {
                driverId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Driver",
                    required: true,
                },
                reason: {
                    type: String,
                    default: "Driver declined the ride",
                },
                rejectTime: {
                    type: Date,
                    default: Date.now,
                },
            }
        ],

        userNotes: {
            type: String,
            default: ""
        },

        driverNotes: {
            type: String,
            default: ""
        },

        adminNotes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

driverToDriverBookingSchema.index({ "pickupLocation.location": "2dsphere" });

if (mongoose.models && mongoose.models.DriverToDriverBooking) {
    delete (mongoose.models as any).DriverToDriverBooking;
}

const DriverToDriverBooking = mongoose.model<DriverToDriverBookingInterface>(
    "DriverToDriverBooking",
    driverToDriverBookingSchema
);

export default DriverToDriverBooking;
