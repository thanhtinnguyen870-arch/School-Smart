import express from "express";
import { classStudents, createClass, deleteClass, getClass, listClasses, updateClass } from "../controllers/classController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", authorize("admin", "teacher"), listClasses);
router.get("/:id", authorize("admin", "teacher"), getClass);
router.post("/", authorize("admin", "teacher"), createClass);
router.put("/:id", authorize("admin", "teacher"), updateClass);
router.delete("/:id", authorize("admin", "teacher"), deleteClass);
router.get("/:id/students", authorize("admin", "teacher"), classStudents);
export default router;
