import express from "express";
import { available, createTest, deleteTest, exportResultsExcel, getTest, listTests, myResult, results, studentTests, submitTest, updateTest } from "../controllers/testController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/student/available", available);
router.get("/student/my-tests", authorize("student"), studentTests);
router.get("/student/:id/my-result", authorize("student"), myResult);
router.get("/", authorize("admin", "teacher"), listTests);
router.get("/:id", getTest);
router.post("/", authorize("admin", "teacher"), upload.fields([
  { name: "file", maxCount: 1 },
  { name: "q1Image", maxCount: 1 },
  { name: "q2Image", maxCount: 1 }
]), createTest);
router.put("/:id", authorize("admin", "teacher"), updateTest);
router.delete("/:id", authorize("admin", "teacher"), deleteTest);
router.post("/:id/submit", submitTest);
router.get("/:id/results", authorize("admin", "teacher"), results);
router.get("/:id/results/export-excel", authorize("admin", "teacher"), exportResultsExcel);
export default router;
