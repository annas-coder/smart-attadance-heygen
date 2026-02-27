import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Guest } from "../models/Guest.js";
import { Event } from "../models/Event.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { generateRegistrationId } from "../utils/generateId.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const registerSchema = z.object({
  eventId: z.string(),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  designation: z.string().optional(),
  linkedIn: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
});

export async function submitRegistration(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);

    const event = await Event.findById(data.eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    let guest = await Guest.findOne({
      eventId: new mongoose.Types.ObjectId(data.eventId),
      email: data.email.toLowerCase(),
    });

    if (guest) {
      guest.set({
        fullName: data.fullName,
        phone: data.phone,
        company: data.company,
        designation: data.designation,
        linkedIn: data.linkedIn,
        industry: data.industry,
        country: data.country,
        status: "Registered",
        registeredAt: new Date(),
      });
      await guest.save();
    } else {
      guest = await Guest.create({
        ...data,
        eventId: new mongoose.Types.ObjectId(data.eventId),
        status: "Registered",
        registeredAt: new Date(),
      });
    }

    await ActivityLog.create({
      eventId: new mongoose.Types.ObjectId(data.eventId),
      guestId: guest._id,
      action: "registered",
      details: `${guest.fullName} registered`,
    });

    return sendSuccess(res, { guestId: guest._id, status: guest.status }, 201);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    throw err;
  }
}

export async function uploadFaceImage(req: Request, res: Response) {
  const { guestId } = req.params;

  const guest = await Guest.findById(guestId);
  if (!guest) {
    return sendError(res, "Guest not found", 404);
  }

  if (!req.file) {
    return sendError(res, "Face image is required", 400);
  }

  guest.faceImagePath = `/uploads/faces/${req.file.filename}`;
  guest.status = "FaceCaptured";
  await guest.save();

  await ActivityLog.create({
    eventId: guest.eventId,
    guestId: guest._id,
    action: "face_captured",
    details: `${guest.fullName} uploaded face image`,
  });

  return sendSuccess(res, {
    guestId: guest._id,
    faceImagePath: guest.faceImagePath,
    status: guest.status,
  });
}

export async function confirmRegistration(req: Request, res: Response) {
  const { guestId } = req.params;

  const guest = await Guest.findById(guestId);
  if (!guest) {
    return sendError(res, "Guest not found", 404);
  }

  if (!guest.registrationId) {
    guest.registrationId = generateRegistrationId();
  }

  guest.agenda = {
    sessions: [
      {
        title: "Keynote: Future of Financial Technology",
        location: "Grand Ballroom, Floor 2",
        time: "2:00 PM - 3:00 PM",
      },
      {
        title: "Networking Break",
        location: "Exhibition Hall",
        time: "3:30 PM - 4:00 PM",
      },
      {
        title: "AI in Finance Panel",
        location: "Conference Room A, Floor 3",
        time: "4:00 PM - 5:00 PM",
      },
    ],
  };

  await guest.save();

  const event = await Event.findById(guest.eventId).lean();

  return sendSuccess(res, {
    guest: guest.toJSON(),
    event: event
      ? {
          name: event.name,
          date: event.date,
          location: event.location,
        }
      : null,
  });
}

export async function viewTicket(req: Request, res: Response) {
  const { registrationId } = req.params;

  const guest = await Guest.findOne({ registrationId }).lean();
  if (!guest) {
    return sendError(res, "Ticket not found", 404);
  }

  const event = await Event.findById(guest.eventId).lean();

  return sendSuccess(res, {
    guest,
    event: event
      ? {
          name: event.name,
          date: event.date,
          location: event.location,
        }
      : null,
  });
}
