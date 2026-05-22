import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentCode: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: String,
    phone: String,
    gender: String,
    dateOfBirth: Date,
    address: String,
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    avatar: String,
    faceImages: [String],
    faceDescriptor: Array,
    parentName: String,
    parentPhone: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
