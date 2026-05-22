import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";

const filePayload = (file) =>
  file
    ? {
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        fileType: file.mimetype
      }
    : {};

export const listAssignments = async (req, res) => res.json(await Assignment.find().populate("classId createdBy", "className name").sort("-createdAt"));
export const getAssignment = async (req, res) => res.json(await Assignment.findById(req.params.id).populate("classId createdBy", "className name"));
export const createAssignment = async (req, res) => res.status(201).json(await Assignment.create({ ...req.body, ...filePayload(req.file), createdBy: req.user._id }));
export const updateAssignment = async (req, res) => res.json(await Assignment.findByIdAndUpdate(req.params.id, { ...req.body, ...filePayload(req.file) }, { new: true }));
export const deleteAssignment = async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ message: "Assignment deleted" });
};
export const submitAssignment = async (req, res) => res.status(201).json(await Submission.create({ assignmentId: req.params.id, studentId: req.body.studentId, content: req.body.content, fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl, submittedAt: new Date() }));
export const submissions = async (req, res) => res.json(await Submission.find({ assignmentId: req.params.id }).populate("studentId"));
