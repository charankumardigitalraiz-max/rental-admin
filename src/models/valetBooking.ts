import mongoose, { Schema, Document } from "mongoose";

export interface ValetBookingInterface extends Document {
  bookingId: string;
  userId: mongoose.Types.ObjectId;
  eventName: string;
  eventType?: string;
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  hours: number;
  person: number; // required staff / valet count

  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
    address: string;
  };
  address: string;
  venueName?: string;

  pricing?: {
    customerPrice?: number;
    driverPrice?: number;
    taxAmount?: number;
    totalAmount?: number;
    staffPayoutTotal?: number;
    platformCommission?: number;
  };

  assignedStaffIds?: mongoose.Types.ObjectId[];
  status:
  | "new_request"
  | "pending_assignment"
  | "partially_assigned"
  | "fully_assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  specialInstructions?: string;
  adminNotes?: string;

  cancelledBy?: string | null;
  cancellationReason?: string;
  cancelledAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const valetBookingSchema: Schema = new Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        return "VLT-" + Math.floor(100000 + Math.random() * 900000);
      },
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    eventType: {
      type: String,
      default: "general",
    },

    eventDate: {
      type: Date,
      required: true,
      index: true,
    },

    startTime: {
      type: String,
      default: "18:00",
    },

    endTime: {
      type: String,
      default: "22:00",
    },

    hours: {
      type: Number,
      required: true,
      default: 4,
      min: 1,
    },

    person: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [77.5946, 12.9716],
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    venueName: {
      type: String,
      default: "",
      trim: true,
    },

    pricing: {
      customerPrice: { type: Number, default: 0 },
      driverPrice: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      staffPayoutTotal: { type: Number, default: 0 },
      platformCommission: { type: Number, default: 0 },
    },

    assignedStaffIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ValetStaff",
      },
    ],

    status: {
      type: String,
      enum: [
        "new_request",
        "pending_assignment",
        "partially_assigned",
        "fully_assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "new_request",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "online", "wallet"],
      default: "online",
    },

    specialInstructions: {
      type: String,
      default: "",
    },

    adminNotes: {
      type: String,
      default: "",
    },

    cancelledBy: {
      type: String,
      enum: ["user", "admin", null],
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

valetBookingSchema.index({ "location.coordinates": "2dsphere" });

if (mongoose.models && mongoose.models.ValetBooking) {
  delete (mongoose.models as any).ValetBooking;
}

const ValetBooking =
  mongoose.model<ValetBookingInterface>("ValetBooking", valetBookingSchema);

export default ValetBooking;
