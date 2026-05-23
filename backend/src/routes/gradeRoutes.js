import express from "express";
import { createGrade, deleteGrade, importExcel, listGrades, studentGrades, updateGrade } from "../controllers/gradeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", authorize("admin", "teacher"), listGrades);
router.post("/", authorize("admin", "teacher"), createGrade);
router.put("/:id", authorize("admin", "teacher"), updateGrade);
router.delete("/:id", authorize("admin", "teacher"), deleteGrade);
router.post("/import-excel", authorize("admin", "teacher"), upload.single("file"), importExcel);
router.get("/student/:id", studentGrades);
export default router;
