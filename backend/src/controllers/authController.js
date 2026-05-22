import { validationResult } from "express-validator";
import User from "../models/User.js";
import Student from "../models/Student.js";
import { generateToken } from "../utils/generateToken.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isActive: user.isActive
});

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const { name, email, password, role = "student" } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ message: "Email already exists" });
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ user: publicUser(user), token: generateToken(user._id) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const student = user.role === "student" ? await Student.findOne({ userId: user._id }) : null;
  res.json({ user: { ...publicUser(user), studentId: student?._id }, token: generateToken(user._id) });
};

export const me = async (req, res) => {
  const student = req.user.role === "student" ? await Student.findOne({ userId: req.user._id }) : null;
  res.json({ user: { ...publicUser(req.user), studentId: student?._id } });
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name ?? user.name;
  user.avatar = req.body.avatar ?? user.avatar;

  if (req.body.password || req.body.newPassword) {
    const nextPassword = req.body.newPassword || req.body.password;
    if (!req.body.currentPassword) {
      return res.status(422).json({ message: "Vui lòng nhập mật khẩu hiện tại" });
    }

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    if (String(nextPassword).length < 6) {
      return res.status(422).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    user.password = nextPassword;
  }

  await user.save();
  res.json({ user: publicUser(user) });
};
