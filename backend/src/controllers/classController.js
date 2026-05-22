import Class from "../models/Class.js";

export const listClasses = async (req, res) => res.json(await Class.find().populate("homeroomTeacher", "name email").populate("students").sort("className"));
export const getClass = async (req, res) => {
  const item = await Class.findById(req.params.id).populate("homeroomTeacher", "name email").populate("students");
  if (!item) return res.status(404).json({ message: "Class not found" });
  res.json(item);
};
export const createClass = async (req, res) => res.status(201).json(await Class.create(req.body));
export const updateClass = async (req, res) => res.json(await Class.findByIdAndUpdate(req.params.id, req.body, { new: true }));
export const deleteClass = async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ message: "Class deleted" });
};
export const classStudents = async (req, res) => {
  const item = await Class.findById(req.params.id).populate("students");
  res.json(item?.students || []);
};
