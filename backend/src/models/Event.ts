import mongoose, { Schema, Document } from "mongoose";
import type { EventStatus } from "../types/index.js";

export interface IEvent extends Document {
  name: string;
  date: Date;
  endDate?: Date;
  location: string;
  description?: string;
  status: EventStatus;
  organizationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
  },
  { timestamps: true }
);

eventSchema.index({ status: 1 });
eventSchema.index({ date: 1 });

export const Event = mongoose.model<IEvent>("Event", eventSchema);
