import Notification from "../models/Notification.js";

export const listNotifications = async (req, res) => {
  const filter = req.user.role === "admin" || req.user.role === "teacher" ? {} : { $or: [{ receiverRole: req.user.role }, { receiverId: req.user._id }] };
  const rows = await Notification.find(filter).populate("createdBy", "name").sort("-createdAt").lean();
  const userId = String(req.user._id);
  res.json(rows.map((item) => ({
    ...item,
    isRead: Boolean(item.isRead || item.readBy?.some((id) => String(id) === userId))
  })));
};
export const createNotification = async (req, res) => {
  const filePayload = req.file
    ? {
        attachmentUrl: `/uploads/${req.file.filename}`,
        attachmentName: req.file.originalname,
        attachmentType: req.file.mimetype
      }
    : {};

  const notification = await Notification.create({
    ...req.body,
    receiverRole: req.body.receiverRole || "student",
    ...filePayload,
    createdBy: req.user._id
  });

  res.status(201).json(await notification.populate("createdBy", "name"));
};
export const readNotification = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { readBy: req.user._id } },
    { new: true }
  ).populate("createdBy", "name").lean();
  if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });
  res.json({ ...notification, isRead: true });
};
export const deleteNotification = async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });
  res.json({ message: "Đã xóa thông báo" });
};
