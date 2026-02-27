import { Router } from "express";
import multer from "multer";
import {
  listGuests,
  addGuest,
  bulkInvite,
  csvImport,
  updateGuest,
  deleteGuest,
} from "../controllers/guest.controller.js";
import { authenticate } from "../middleware/auth.js";

const csvUpload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Nested under /api/events/:eventId/guests (mounted from event routes)
// But also /api/guests/:id for update/delete
router.put("/:id", authenticate, updateGuest);
router.delete("/:id", authenticate, deleteGuest);

export default router;

// Separate router for event-scoped guest routes
export const eventGuestRouter = Router({ mergeParams: true });
eventGuestRouter.get("/", authenticate, listGuests);
eventGuestRouter.post("/", authenticate, addGuest);
eventGuestRouter.post("/bulk", authenticate, bulkInvite);
eventGuestRouter.post("/csv", authenticate, csvUpload.single("file"), csvImport);
