import { Request, Response } from "express";
import { z } from "zod";
import { Event } from "../models/Event.js";
import { Guest } from "../models/Guest.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import * as youverse from "../services/youverseService.js";

const createEventSchema = z.object({
  name: z.string().min(1),
  date: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  location: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["upcoming", "ongoing", "completed"]).optional(),
});

async function getEventStats(eventId: string) {
  const [stats] = await Guest.aggregate([
    { $match: { eventId: new (await import("mongoose")).default.Types.ObjectId(eventId) } },
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
      },
    },
  ]);

  return {
    totalInvited: stats?.totalInvited ?? 0,
    registered: stats?.registered ?? 0,
    checkedIn: stats?.checkedIn ?? 0,
  };
}

export async function listPublicEvents(_req: Request, res: Response) {
  const events = await Event.find({ status: { $in: ["upcoming", "ongoing"] } })
    .select("name date endDate location description status")
    .sort({ date: 1 })
    .lean();

  return sendSuccess(res, events);
}

export async function listEvents(_req: Request, res: Response) {
  const events = await Event.find().sort({ date: -1 }).lean();

  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const stats = await getEventStats(event._id.toString());
      return { ...event, ...stats };
    })
  );

  return sendSuccess(res, eventsWithStats);
}

export async function getEvent(req: Request, res: Response) {
  const event = await Event.findById(req.params.id).lean();
  if (!event) {
    return sendError(res, "Event not found", 404);
  }

  const stats = await getEventStats(event._id.toString());
  return sendSuccess(res, { ...event, ...stats });
}

export async function createEvent(req: Request, res: Response) {
  try {
    const data = createEventSchema.parse(req.body);
    const event = await Event.create({
      ...data,
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });

    await ActivityLog.create({
      eventId: event._id,
      action: "event_created",
      details: `Event "${event.name}" was created`,
    });

    youverse.createGallery(event._id.toString()).catch((err) => {
      console.error("Failed to create Youverse gallery for event:", err.message);
    });

    return sendSuccess(res, event, 201);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    throw err;
  }
}

export async function updateEvent(req: Request, res: Response) {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!event) {
    return sendError(res, "Event not found", 404);
  }

  await ActivityLog.create({
    eventId: event._id,
    action: "event_updated",
    details: `Event "${event.name}" was updated`,
  });

  return sendSuccess(res, event);
}

export async function deleteEvent(req: Request, res: Response) {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return sendError(res, "Event not found", 404);
  }
  await Guest.deleteMany({ eventId: event._id });
  await ActivityLog.deleteMany({ eventId: event._id });

  youverse.deleteGallery(event._id.toString()).catch((err) => {
    console.error("Failed to delete Youverse gallery for event:", err.message);
  });

  return sendSuccess(res, { message: "Event deleted" });
}
