import mongoose, { Schema, Document } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  email: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoApprove: boolean;
  requireFaceCapture: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    timezone: { type: String, default: "Asia/Dubai" },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    autoApprove: { type: Boolean, default: false },
    requireFaceCapture: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>(
  "Organization",
  organizationSchema
);
