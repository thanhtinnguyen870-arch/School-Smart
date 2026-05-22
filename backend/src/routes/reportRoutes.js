import express from "express";
import { attendanceReport, exportExcel, exportPdf, gradesReport } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect, authorize("admin", "teacher"));
router.get("/attendance", attendanceReport);
router.get("/grades", gradesReport);
router.get("/export-excel", exportExcel);
router.get("/export-pdf", exportPdf);
export default router;
