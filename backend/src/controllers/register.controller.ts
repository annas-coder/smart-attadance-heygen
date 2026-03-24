import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Guest } from "../models/Guest.js";
import { Event } from "../models/Event.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { generateRegistrationId } from "../utils/generateId.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import * as youverse from "../services/youverseService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const checkEmailQuerySchema = z.object({
  email: z.string().email(),
  eventId: z.string().min(1),
});

/** Public: check if email is already registered for an event (excludes Invited — they may complete signup). */
export async function checkRegistrationEmail(req: Request, res: Response) {
  try {
    const emailQ = req.query.email;
    const eventIdQ = req.query.eventId;
    const { email, eventId } = checkEmailQuerySchema.parse({
      email: typeof emailQ === "string" ? emailQ : "",
      eventId: typeof eventIdQ === "string" ? eventIdQ : "",
    });

    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    const guest = await Guest.findOne({
      eventId: new mongoose.Types.ObjectId(eventId),
      email: email.toLowerCase(),
    });

    if (!guest || guest.status === "Invited") {
      return sendSuccess(res, { exists: false });
    }

    return sendSuccess(res, {
      exists: true,
      status: guest.status,
      registrationId: guest.registrationId ?? null,
      guestId: guest._id.toString(),
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    throw err;
  }
}

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
      if (guest.status !== "Invited") {
        return sendError(res, "This email is already registered for this event.", 409, {
          existingStatus: guest.status,
          registrationId: guest.registrationId ?? null,
          guestId: guest._id.toString(),
        });
      }

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

function mapQualityMetrics(metrics: { name: string; test: boolean }[]) {
  const checks: Record<string, boolean> = {
    faceDetected: true,
    faceCentered: true,
    goodLighting: true,
    noObstructions: true,
    imageSharp: true,
    singleFace: true,
  };

  for (const m of metrics) {
    const name = m.name.toLowerCase();
    if (name.includes("center") || name.includes("pose")) {
      checks.faceCentered = checks.faceCentered && m.test;
    } else if (name.includes("light") || name.includes("exposure") || name.includes("brightness")) {
      checks.goodLighting = checks.goodLighting && m.test;
    } else if (name.includes("occlu") || name.includes("mask") || name.includes("glasses")) {
      checks.noObstructions = checks.noObstructions && m.test;
    } else if (name.includes("sharp") || name.includes("blur") || name.includes("focus")) {
      checks.imageSharp = checks.imageSharp && m.test;
    }
  }

  return checks;
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

  const filePath = path.join(__dirname, "..", "..", "uploads", "faces", req.file.filename);
  const imageBuffer = fs.readFileSync(filePath);
  const imageBase64 = imageBuffer.toString("base64");

  try {
    const result = await youverse.processFace(imageBase64);

    const qualityChecks = result.detected
      ? mapQualityMetrics(result.qualityMetrics)
      : {
          faceDetected: false,
          faceCentered: false,
          goodLighting: false,
          noObstructions: false,
          imageSharp: false,
          singleFace: false,
        };

    if (!result.detected) {
      await guest.save();
      return sendSuccess(res, {
        guestId: guest._id,
        faceImagePath: guest.faceImagePath,
        status: guest.status,
        qualityChecks,
        enrolled: false,
        retakeRequired: true,
        reason: "No face detected in the image",
      });
    }

    if (result.raw.length > 1) {
      qualityChecks.singleFace = false;
      console.warn(
        `[uploadFaceImage] guest ${guestId}: multiple faces detected (${result.raw.length}), using first face for enrollment`
      );
    }

    const qualityWarning =
      !result.qualityPassed || !qualityChecks.singleFace
        ? "Image quality is not ideal, but we will use it."
        : undefined;

    const galleryId = guest.eventId.toString();
    const personId = guest._id.toString();
    await youverse.enrollInGallery(galleryId, personId, result.template!);

    guest.faceTemplateId = personId;
    guest.status = "FaceCaptured";
    await guest.save();

    await ActivityLog.create({
      eventId: guest.eventId,
      guestId: guest._id,
      action: "face_captured",
      details: `${guest.fullName} uploaded face image and enrolled in face recognition`,
    });

    return sendSuccess(res, {
      guestId: guest._id,
      faceImagePath: guest.faceImagePath,
      status: guest.status,
      qualityChecks,
      enrolled: true,
      retakeRequired: false,
      ...(qualityWarning ? { reason: qualityWarning } : {}),
    });
  } catch (err: any) {
    console.error("Youverse face processing error:", err.message);

    guest.status = "FaceCaptured";
    await guest.save();

    await ActivityLog.create({
      eventId: guest.eventId,
      guestId: guest._id,
      action: "face_captured",
      details: `${guest.fullName} uploaded face image (face enrollment pending)`,
    });

    return sendSuccess(res, {
      guestId: guest._id,
      faceImagePath: guest.faceImagePath,
      status: guest.status,
      qualityChecks: {
        faceDetected: true,
        faceCentered: true,
        goodLighting: true,
        noObstructions: true,
        imageSharp: true,
        singleFace: true,
      },
      enrolled: false,
      retakeRequired: false,
      reason: "Face processing service temporarily unavailable. Image saved for later enrollment.",
    });
  }
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
          endDate: event.endDate,
          location: event.location,
          description: event.description,
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
          endDate: event.endDate,
          location: event.location,
          description: event.description,
        }
      : null,
  });
}
