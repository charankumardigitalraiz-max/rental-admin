import mongoose, { Schema, Document } from 'mongoose';

export interface ICar extends Omit<Document, 'model'> {
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarSchema: Schema = new Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recompiling the model in dev mode
const Car = mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);

export default Car;
