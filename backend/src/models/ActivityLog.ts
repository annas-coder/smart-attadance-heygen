import mongoose, { Schema, Document } from "mongoose";
import type { ActivityAction } from "../types/index.js";

export interface IActivityLog extends Document {
  eventId: mongoose.Types.ObjectId;
  guestId?: mongoose.Types.ObjectId;
  action: ActivityAction;
  details: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    index: true,
  },
  guestId: { type: Schema.Types.ObjectId, ref: "Guest" },
  action: {
    type: String,
    enum: [
      "invited",
      "registered",
      "face_captured",
      "checked_in",
      "event_created",
      "event_updated",
    ],
    required: true,
  },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

activityLogSchema.index({ eventId: 1, timestamp: -1 });

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  activityLogSchema
);
