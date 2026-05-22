import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    answers: Array,
    score: Number,
    submittedAt: Date,
    status: { type: String, default: "submitted" }
  },
  { timestamps: true }
);

testResultSchema.index({ testId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("TestResult", testResultSchema);
