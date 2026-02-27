import { Request, Response } from "express";
import { z } from "zod";
import { Guest } from "../models/Guest.js";
import { Event } from "../models/Event.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import * as youverse from "../services/youverseService.js";

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

const faceIdentifySchema = z.object({
  image: z.string().min(1),
  eventId: z.string().min(1),
});

export async function faceIdentify(req: Request, res: Response) {
  try {
    const { image, eventId } = faceIdentifySchema.parse(req.body);
    console.log(`[face-identify] eventId=${eventId}, imageLength=${image.length}`);

    const event = await Event.findById(eventId).lean();
    if (!event) {
      console.warn(`[face-identify] Event not found: ${eventId}`);
      return sendError(res, "Event not found", 404);
    }

    const processResult = await youverse.processFace(image);
    console.log(`[face-identify] processFace: detected=${processResult.detected}, hasTemplate=${!!processResult.template}, qualityPassed=${processResult.qualityPassed}, facesFound=${processResult.raw.length}`);

    if (!processResult.detected || !processResult.template) {
      return sendSuccess(res, {
        matched: false,
        reason: "No face detected in the image",
      });
    }

    const galleryId = eventId;
    let candidates: youverse.IdentifyCandidate[];
    try {
      candidates = await youverse.identifyFace(processResult.template, galleryId);
      console.log(`[face-identify] identifyFace returned ${candidates?.length ?? 0} candidates:`, JSON.stringify(candidates));
    } catch (err: any) {
      if (err.message?.includes("404")) {
        console.warn(`[face-identify] Gallery not found for event ${eventId}`);
        return sendSuccess(res, {
          matched: false,
          reason: "No enrolled faces for this event yet",
        });
      }
      throw err;
    }

    if (!candidates || candidates.length === 0) {
      return sendSuccess(res, {
        matched: false,
        reason: "Face not recognized. Please use manual check-in.",
      });
    }

    const bestMatch = candidates[0];
    console.log(`[face-identify] Best match: template_id=${bestMatch.template_id}, score=${bestMatch.score}`);

    const guest = await Guest.findById(bestMatch.template_id);
    if (!guest) {
      console.warn(`[face-identify] Matched template_id=${bestMatch.template_id} but guest not found in DB`);
      return sendSuccess(res, {
        matched: false,
        reason: "Matched face template but guest record not found",
      });
    }

    if (guest.status !== "CheckedIn") {
      guest.status = "CheckedIn";
      guest.checkedInAt = new Date();
      await guest.save();

      await ActivityLog.create({
        eventId: guest.eventId,
        guestId: guest._id,
        action: "checked_in",
        details: `${guest.fullName} checked in via face recognition (score: ${bestMatch.score.toFixed(3)})`,
      });
    }

    console.log(`[face-identify] SUCCESS: matched ${guest.fullName} (score=${bestMatch.score.toFixed(3)})`);
    return sendSuccess(res, {
      matched: true,
      score: bestMatch.score,
      guest: guest.toJSON(),
      event: {
        name: event.name,
        date: event.date,
        location: event.location,
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    console.error("[face-identify] Error:", err.message);
    return sendError(res, "Face recognition service error", 500);
  }
}
