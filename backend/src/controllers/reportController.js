import Attendance from "../models/Attendance.js";
import Grade from "../models/Grade.js";
import { sendPdf } from "../utils/exportPdf.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sendAttendanceHtmlExcel = (res, rows) => {
  const tableRows = rows.map((row) => `
    <tr>
      <td class="center">${row.stt}</td>
      <td>${escapeHtml(row.fullName)}</td>
      <td class="center">${escapeHtml(row.studentCode)}</td>
      <td class="center">${escapeHtml(row.date)}</td>
    </tr>
  `).join("");

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12pt; }
        th, td { border: 1px solid #334155; padding: 8px 10px; vertical-align: middle; }
        th { background: #bfdbfe; color: #0f172a; font-weight: 700; text-align: center; }
        td { color: #111827; }
        .center { text-align: center; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th style="width: 60px;">STT</th>
            <th style="width: 260px;">Họ và tên</th>
            <th style="width: 140px;">Mã học sinh</th>
            <th style="width: 120px;">Ngày</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
  </html>`;

  res.setHeader("Content-Disposition", "attachment; filename=attendance-report.xls");
  res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
  res.send(Buffer.from(`\ufeff${html}`, "utf8"));
};

export const attendanceReport = async (req, res) => res.json(await Attendance.find().populate("studentId classId").sort("-date").limit(1000));
export const gradesReport = async (req, res) => res.json(await Grade.find().populate("studentId classId").sort("-createdAt").limit(1000));
export const exportExcel = async (req, res) => {
  const rows = await Attendance.find().populate("studentId classId").sort("date checkInTime").lean();
  sendAttendanceHtmlExcel(res, rows.map((row, index) => ({
    stt: index + 1,
    fullName: row.studentId?.fullName || "",
    studentCode: row.studentId?.studentCode || "",
    date: row.date ? new Date(row.date).toLocaleDateString("vi-VN") : ""
  })));
};
export const exportPdf = async (req, res) => {
  const rows = await Attendance.find().populate("studentId classId").lean();
  sendPdf(res, "SMART SCHOOL AI Attendance Report", rows.map((r) => ({ student: r.studentId?.fullName, class: r.classId?.className, status: r.status, date: r.date })));
};
