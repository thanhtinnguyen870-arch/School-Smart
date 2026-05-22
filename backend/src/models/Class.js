import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    classCode: { type: String, required: true, unique: true },
    className: { type: String, required: true },
    homeroomTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    schoolYear: String,
    description: String,
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
