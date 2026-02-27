import { Router } from "express";
import {
  submitRegistration,
  uploadFaceImage,
  confirmRegistration,
  viewTicket,
} from "../controllers/register.controller.js";
import { uploadFace } from "../middleware/upload.js";

const router = Router();

router.post("/register", submitRegistration);
router.post("/register/face/:guestId", uploadFace.single("face"), uploadFaceImage);
router.post("/register/confirm/:guestId", confirmRegistration);
router.get("/tickets/:registrationId", viewTicket);

export default router;
