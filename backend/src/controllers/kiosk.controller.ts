import { Request, Response } from "express";
import { z } from "zod";
import { Guest } from "../models/Guest.js";
import { Event } from "../models/Event.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const lookupSchema = z.object({
  query: z.string().min(1),
  type: z.enum(["email", "id"]).default("email"),
});

export async function lookupGuest(req: Request, res: Response) {
  try {
    const { query, type } = lookupSchema.parse(req.body);

    let guest;
    if (type === "email") {
      guest = await Guest.findOne({ email: query.toLowerCase() }).lean();
    } else {
      guest = await Guest.findOne({
        registrationId: query.toUpperCase(),
      }).lean();
    }

    if (!guest) {
      return sendError(res, "Guest not found", 404);
    }

    const event = await Event.findById(guest.eventId).lean();

    return sendSuccess(res, {
      guest,
      event: event
        ? { name: event.name, date: event.date, location: event.location }
        : null,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    throw err;
  }
}

export async function checkinGuest(req: Request, res: Response) {
  const { guestId } = req.params;

  const guest = await Guest.findById(guestId);
  if (!guest) {
    return sendError(res, "Guest not found", 404);
  }

  if (guest.status === "CheckedIn") {
    return sendError(res, "Guest already checked in", 409);
  }

  guest.status = "CheckedIn";
  guest.checkedInAt = new Date();
  await guest.save();

  await ActivityLog.create({
    eventId: guest.eventId,
    guestId: guest._id,
    action: "checked_in",
    details: `${guest.fullName} checked in`,
  });

  const event = await Event.findById(guest.eventId).lean();

  return sendSuccess(res, {
    guest: guest.toJSON(),
    event: event
      ? { name: event.name, date: event.date, location: event.location }
      : null,
  });
}
