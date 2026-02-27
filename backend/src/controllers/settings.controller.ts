import { Request, Response } from "express";
import { Organization } from "../models/Organization.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export async function getSettings(_req: Request, res: Response) {
  let org = await Organization.findOne().lean();

  if (!org) {
    org = await Organization.create({
      name: "FutureFin Expo",
      email: "admin@futurefin.com",
    });
  }

  return sendSuccess(res, org);
}

export async function updateSettings(req: Request, res: Response) {
  const org = await Organization.findOneAndUpdate(
    {},
    { $set: req.body },
    { new: true, runValidators: true, upsert: true }
  );

  if (!org) {
    return sendError(res, "Failed to update settings", 500);
  }

  return sendSuccess(res, org);
}
