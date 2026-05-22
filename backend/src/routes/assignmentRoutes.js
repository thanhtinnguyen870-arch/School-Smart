import express from "express";
import { createAssignment, deleteAssignment, getAssignment, listAssignments, submissions, submitAssignment, updateAssignment } from "../controllers/assignmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", listAssignments);
router.get("/:id", getAssignment);
router.post("/", authorize("admin", "teacher"), upload.single("file"), createAssignment);
router.put("/:id", authorize("admin", "teacher"), upload.single("file"), updateAssignment);
router.delete("/:id", authorize("admin", "teacher"), deleteAssignment);
router.post("/:id/submit", upload.single("file"), submitAssignment);
router.get("/:id/submissions", authorize("admin", "teacher"), submissions);
export default router;
