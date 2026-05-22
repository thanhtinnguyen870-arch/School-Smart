import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    receiverRole: String,
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attachmentUrl: String,
    attachmentName: String,
    attachmentType: String,
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
