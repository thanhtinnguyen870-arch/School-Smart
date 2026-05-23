import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Student from "../models/Student.js";

const filePayload = (file) =>
  file
    ? {
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        fileType: file.mimetype
      }
    : {};

export const listAssignments = async (req, res) => {
  const student = req.user.role === "student" ? await Student.findOne({ userId: req.user._id }).select("classId") : null;
  const filter = {
    ...(student?.classId ? { classId: student.classId } : req.query.classId ? { classId: req.query.classId } : {}),
    ...(req.query.subject ? { subject: req.query.subject } : {})
  };
  res.json(await Assignment.find(filter).populate("classId createdBy", "className name").sort("-createdAt"));
};
export const getAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate("classId createdBy", "className name");
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  if (req.user.role === "student") {
    const student = await Student.findOne({ userId: req.user._id }).select("classId");
    if (!student || String(assignment.classId?._id || assignment.classId) !== String(student.classId)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
  }

  res.json(assignment);
};
export const createAssignment = async (req, res) => res.status(201).json(await Assignment.create({ ...req.body, ...filePayload(req.file), createdBy: req.user._id }));
export const updateAssignment = async (req, res) => res.json(await Assignment.findByIdAndUpdate(req.params.id, { ...req.body, ...filePayload(req.file) }, { new: true }));
export const deleteAssignment = async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ message: "Assignment deleted" });
};
export const submitAssignment = async (req, res) => res.status(201).json(await Submission.create({ assignmentId: req.params.id, studentId: req.body.studentId, content: req.body.content, fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl, submittedAt: new Date() }));
export const submissions = async (req, res) => res.json(await Submission.find({ assignmentId: req.params.id }).populate("studentId"));
