import Grade from "../models/Grade.js";
import Student from "../models/Student.js";

const avg = (b) => {
  const scores = [b.oralScore, b.fifteenMinuteScore, b.onePeriodScore, b.midtermScore, b.finalScore].map(Number);
  const weights = [1, 1, 2, 2, 3];
  const total = scores.reduce((sum, score, i) => sum + (Number.isFinite(score) ? score * weights[i] : 0), 0);
  const weight = scores.reduce((sum, score, i) => sum + (Number.isFinite(score) ? weights[i] : 0), 0);
  return weight ? Number((total / weight).toFixed(2)) : 0;
};

export const listGrades = async (req, res) => {
  const filter = {
    ...(req.query.studentId ? { studentId: req.query.studentId } : {}),
    ...(req.query.classId ? { classId: req.query.classId } : {}),
    ...(req.query.subject ? { subject: req.query.subject } : {})
  };
  res.json(await Grade.find(filter).populate("studentId classId").sort("subject -createdAt"));
};
export const createGrade = async (req, res) => res.status(201).json(await Grade.create({ ...req.body, averageScore: avg(req.body) }));
export const updateGrade = async (req, res) => {
  const current = await Grade.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Không tìm thấy bảng điểm" });

  const nextGrade = { ...current.toObject(), ...req.body };
  const grade = await Grade.findByIdAndUpdate(
    req.params.id,
    { ...req.body, averageScore: avg(nextGrade) },
    { new: true }
  ).populate("studentId classId");

  res.json(grade);
};
export const deleteGrade = async (req, res) => {
  const grade = await Grade.findByIdAndDelete(req.params.id);
  if (!grade) return res.status(404).json({ message: "Không tìm thấy bảng điểm" });
  res.json({ message: "Đã xóa điểm" });
};
export const importExcel = async (req, res) => res.json({ message: "Excel uploaded. Parsing hook is ready for production import.", file: req.file?.filename });
export const studentGrades = async (req, res) => {
  if (req.user.role === "student") {
    const student = await Student.findOne({ userId: req.user._id }).select("_id");
    if (!student || String(student._id) !== String(req.params.id)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
  }

  const filter = {
    studentId: req.params.id,
    ...(req.query.subject ? { subject: req.query.subject } : {})
  };
  res.json(await Grade.find(filter).populate("classId").sort("subject -createdAt"));
};
