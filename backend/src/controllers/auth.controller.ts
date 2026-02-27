import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Organization } from "../models/Organization.js";
import { generateToken } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import type { AuthRequest } from "../types/index.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  organizationName: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return sendError(res, "Email already registered", 409);
    }

    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({
        name: data.organizationName || "FutureFin Expo",
        email: data.email,
      });
    }

    const user = await User.create({
      email: data.email,
      password: data.password,
      name: data.name,
      role: "admin",
      organizationId: org._id,
    });

    const token = generateToken(String(user._id), user.role);

    return sendSuccess(
      res,
      { user: user.toJSON(), token },
      201
    );
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    throw err;
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    const isValid = await user.comparePassword(data.password);
    if (!isValid) {
      return sendError(res, "Invalid email or password", 401);
    }

    const token = generateToken(String(user._id), user.role);

    return sendSuccess(res, { user: user.toJSON(), token });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, "Validation failed", 400, err.errors);
    }
    throw err;
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId).populate("organizationId");
  if (!user) {
    return sendError(res, "User not found", 404);
  }
  return sendSuccess(res, user.toJSON());
}
