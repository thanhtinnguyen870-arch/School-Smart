import React, { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const pageMeta = {
  "/admin/dashboard": ["Dashboard", "Tổng quan vận hành trường học thông minh"],
  "/admin/face-enrollment": ["Đăng ký khuôn mặt", "Chuẩn hóa dữ liệu FaceID cho học sinh"],
  "/admin/attendance": ["Điểm danh AI", "Quét khuôn mặt theo lớp nhanh và chính xác"],
  "/admin/students": ["Học sinh", "Quản lý hồ sơ và tài khoản đăng nhập"],
  "/admin/classes": ["Lớp học", "Tổ chức lớp, sĩ số và giáo viên chủ nhiệm"],
  "/admin/grades": ["Điểm số", "Nhập, cập nhật và theo dõi điểm theo môn"],
  "/admin/assignments": ["Bài tập", "Giao bài và quản lý nộp bài"],
  "/admin/tests": ["Bài kiểm tra", "Tạo đề, chấm điểm và xem kết quả"],
  "/admin/reports": ["Thống kê", "Báo cáo học tập và điểm danh"],
  "/admin/notifications": ["Thông báo", "Tin tức, công văn và ảnh thông báo"],
  "/admin/settings": ["Cài đặt", "Thiết lập tài khoản và hệ thống"],
  "/student/dashboard": ["Trang chủ", "Không gian học tập cá nhân"],
  "/student/profile": ["Cá nhân", "Thông tin học sinh"],
  "/student/grades": ["Điểm của tôi", "Xem điểm theo từng môn học"],
  "/student/attendance": ["Lịch sử điểm danh", "Theo dõi chuyên cần"],
  "/student/assignments": ["Bài tập", "Bài tập được giao và trạng thái nộp"],
  "/student/tests": ["Bài kiểm tra", "Danh sách bài kiểm tra đang mở"],
  "/student/notifications": ["Thông báo", "Cập nhật mới từ giáo viên"]
};

export default function Topbar() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [title, description] = useMemo(() => {
    const exact = pageMeta[location.pathname];
    if (exact) return exact;
    const key = Object.keys(pageMeta).find((path) => location.pathname.startsWith(path));
    return key ? pageMeta[key] : ["SMART SCHOOL AI", "Bảng điều khiển quản lý học sinh"];
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 lg:px-8">
      <div className="glass flex flex-col gap-4 rounded-[26px] px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 text-white shadow-neon">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-950 lg:text-2xl">{title}</h1>
            <p className="text-sm font-medium text-slate-500">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 md:flex">
            <CalendarDays size={17} />
            {now.toLocaleDateString("vi-VN")}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-2 font-mono text-sm font-black text-violet-700">
            <Clock3 size={17} />
            {now.toLocaleTimeString("vi-VN")}
          </div>
          <button className="relative grid h-11 w-11 place-items-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 transition duration-300 hover:-translate-y-0.5 hover:bg-rose-500 hover:text-white hover:shadow-card">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-3 py-2 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
              <ShieldCheck size={18} />
            </span>
            <div className="text-right">
              <p className="text-sm font-black text-slate-950">{user?.name || "Guest"}</p>
              <p className="text-xs font-bold capitalize text-slate-500">{user?.role || "offline"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
