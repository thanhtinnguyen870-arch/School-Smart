import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    date: { type: Date, required: true },
    checkInTime: Date,
    checkOutTime: Date,
    status: { type: String, enum: ["present", "excused"], default: "present" },
    confidence: Number,
    method: { type: String, enum: ["face", "manual"], default: "face" },
    note: String
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
export default mongoose.model("Attendance", attendanceSchema);
