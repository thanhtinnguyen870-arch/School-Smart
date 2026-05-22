import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Bell, BookOpen, Camera, ClipboardCheck, FileQuestion, GraduationCap, Home, Layers3, LogOut, ScanFace, Settings, UserRound, Users } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const adminItems = [
  ["Dashboard", "/admin/dashboard", Home],
  ["Đăng ký khuôn mặt", "/admin/face-enrollment", ScanFace],
  ["Điểm danh AI", "/admin/attendance", Camera],
  ["Học sinh", "/admin/students", Users],
  ["Lớp học", "/admin/classes", Layers3],
  ["Điểm số", "/admin/grades", GraduationCap],
  ["Bài tập", "/admin/assignments", BookOpen],
  ["Bài kiểm tra", "/admin/tests", FileQuestion],
  ["Thống kê", "/admin/reports", BarChart3],
  ["Thông báo", "/admin/notifications", Bell],
  ["Cài đặt", "/admin/settings", Settings],
];

const studentItems = [
  ["Trang chủ", "/student/dashboard", Home],
  ["Cá nhân", "/student/profile", UserRound],
  ["Điểm của tôi", "/student/grades", GraduationCap],
  ["Lịch sử", "/student/attendance", ClipboardCheck],
  ["Bài tập", "/student/assignments", BookOpen],
  ["Bài kiểm tra", "/student/tests", FileQuestion],
  ["Thông báo", "/student/notifications", Bell],
];

export default function Sidebar({ role = "admin" }) {
  const items = role === "student" ? studentItems : adminItems;
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 bg-sidebar/95 p-4 shadow-soft backdrop-blur-xl lg:flex">
      <div className="mb-7 shrink-0 rounded-lg border border-cyan/20 bg-white/[0.04] p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-blue-600 via-cyan to-emerald-500 shadow-neon">
            <Camera size={22} />
          </div>
          <div>
            <p className="text-sm font-black tracking-wide text-white">SMART SCHOOL AI</p>
            <p className="text-xs text-slate-400">Student management</p>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {items.map(([label, to, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-cyan/10 text-cyan ring-1 ring-cyan/20"
                  : "text-slate-400 hover:bg-white/[0.055] hover:text-slate-100"
              }`
            }
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-white/[0.04] text-current transition group-hover:bg-white/[0.07]">
              <Icon size={17} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        className="mt-4 flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-rose/60 hover:bg-rose/10 hover:text-rose"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        <LogOut size={18} /> Đăng xuất
      </button>
    </aside>
  );
}
