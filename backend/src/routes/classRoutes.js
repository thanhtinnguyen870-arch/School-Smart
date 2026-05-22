import express from "express";
import { classStudents, createClass, deleteClass, getClass, listClasses, updateClass } from "../controllers/classController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", listClasses);
router.get("/:id", getClass);
router.post("/", authorize("admin", "teacher"), createClass);
router.put("/:id", authorize("admin", "teacher"), updateClass);
router.delete("/:id", authorize("admin", "teacher"), deleteClass);
router.get("/:id/students", classStudents);
export default router;
