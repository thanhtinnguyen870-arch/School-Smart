import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: String,
    type: { type: String, enum: ["multiple", "essay"], default: "multiple" },
    imageUrl: String,
    imageName: String,
    options: [String],
    correctAnswer: String,
    score: { type: Number, default: 1 }
  },
  { _id: true }
);

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: String,
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    duration: Number,
    startTime: Date,
    endTime: Date,
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "open" }
  },
  { timestamps: true }
);

export default mongoose.model("Test", testSchema);
