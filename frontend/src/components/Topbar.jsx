import React, { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/face-enrollment": "Đăng ký khuôn mặt",
  "/admin/attendance": "Điểm danh AI",
  "/admin/students": "Học sinh",
  "/admin/classes": "Lớp học",
  "/admin/grades": "Điểm số",
  "/admin/assignments": "Bài tập",
  "/admin/tests": "Bài kiểm tra",
  "/admin/reports": "Thống kê",
  "/admin/notifications": "Thông báo",
  "/admin/settings": "Cài đặt",
  "/student/dashboard": "Trang chủ",
  "/student/profile": "Cá nhân",
  "/student/grades": "Điểm của tôi",
  "/student/attendance": "Lịch sử điểm danh",
  "/student/assignments": "Bài tập",
  "/student/tests": "Bài kiểm tra",
  "/student/notifications": "Thông báo"
};

export default function Topbar() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const title = useMemo(() => {
    const exact = pageTitles[location.pathname];
    if (exact) return exact;
    const key = Object.keys(pageTitles).find((path) => location.pathname.startsWith(path));
    return key ? pageTitles[key] : "SMART SCHOOL AI";
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 lg:px-8">
      <div className="glass flex flex-col gap-4 rounded-[26px] px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 text-white shadow-neon">
            <Sparkles size={22} />
          </div>
          <h1 className="text-xl font-black text-slate-950 lg:text-2xl">{title}</h1>
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
