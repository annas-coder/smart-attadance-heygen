import { Request, Response } from "express";
import mongoose from "mongoose";
import { Guest } from "../models/Guest.js";
import { Event } from "../models/Event.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function getStats(req: Request, res: Response) {
  const { eventId } = req.query;

  let matchStage: any = {};
  if (eventId && typeof eventId === "string") {
    matchStage = { eventId: new mongoose.Types.ObjectId(eventId) };
  }

  const [stats] = await Guest.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInvited: { $sum: 1 },
        registered: {
          $sum: {
            $cond: [
              { $in: ["$status", ["Registered", "FaceCaptured", "CheckedIn"]] },
              1,
              0,
            ],
          },
        },
        checkedIn: {
          $sum: { $cond: [{ $eq: ["$status", "CheckedIn"] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "Invited"] }, 1, 0] },
        },
      },
    },
  ]);

  const eventCount = await Event.countDocuments();

  return sendSuccess(res, {
    totalInvited: stats?.totalInvited ?? 0,
    registered: stats?.registered ?? 0,
    checkedIn: stats?.checkedIn ?? 0,
    pending: stats?.pending ?? 0,
    totalEvents: eventCount,
  });
}

export async function getActivity(req: Request, res: Response) {
  const { eventId, limit = "20" } = req.query;

  let filter: any = {};
  if (eventId && typeof eventId === "string") {
    filter.eventId = new mongoose.Types.ObjectId(eventId);
  }

  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));

  const activities = await ActivityLog.find(filter)
    .sort({ timestamp: -1 })
    .limit(limitNum)
    .populate("guestId", "fullName email")
    .populate("eventId", "name")
    .lean();

  return sendSuccess(res, activities);
}
