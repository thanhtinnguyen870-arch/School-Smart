import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import ActivityLog from "../models/ActivityLog.js";

const startOfDay = (value = new Date()) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

const resolveAutoAttendance = (time = new Date()) => {
  return {
    allowed: true,
    status: "present",
    message: "Học sinh được điểm danh hiện tại."
  };
};

export const checkIn = async (req, res) => {
  const { studentId, confidence = 96, method = "face", note, status: requestedStatus } = req.body;
  const student = await Student.findById(studentId).populate("classId");
  if (!student) return res.status(404).json({ message: "Không tìm thấy học sinh" });

  if (method === "face" && !(Array.isArray(student.faceDescriptor) && student.faceDescriptor.length >= 128)) {
    return res.status(422).json({ message: "Học sinh chưa có dữ liệu khuôn mặt hợp lệ" });
  }

  const date = startOfDay();
  const checkInTime = new Date();
  const autoAttendance = resolveAutoAttendance(checkInTime);
  if (method === "face" && !autoAttendance.allowed) {
    return res.status(422).json({ message: autoAttendance.message, status: autoAttendance.status, student });
  }

  const validStatuses = ["present", "excused"];
  const status = method === "manual" ? (validStatuses.includes(requestedStatus) ? requestedStatus : "present") : autoAttendance.status;
  const payload = {
    studentId,
    classId: student.classId?._id,
    date,
    checkInTime: status === "excused" ? undefined : checkInTime,
    status,
    confidence,
    method,
    note
  };

  const existing = await Attendance.findOne({ studentId, date });
  if (existing) {
    if (method !== "manual") {
      return res.status(200).json({ message: "Học sinh đã điểm danh hôm nay", attendance: existing, student, duplicate: true });
    }

    Object.assign(existing, payload);
    await existing.save();
    return res.json({ message: "Đã cập nhật điểm danh thủ công", attendance: existing, student });
  }

  const attendance = await Attendance.create(payload);
  try {
    await ActivityLog.create({ userId: req.user?._id, action: "attendance_checkin", description: `${student.fullName} checked in by ${method}` });
    req.app.get("io")?.emit("attendance:new", attendance);
    res.status(201).json({ attendance, student });
  } catch (error) {
    res.status(201).json({ attendance, student });
  }
};

export const manual = async (req, res) => checkIn({ ...req, body: { ...req.body, method: "manual", confidence: req.body.confidence || 100 } }, res);

export const today = async (req, res) => {
  const filter = { date: startOfDay() };
  if (req.query.classId) filter.classId = req.query.classId;
  res.json(await Attendance.find(filter).populate("studentId classId").sort("-checkInTime"));
};
export const studentAttendance = async (req, res) => {
  if (req.user.role === "student") {
    const student = await Student.findOne({ userId: req.user._id }).select("_id");
    if (!student || String(student._id) !== String(req.params.id)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
  }

  res.json(await Attendance.find({ studentId: req.params.id }).populate("classId").sort("-date"));
};
export const classAttendance = async (req, res) => res.json(await Attendance.find({ classId: req.params.classId }).populate("studentId").sort("-date"));

export const deleteAttendance = async (req, res) => {
  const attendance = await Attendance.findByIdAndDelete(req.params.id);
  if (!attendance) return res.status(404).json({ message: "Không tìm thấy bản ghi điểm danh" });
  res.json({ message: "Đã xóa bản ghi điểm danh" });
};

export const resetToday = async (req, res) => {
  const filter = { date: startOfDay() };
  if (req.query.classId) filter.classId = req.query.classId;
  const result = await Attendance.deleteMany(filter);
  res.json({ message: "Đã xóa điểm danh hôm nay", deletedCount: result.deletedCount });
};

export const statistics = async (req, res) => {
  const date = startOfDay(req.query.date);
  const rows = await Attendance.aggregate([{ $match: { date } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
  const totalStudents = await Student.countDocuments();
  const summary = rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});
  const present = summary.present || 0;
  const excused = summary.excused || 0;
  summary.absent = Math.max(0, totalStudents - present - excused);
  res.json({ totalStudents, summary });
};

export const report = async (req, res) => res.json(await Attendance.find().populate("studentId classId").sort("-date").limit(500));
