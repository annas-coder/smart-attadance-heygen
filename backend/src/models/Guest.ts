import mongoose, { Schema, Document } from "mongoose";
import type { GuestBadge, GuestStatus } from "../types/index.js";

export interface IGuest extends Document {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  linkedIn?: string;
  industry?: string;
  country?: string;
  badge: GuestBadge;
  status: GuestStatus;
  registrationId?: string;
  faceImagePath?: string;
  faceTemplateId?: string;
  eventId: mongoose.Types.ObjectId;
  agenda?: {
    sessions: Array<{
      title: string;
      location: string;
      time: string;
    }>;
  };
  checkedInAt?: Date;
  registeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    designation: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    industry: { type: String, trim: true },
    country: { type: String, trim: true },
    badge: {
      type: String,
      enum: ["VIP", "Speaker", "General"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["Invited", "Registered", "FaceCaptured", "CheckedIn"],
      default: "Invited",
    },
    registrationId: { type: String, unique: true, sparse: true },
    faceImagePath: { type: String },
    faceTemplateId: { type: String },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    agenda: {
      sessions: [
        {
          title: { type: String },
          location: { type: String },
          time: { type: String },
        },
      ],
    },
    checkedInAt: { type: Date },
    registeredAt: { type: Date },
  },
  { timestamps: true }
);

guestSchema.index({ eventId: 1, email: 1 }, { unique: true });
guestSchema.index({ eventId: 1, status: 1 });
guestSchema.index({ registrationId: 1 });
guestSchema.index({ fullName: "text", email: "text", company: "text" });

export const Guest = mongoose.model<IGuest>("Guest", guestSchema);
