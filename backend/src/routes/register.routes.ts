import express, { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  submitRegistration,
  checkRegistrationEmail,
  uploadFaceImage,
  confirmRegistration,
  viewTicket,
} from "../controllers/register.controller.js";
import { uploadFace } from "../middleware/upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "..", "uploads");

const router = Router();

/**
 * Serve uploaded files under /api so reverse proxies that only proxy /api (not /uploads) still
 * deliver face images with CORS for cross-origin <img crossOrigin="anonymous">.
 */
router.use(
  "/public-uploads",
  express.static(uploadsRoot, {
    maxAge: "30d",
    immutable: true,
  }),
);

router.get("/register/check-email", checkRegistrationEmail);
router.post("/register", submitRegistration);
router.post("/register/face/:guestId", uploadFace.single("face"), uploadFaceImage);
router.post("/register/confirm/:guestId", confirmRegistration);
router.get("/tickets/:registrationId", viewTicket);

export default router;
