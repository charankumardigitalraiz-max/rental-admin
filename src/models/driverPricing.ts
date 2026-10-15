import mongoose, { Schema, Document } from "mongoose";

// -------------------------------------------------------------
// Sub-schemas for Local Pricing Structure
// -------------------------------------------------------------
const LocalTimePricingSchema = new Schema(
  {
    hours: { type: Number, required: false },
    timeRange: { type: String, required: false }, // e.g., "06:00-18:00"
    customerPrice: { type: Number, required: false },
    driverPrice: { type: Number, required: false },
  },
  { _id: false }
);

const LocalTripTypeSchema = new Schema(
  {
    morningHours: { type: LocalTimePricingSchema, required: false },
    nightHours: { type: LocalTimePricingSchema, required: false },
  },
  { _id: false }
);

// -------------------------------------------------------------
// Sub-schemas for Outstation Pricing Structure
// -------------------------------------------------------------
const OutstationTripTypeSchema = new Schema(
  {
    day: { type: Number, required: false },
    customerPrice: { type: Number, required: false },
    driverPrice: { type: Number, required: false },
    morningHours: { type: LocalTimePricingSchema, required: false },
    nightHours: { type: LocalTimePricingSchema, required: false },
  },
  { _id: false }
);

// -------------------------------------------------------------
// Main Interface and Schema
// -------------------------------------------------------------
export interface DriverPricingInterface extends Document {
  local?: {
    one_way?: {
      morningHours?: {
        hours?: number;
        timeRange?: string;
        customerPrice?: number;
        driverPrice?: number;
      };
      nightHours?: {
        hours?: number;
        timeRange?: string;
        customerPrice?: number;
        driverPrice?: number;
      };
    };
    round_trip?: {
      morningHours?: {
        hours?: number;
        timeRange?: string;
        customerPrice?: number;
        driverPrice?: number;
      };
      nightHours?: {
        hours?: number;
        timeRange?: string;
        customerPrice?: number;
        driverPrice?: number;
      };
    };
  };
  outstation?: {
    one_way?: {
      day?: number;
      customerPrice?: number;
      driverPrice?: number;
      morningHours?: {
        hours?: number;
        timeRange?: string;
        customerPrice?: number;
        driverPrice?: number;
      };
      nightHours?: {
        hours?: number;
        timeRange?: string;
        customerPrice?: number;
        driverPrice?: number;
      };
    };
    round_trip?: {
      day?: number;
      customerPrice?: number;
      driverPrice?: number;
      morningHours?: {
        hours?: number;
        timeRange?: string;
        customerPrice?: number;
        driverPrice?: number;
      };
      nightHours?: {
        hours?: number;
        timeRange?: string;
        customerPrice?: number;
        driverPrice?: number;
      };
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const driverPricingSchema: Schema = new Schema(
  {
    local: {
      one_way: { type: LocalTripTypeSchema, required: false },
      round_trip: { type: LocalTripTypeSchema, required: false },
    },

    outstation: {
      one_way: { type: OutstationTripTypeSchema, required: false },
      round_trip: { type: OutstationTripTypeSchema, required: false },
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models && mongoose.models.DriverPricing) {
  delete (mongoose.models as any).DriverPricing;
}

const DriverPricing =
  mongoose.model<DriverPricingInterface>("DriverPricing", driverPricingSchema);

export default DriverPricing;
