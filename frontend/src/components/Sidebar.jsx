import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  Camera,
  ClipboardCheck,
  FileQuestion,
  GraduationCap,
  Home,
  Layers3,
  LogOut,
  ScanFace,
  Settings,
  Sparkles,
  UserRound,
  Users
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const adminItems = [
  ["Dashboard", "/admin/dashboard", Home, "from-sky-400 to-blue-600"],
  ["Đăng ký khuôn mặt", "/admin/face-enrollment", ScanFace, "from-violet-500 to-fuchsia-500"],
  ["Điểm danh AI", "/admin/attendance", Camera, "from-cyan-400 to-blue-600"],
  ["Học sinh", "/admin/students", Users, "from-emerald-400 to-teal-500"],
  ["Lớp học", "/admin/classes", Layers3, "from-amber-400 to-orange-500"],
  ["Điểm số", "/admin/grades", GraduationCap, "from-pink-500 to-rose-500"],
  ["Bài tập", "/admin/assignments", BookOpen, "from-lime-400 to-emerald-500"],
  ["Bài kiểm tra", "/admin/tests", FileQuestion, "from-indigo-500 to-violet-500"],
  ["Thống kê", "/admin/reports", BarChart3, "from-orange-400 to-yellow-400"],
  ["Thông báo", "/admin/notifications", Bell, "from-rose-400 to-pink-500"],
  ["Cài đặt", "/admin/settings", Settings, "from-slate-500 to-slate-700"]
];

const studentItems = [
  ["Trang chủ", "/student/dashboard", Home, "from-sky-400 to-blue-600"],
  ["Cá nhân", "/student/profile", UserRound, "from-violet-500 to-fuchsia-500"],
  ["Điểm của tôi", "/student/grades", GraduationCap, "from-pink-500 to-rose-500"],
  ["Lịch sử", "/student/attendance", ClipboardCheck, "from-emerald-400 to-teal-500"],
  ["Bài tập", "/student/assignments", BookOpen, "from-lime-400 to-emerald-500"],
  ["Bài kiểm tra", "/student/tests", FileQuestion, "from-indigo-500 to-violet-500"],
  ["Thông báo", "/student/notifications", Bell, "from-rose-400 to-pink-500"]
];

function SidebarItem({ item, compact = false }) {
  const [label, to, Icon, gradient] = item;

  return (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition duration-300 ${
          compact ? "min-w-[76px] flex-col gap-1 px-2 py-2 text-[11px]" : ""
        } ${
          isActive
            ? `bg-gradient-to-br ${gradient} text-white shadow-neon`
            : "text-slate-600 hover:-translate-y-0.5 hover:bg-white/80 hover:text-slate-950 hover:shadow-card"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`grid place-items-center rounded-2xl transition duration-300 ${
              compact ? "h-9 w-9" : "h-10 w-10"
            } ${
              isActive
                ? "bg-white/20 text-white"
                : `bg-gradient-to-br ${gradient} text-white shadow-sm group-hover:scale-110 group-hover:rotate-3`
            }`}
          >
            <Icon size={compact ? 16 : 18} />
          </span>
          <span className={compact ? "line-clamp-1 max-w-[68px]" : ""}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ role = "admin" }) {
  const items = role === "student" ? studentItems : adminItems;
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/70 bg-white/72 p-4 shadow-card backdrop-blur-2xl lg:flex">
        <div className="mb-6 shrink-0 overflow-hidden rounded-[26px] border border-white/80 bg-gradient-to-br from-white via-sky-50 to-fuchsia-50 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 text-white shadow-neon">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm font-black tracking-wide text-slate-950">SMART SCHOOL AI</p>
              <p className="text-xs font-semibold text-slate-500">EdTech Dashboard</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600">
            Quản lý học sinh, AI điểm danh và học tập thông minh.
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {items.map((item) => <SidebarItem key={item[1]} item={item} />)}
        </nav>

        <button
          className="mt-4 flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-3 text-sm font-bold text-rose-600 transition duration-300 hover:-translate-y-0.5 hover:bg-rose-500 hover:text-white hover:shadow-card"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex gap-2 overflow-x-auto rounded-[24px] border border-white/80 bg-white/85 p-2 shadow-card backdrop-blur-xl lg:hidden">
        {items.slice(0, 6).map((item) => <SidebarItem key={item[1]} item={item} compact />)}
        <button
          className="flex min-w-[76px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-rose-600"
          onClick={handleLogout}
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-100">
            <LogOut size={16} />
          </span>
          Thoát
        </button>
      </nav>
    </>
  );
}
