import { Router } from "express";
import {
  listEvents,
  listPublicEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { eventGuestRouter } from "./guest.routes.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/public", listPublicEvents);
router.get("/", authenticate, listEvents);
router.get("/:id", authenticate, getEvent);
router.post("/", authenticate, createEvent);
router.put("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);

router.use("/:eventId/guests", eventGuestRouter);

export default router;
