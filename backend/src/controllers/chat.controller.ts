import { Request, Response } from "express";
import { z } from "zod";
import { generalChat, userChat } from "../services/chatService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const generalChatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().min(1),
});

const userProfileSchema = z.object({
  fullName: z.string().min(1),
  designation: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  registrationId: z.string().optional(),
  agenda: z.array(z.object({
    title: z.string(),
    location: z.string(),
    time: z.string(),
  })).optional(),
});

const userChatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().min(1),
  userProfile: userProfileSchema,
});

export async function handleGeneralChat(req: Request, res: Response) {
  try {
    const { message, sessionId } = generalChatSchema.parse(req.body);
    const response = await generalChat(sessionId, message);
    return sendSuccess(res, { response });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    console.error("General chat error:", err);
    return sendError(res, "Chat service error", 500);
  }
}

export async function handleUserChat(req: Request, res: Response) {
  try {
    const { message, sessionId, userProfile } = userChatSchema.parse(req.body);
    const response = await userChat(sessionId, message, userProfile);
    return sendSuccess(res, { response });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    console.error("User chat error:", err);
    return sendError(res, "Chat service error", 500);
  }
}
