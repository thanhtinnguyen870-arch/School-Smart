import express from "express";
import { checkIn, classAttendance, deleteAttendance, manual, report, resetToday, statistics, studentAttendance, today } from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.post("/check-in", authorize("admin", "teacher"), checkIn);
router.post("/manual", authorize("admin", "teacher"), manual);
router.get("/today", authorize("admin", "teacher"), today);
router.get("/student/:id", studentAttendance);
router.get("/class/:classId", authorize("admin", "teacher"), classAttendance);
router.get("/statistics", authorize("admin", "teacher"), statistics);
router.get("/report", authorize("admin", "teacher"), report);
router.delete("/today/reset", authorize("admin", "teacher"), resetToday);
router.delete("/:id", authorize("admin", "teacher"), deleteAttendance);
export default router;
