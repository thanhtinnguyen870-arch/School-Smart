import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    subject: { type: String, required: true },
    oralScore: Number,
    fifteenMinuteScore: Number,
    onePeriodScore: Number,
    midtermScore: Number,
    finalScore: Number,
    averageScore: Number,
    semester: String,
    schoolYear: String
  },
  { timestamps: true }
);

export default mongoose.model("Grade", gradeSchema);
