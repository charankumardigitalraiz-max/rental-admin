import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserBannerSection = 'intro_screen' | 'home_hero' | 'home_middle';

export interface IBanner extends Document {
  section: UserBannerSection;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  actionUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    section: {
      type: String,
      enum: ['intro_screen', 'home_hero', 'home_middle'],
      required: true,
      index: true,
    },
    title: { type: String, default: '', required: false, trim: true },
    subtitle: { type: String, default: '', required: false, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    actionUrl: { type: String, default: '', required: false, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Clear model cache safely so hot reloads never retain stale validation rules
if (mongoose.models && mongoose.models.Banner) {
  try {
    delete (mongoose.models as any).Banner;
    if (mongoose.connection && (mongoose.connection.models as any)?.Banner) {
      delete (mongoose.connection.models as any).Banner;
    }
  } catch {
    // ignore
  }
}

const Banner: Model<IBanner> = mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
