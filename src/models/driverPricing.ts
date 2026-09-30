import mongoose, { Schema, Document } from "mongoose";

// -------------------------------------------------------------
// Sub-schemas for Local Pricing Structure
// -------------------------------------------------------------
const LocalTimePricingSchema = new Schema(
  {
    hours: { type: Number, required: true },
    timeRange: { type: String, required: true }, // e.g., "06:00-18:00"
    customerPrice: { type: Number, required: true },
    driverPrice: { type: Number, required: true },
  },
  { _id: false }
);

const LocalTripTypeSchema = new Schema(
  {
    morningHours: { type: LocalTimePricingSchema, required: true },
    nightHours: { type: LocalTimePricingSchema, required: true },
  },
  { _id: false }
);

// -------------------------------------------------------------
// Sub-schemas for Outstation Pricing Structure
// -------------------------------------------------------------
const OutstationTripTypeSchema = new Schema(
  {
    day: { type: Number, required: true },
    customerPrice: { type: Number, required: true },
    driverPrice: { type: Number, required: true },
  },
  { _id: false }
);

// -------------------------------------------------------------
// Main Interface and Schema
// -------------------------------------------------------------
export interface DriverPricingInterface extends Document {
  local: {
    one_way: {
      morningHours: {
        hours: number;
        timeRange: string;
        customerPrice: number;
        driverPrice: number;
      };
      nightHours: {
        hours: number;
        timeRange: string;
        customerPrice: number;
        driverPrice: number;
      };
    };
    round_trip: {
      morningHours: {
        hours: number;
        timeRange: string;
        customerPrice: number;
        driverPrice: number;
      };
      nightHours: {
        hours: number;
        timeRange: string;
        customerPrice: number;
        driverPrice: number;
      };
    };
  };
  outstation: {
    one_way: {
      day: number;
      customerPrice: number;
      driverPrice: number;
    };
    round_trip: {
      day: number;
      customerPrice: number;
      driverPrice: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const driverPricingSchema: Schema = new Schema(
  {
    local: {
      one_way: { type: LocalTripTypeSchema, required: true },
      round_trip: { type: LocalTripTypeSchema, required: true },
    },

    outstation: {
      one_way: { type: OutstationTripTypeSchema, required: true },
      round_trip: { type: OutstationTripTypeSchema, required: true },
    },
  },
  {
    timestamps: true,
  }
);

const DriverPricing =
  mongoose.models.DriverPricing ||
  mongoose.model<DriverPricingInterface>("DriverPricing", driverPricingSchema);

export default DriverPricing;
