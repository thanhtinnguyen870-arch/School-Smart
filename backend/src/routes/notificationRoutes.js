import express from "express";
import { createNotification, deleteNotification, listNotifications, readNotification } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", listNotifications);
router.post("/", authorize("admin", "teacher"), upload.single("file"), createNotification);
router.put("/:id/read", readNotification);
router.delete("/:id", authorize("admin", "teacher"), deleteNotification);
export default router;
