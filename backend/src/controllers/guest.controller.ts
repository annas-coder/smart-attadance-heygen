import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Guest } from "../models/Guest.js";
import { Event } from "../models/Event.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const addGuestSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  badge: z.enum(["VIP", "Speaker", "General"]).default("General"),
  phone: z.string().optional(),
  designation: z.string().optional(),
});

const bulkInviteSchema = z.object({
  emails: z.array(z.string().email()).min(1),
});

export async function listGuests(req: Request, res: Response) {
  const eventId = req.params.eventId as string;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;
  const badge = req.query.badge as string | undefined;
  const page = (req.query.page as string) || "1";
  const limit = (req.query.limit as string) || "50";

  const event = await Event.findById(eventId);
  if (!event) {
    return sendError(res, "Event not found", 404);
  }

  const filter: Record<string, unknown> = {
    eventId: new mongoose.Types.ObjectId(eventId),
  };

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (badge) {
    filter.badge = badge;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [guests, total] = await Promise.all([
    Guest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Guest.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    guests,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function addGuest(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId as string;
    const data = addGuestSchema.parse(req.body);

    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    const existing = await Guest.findOne({
      eventId: new mongoose.Types.ObjectId(eventId),
      email: data.email,
    });
    if (existing) {
      return sendError(res, "Guest already exists for this event", 409);
    }

    const guest = await Guest.create({
      ...data,
      eventId: new mongoose.Types.ObjectId(eventId),
      status: "Invited",
    });

    await ActivityLog.create({
      eventId: new mongoose.Types.ObjectId(eventId),
      guestId: guest._id,
      action: "invited",
      details: `${guest.fullName} was invited`,
    });

    return sendSuccess(res, guest, 201);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    throw err;
  }
}

export async function bulkInvite(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId as string;
    const { emails } = bulkInviteSchema.parse(req.body);

    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    const existingGuests = await Guest.find({
      eventId: new mongoose.Types.ObjectId(eventId),
      email: { $in: emails },
    }).select("email");
    const existingEmails = new Set(existingGuests.map((g) => g.email));

    const newEmails = emails.filter((e) => !existingEmails.has(e.toLowerCase()));

    if (newEmails.length === 0) {
      return sendSuccess(res, { added: 0, skipped: emails.length });
    }

    const guestsToCreate = newEmails.map((email) => ({
      fullName: email.split("@")[0].replace(/[._]/g, " "),
      email: email.toLowerCase(),
      company: "Pending",
      badge: "General" as const,
      status: "Invited" as const,
      eventId: new mongoose.Types.ObjectId(eventId),
    }));

    const created = await Guest.insertMany(guestsToCreate);

    const logs = created.map((g) => ({
      eventId: new mongoose.Types.ObjectId(eventId),
      guestId: g._id,
      action: "invited" as const,
      details: `${g.fullName} was bulk-invited`,
    }));
    await ActivityLog.insertMany(logs);

    return sendSuccess(res, {
      added: created.length,
      skipped: emails.length - newEmails.length,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    throw err;
  }
}

export async function csvImport(req: Request, res: Response) {
  const eventId = req.params.eventId as string;

  const event = await Event.findById(eventId);
  if (!event) {
    return sendError(res, "Event not found", 404);
  }

  if (!req.file) {
    return sendError(res, "CSV file is required", 400);
  }

  const content = req.file.buffer.toString("utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  if (lines.length < 2) {
    return sendError(res, "CSV must have a header row and at least one data row", 400);
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const emailIdx = headers.indexOf("email");
  const nameIdx = headers.indexOf("name") !== -1 ? headers.indexOf("name") : headers.indexOf("fullname");
  const companyIdx = headers.indexOf("company");
  const badgeIdx = headers.indexOf("badge");

  if (emailIdx === -1) {
    return sendError(res, "CSV must have an 'email' column", 400);
  }

  const guestsToCreate: Array<Record<string, unknown>> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const email = cols[emailIdx]?.toLowerCase();
    if (!email || !email.includes("@")) continue;

    guestsToCreate.push({
      fullName: nameIdx !== -1 ? cols[nameIdx] : email.split("@")[0].replace(/[._]/g, " "),
      email,
      company: companyIdx !== -1 ? cols[companyIdx] : "Pending",
      badge: badgeIdx !== -1 && ["VIP", "Speaker", "General"].includes(cols[badgeIdx])
        ? cols[badgeIdx]
        : "General",
      status: "Invited",
      eventId: new mongoose.Types.ObjectId(eventId),
    });
  }

  let added = 0;
  let skipped = 0;
  for (const guest of guestsToCreate) {
    try {
      await Guest.create(guest);
      added++;
    } catch {
      skipped++;
    }
  }

  return sendSuccess(res, { added, skipped });
}

export async function updateGuest(req: Request, res: Response) {
  const guest = await Guest.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!guest) {
    return sendError(res, "Guest not found", 404);
  }
  return sendSuccess(res, guest);
}

export async function deleteGuest(req: Request, res: Response) {
  const guest = await Guest.findByIdAndDelete(req.params.id);
  if (!guest) {
    return sendError(res, "Guest not found", 404);
  }
  return sendSuccess(res, { message: "Guest deleted" });
}
