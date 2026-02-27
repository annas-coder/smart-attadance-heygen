import { Router } from "express";
import { lookupGuest, checkinGuest } from "../controllers/kiosk.controller.js";
import { handleGeneralChat, handleUserChat } from "../controllers/chat.controller.js";

const router = Router();

router.post("/lookup", lookupGuest);
router.post("/checkin/:guestId", checkinGuest);
router.post("/chat", handleGeneralChat);
router.post("/chat/user", handleUserChat);

export default router;
