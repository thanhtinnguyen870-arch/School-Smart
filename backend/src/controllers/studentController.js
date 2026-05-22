import Student from "../models/Student.js";
import Class from "../models/Class.js";
import User from "../models/User.js";

const DEFAULT_STUDENT_PASSWORD = "123456";

const buildStudentEmail = (body) =>
  String(body.email || `${body.studentCode}@smartschool.local`).trim().toLowerCase();

export const listStudents = async (req, res) => {
  const { search = "", classId, page = 1, limit = 10 } = req.query;
  const filter = {
    ...(classId ? { classId } : {}),
    ...(search ? { $or: [{ fullName: new RegExp(search, "i") }, { studentCode: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] } : {})
  };
  const [items, total] = await Promise.all([
    Student.find(filter).populate("classId").populate("userId", "name email role isActive").skip((page - 1) * limit).limit(Number(limit)).sort("-createdAt"),
    Student.countDocuments(filter)
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) || 1 });
};

export const getStudent = async (req, res) => {
  const student = await Student.findById(req.params.id).populate("classId userId", "-password");
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
};

export const createStudent = async (req, res) => {
  const email = buildStudentEmail(req.body);
  const existingStudent = await Student.findOne({ studentCode: req.body.studentCode });
  if (existingStudent) return res.status(409).json({ message: "Mã học sinh đã tồn tại" });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ message: "Email đăng nhập đã tồn tại" });

  const user = await User.create({
    name: req.body.fullName,
    email,
    password: DEFAULT_STUDENT_PASSWORD,
    role: "student",
    avatar: req.body.avatar
  });

  const student = await Student.create({ ...req.body, email, userId: user._id });
  if (student.classId) await Class.findByIdAndUpdate(student.classId, { $addToSet: { students: student._id } });
  await student.populate("classId userId", "-password");
  res.status(201).json({
    student,
    account: {
      email: user.email,
      password: DEFAULT_STUDENT_PASSWORD
    }
  });
};

export const updateStudent = async (req, res) => {
  const currentStudent = await Student.findById(req.params.id);
  if (!currentStudent) return res.status(404).json({ message: "Student not found" });

  const nextEmail = req.body.email ? buildStudentEmail(req.body) : currentStudent.email;
  if (nextEmail && nextEmail !== currentStudent.email) {
    const emailOwner = await User.findOne({ email: nextEmail, _id: { $ne: currentStudent.userId } });
    if (emailOwner) return res.status(409).json({ message: "Email đăng nhập đã tồn tại" });
  }

  const student = await Student.findByIdAndUpdate(req.params.id, { ...req.body, email: nextEmail }, { new: true });
  if (!student) return res.status(404).json({ message: "Student not found" });
  if (student.classId) await Class.findByIdAndUpdate(student.classId, { $addToSet: { students: student._id } });

  if (student.userId) {
    await User.findByIdAndUpdate(student.userId, {
      name: student.fullName,
      email: student.email,
      avatar: student.avatar
    });
  }

  res.json(student);
};

export const deleteStudent = async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  await Class.updateMany({}, { $pull: { students: student._id } });
  if (student.userId) await User.findByIdAndDelete(student.userId);
  res.json({ message: "Student deleted" });
};

export const uploadFace = async (req, res) => {
  const files = req.files?.map((file) => `/uploads/${file.filename}`) || [];
  const student = await Student.findByIdAndUpdate(req.params.id, { $push: { faceImages: { $each: files } } }, { new: true });
  res.json(student);
};

export const registerFaceSample = async (req, res) => {
  const { imageData, descriptor } = req.body;
  if (!imageData?.startsWith("data:image/")) {
    return res.status(422).json({ message: "Cần ảnh khuôn mặt hợp lệ từ webcam" });
  }
  if (!Array.isArray(descriptor) || descriptor.length < 128) {
    return res.status(422).json({ message: "Descriptor face-api.js không hợp lệ. Vui lòng đăng ký lại khuôn mặt." });
  }

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    {
      $push: { faceImages: imageData },
      $set: { faceDescriptor: descriptor.map(Number) }
    },
    { new: true }
  ).populate("classId");

  if (!student) return res.status(404).json({ message: "Không tìm thấy học sinh" });
  res.json({ message: "Đăng ký khuôn mặt thành công", student });
};

export const deleteFaceSample = async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { $set: { faceImages: [], faceDescriptor: [] } },
    { new: true }
  ).populate("classId");

  if (!student) return res.status(404).json({ message: "Không tìm thấy học sinh" });
  res.json({ message: "Đã xóa mẫu khuôn mặt", student });
};
