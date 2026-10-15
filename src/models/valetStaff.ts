import mongoose, { Schema, Document } from "mongoose";

export interface ValetStaffInterface extends Document {
  staffId: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: Date;
  bloodGroup?: string;
  proof: {
    proofType: "aadhaar" | "driving_license" | "pan" | "voter_id" | "passport" | string;
    identityNumber: string;
    proofImage?: string; // uploaded image URL or path
    proofImageBack?: string;
  };
  profileImage?: string;
  address?: string;
  status: string;
  isAvailable?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const valetStaffSchema: Schema = new Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      trim: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
      default: "",
    },
    proof: {
      proofType: {
        type: String,
        required: [true, "Proof type is required"],
        trim: true,
      },
      identityNumber: {
        type: String,
        required: [true, "Identity number is required"],
        trim: true,
      },
      proofImage: {
        type: String,
        trim: true,
      },
      proofImageBack: {
        type: String,
        trim: true,
      },
    },
    profileImage: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "suspended"],
      default: "active",
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Delete old model from cache to allow schema reload
if (mongoose.models && mongoose.models.ValetStaff) {
  delete (mongoose.models as any).ValetStaff;
}

const ValetStaff = mongoose.model<ValetStaffInterface>("ValetStaff", valetStaffSchema);
export default ValetStaff;
