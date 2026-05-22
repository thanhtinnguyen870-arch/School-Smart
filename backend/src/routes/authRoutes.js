import express from "express";
import { body } from "express-validator";
import { login, me, register, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", [body("email").isEmail(), body("password").isLength({ min: 6 })], register);
router.post("/login", login);
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);
export default router;
