import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    fileUrl: String,
    content: String,
    submittedAt: Date,
    score: Number,
    feedback: String,
    status: { type: String, default: "submitted" }
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
