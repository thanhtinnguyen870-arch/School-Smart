import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: String,
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    description: String,
    fileUrl: String,
    fileName: String,
    fileType: String,
    deadline: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "open" }
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
