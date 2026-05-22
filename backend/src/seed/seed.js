import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import Grade from "../models/Grade.js";
import Assignment from "../models/Assignment.js";
import Test from "../models/Test.js";
import Notification from "../models/Notification.js";
import ActivityLog from "../models/ActivityLog.js";
import Submission from "../models/Submission.js";
import TestResult from "../models/TestResult.js";

const today = new Date();
today.setHours(0, 0, 0, 0);

const run = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(), Student.deleteMany(), Class.deleteMany(), Attendance.deleteMany(),
    Grade.deleteMany(), Assignment.deleteMany(), Test.deleteMany(), Notification.deleteMany(),
    ActivityLog.deleteMany(), Submission.deleteMany(), TestResult.deleteMany()
  ]);

  const admin = await User.create({ name: "Admin Teacher", email: "admin@gmail.com", password: "123456", role: "admin" });
  const studentUser = await User.create({ name: "Nguyen Van A", email: "student@gmail.com", password: "123456", role: "student" });

  const classes = await Class.insertMany([
    { classCode: "12A1", className: "12A1", homeroomTeacher: admin._id, schoolYear: "2025-2026", description: "Science excellence class" },
    { classCode: "11B2", className: "11B2", homeroomTeacher: admin._id, schoolYear: "2025-2026", description: "AI pilot class" },
    { classCode: "10C3", className: "10C3", homeroomTeacher: admin._id, schoolYear: "2025-2026", description: "Digital learning class" }
  ]);

  const names = ["Nguyen Van A", "Tran Thi B", "Le Minh C", "Pham Anh D", "Hoang Bao E", "Doan Gia F", "Vo Khanh G", "Bui Ngoc H", "Dang Quang I", "Mai Linh K"];
  const students = await Student.insertMany(names.map((name, i) => ({
    studentCode: `HS${String(i + 1).padStart(3, "0")}`,
    fullName: name,
    email: i === 0 ? "student@gmail.com" : `student${i + 1}@gmail.com`,
    phone: `09000000${i}`,
    gender: i % 2 ? "Female" : "Male",
    dateOfBirth: new Date(2008, i % 12, i + 1),
    address: "Ho Chi Minh City",
    classId: classes[i % classes.length]._id,
    avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
    faceImages: [],
    faceDescriptor: [],
    parentName: `Parent ${i + 1}`,
    parentPhone: `09100000${i}`,
    userId: i === 0 ? studentUser._id : undefined,
    status: "active"
  })));

  for (const cls of classes) {
    cls.students = students.filter((s) => String(s.classId) === String(cls._id)).map((s) => s._id);
    await cls.save();
  }

  await Attendance.insertMany(students.slice(0, 7).map((s, i) => ({
    studentId: s._id,
    classId: s.classId,
    date: today,
    checkInTime: new Date(today.getTime() + (7 * 60 + i * 4) * 60000),
    status: i > 4 ? "late" : "present",
    confidence: 92 + i,
    method: i % 2 ? "manual" : "face"
  })));

  const subjects = ["Math", "Physics", "Chemistry", "English", "Computer Science"];
  await Grade.insertMany(students.flatMap((s, i) => subjects.slice(0, 2).map((subject, j) => {
    const body = { oralScore: 7 + (i % 3), fifteenMinuteScore: 8, onePeriodScore: 7.5 + j, midtermScore: 8, finalScore: 8.5, studentId: s._id, classId: s.classId, subject, semester: "HK1", schoolYear: "2025-2026" };
    body.averageScore = Number(((body.oralScore + body.fifteenMinuteScore + body.onePeriodScore * 2 + body.midtermScore * 2 + body.finalScore * 3) / 9).toFixed(2));
    return body;
  })));

  const assignment = await Assignment.create({ title: "AI Camera Reflection", subject: "Computer Science", classId: classes[0]._id, description: "Write a one-page report about face attendance systems.", deadline: new Date(Date.now() + 7 * 86400000), createdBy: admin._id });
  await Test.create({
    title: "Math Quick Test", subject: "Math", classId: classes[0]._id, duration: 20,
    startTime: new Date(Date.now() - 86400000), endTime: new Date(Date.now() + 86400000 * 5), createdBy: admin._id, status: "open",
    questions: [
      { questionText: "2 + 2 = ?", type: "multiple", options: ["3", "4", "5", "6"], correctAnswer: "4", score: 5 },
      { questionText: "Explain why attendance matters.", type: "essay", score: 5 }
    ]
  });

  await Notification.insertMany([
    { title: "Welcome to SMART SCHOOL AI", content: "The AI attendance module is ready for demo.", receiverRole: "student", createdBy: admin._id },
    { title: "Assignment published", content: assignment.title, receiverRole: "student", createdBy: admin._id }
  ]);

  console.log("Seed completed");
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
