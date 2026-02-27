import { Request } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export type GuestBadge = "VIP" | "Speaker" | "General";

export type GuestStatus =
  | "Invited"
  | "Registered"
  | "FaceCaptured"
  | "CheckedIn";

export type EventStatus = "upcoming" | "ongoing" | "completed";

export type ActivityAction =
  | "invited"
  | "registered"
  | "face_captured"
  | "checked_in"
  | "event_created"
  | "event_updated";
