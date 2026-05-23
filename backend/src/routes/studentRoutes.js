import express from "express";
import { createStudent, deleteFaceSample, deleteStudent, getStudent, listStudents, registerFaceSample, updateStudent, uploadFace } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", authorize("admin", "teacher"), listStudents);
router.get("/:id", getStudent);
router.post("/", authorize("admin", "teacher"), createStudent);
router.put("/:id", authorize("admin", "teacher"), updateStudent);
router.delete("/:id", authorize("admin", "teacher"), deleteStudent);
router.post("/:id/upload-face", authorize("admin", "teacher"), upload.array("faces", 8), uploadFace);
router.post("/:id/register-face-sample", authorize("admin", "teacher"), registerFaceSample);
router.delete("/:id/face-sample", authorize("admin", "teacher"), deleteFaceSample);
export default router;
