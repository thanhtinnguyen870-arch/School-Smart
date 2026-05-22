import React from "react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, BookOpen, Camera, Clock3, GraduationCap, Layers3, Megaphone, Sparkles, Users } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import StatCard from "../../components/StatCard";

export default function AdminDashboard() {
  const [data, setData] = useState({ students: [], classes: [], attendance: [], stats: null, assignments: [], tests: [] });

  useEffect(() => {
    Promise.all([
      axiosClient.get("/students?limit=100"),
      axiosClient.get("/classes"),
      axiosClient.get("/attendance/today"),
      axiosClient.get("/attendance/statistics"),
      axiosClient.get("/assignments"),
      axiosClient.get("/tests")
    ]).then(([students, classes, attendance, stats, assignments, tests]) => setData({ students: students.items || [], classes, attendance, stats, assignments, tests })).catch(() => {});
  }, []);

  const weekly = ["T2", "T3", "T4", "T5", "T6", "T7"].map((day, i) => ({ day, present: 70 + i * 4, absent: Math.max(2, 10 - i) }));
  const pie = [
    { name: "Có mặt", value: data.stats?.summary?.present || 0, color: "#22C55E" },
    { name: "Nghỉ có phép", value: data.stats?.summary?.excused || 0, color: "#38BDF8" },
    { name: "Vắng", value: data.stats?.summary?.absent || 0, color: "#EC4899" }
  ];

  return (
    <div className="page-shell">
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-sky-400 via-blue-600 to-violet-700 p-6 text-white shadow-neon lg:p-8">
        <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-white/14" />
        <div className="absolute bottom-0 right-20 h-28 w-28 rounded-full bg-cyan-300/20 blur-sm" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 text-sm font-bold backdrop-blur">
              <Sparkles size={17} /> SMART SCHOOL AI
            </div>
            <h2 className="max-w-2xl text-3xl font-black leading-tight text-white lg:text-5xl">
              Dashboard giáo dục thông minh, sinh động và dễ vận hành.
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium text-white/82 lg:text-base">
              Theo dõi học sinh, lớp học, điểm danh AI, bài tập và kiểm tra trong một không gian quản trị sáng rõ.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["AI điểm danh", Camera, "bg-white/18"],
              ["Điểm số", GraduationCap, "bg-white/14"],
              ["Bài tập", BookOpen, "bg-white/14"],
              ["Thông báo", Megaphone, "bg-white/18"]
            ].map(([label, Icon, bg]) => (
              <div key={label} className={`rounded-[24px] ${bg} p-4 shadow-lg backdrop-blur`}>
                <Icon size={24} />
                <p className="mt-3 text-sm font-black text-white">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng học sinh" value={data.students.length} icon={Users} tone="cyan" subtitle="Hồ sơ đang quản lý" />
        <StatCard title="Tổng lớp" value={data.classes.length} icon={Layers3} tone="violet" subtitle="Lớp học đang mở" />
        <StatCard title="Có mặt hôm nay" value={data.stats?.summary?.present || 0} icon={Camera} tone="mint" subtitle="Điểm danh đã ghi nhận" />
        <StatCard title="Vắng hôm nay" value={data.stats?.summary?.absent || 0} icon={Clock3} tone="rose" subtitle="Cần theo dõi thêm" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="soft-panel p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Biểu đồ điểm danh tuần</h2>
              <p className="text-sm font-medium text-slate-500">Xu hướng có mặt và vắng trong tuần.</p>
            </div>
            <a href="/admin/attendance" className="btn-primary">
              <Camera size={18} /> Bắt đầu điểm danh
            </a>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                <XAxis dataKey="day" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, boxShadow: "0 18px 40px rgba(15,23,42,.12)" }} />
                <Area type="monotone" dataKey="present" name="Có mặt" stroke="#2563EB" strokeWidth={3} fill="url(#presentGradient)" />
                <Area type="monotone" dataKey="absent" name="Vắng" stroke="#EC4899" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="soft-panel p-5">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-950">Tỷ lệ hôm nay</h2>
            <p className="text-sm font-medium text-slate-500">Tổng quan trạng thái điểm danh.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={66} outerRadius={100} paddingAngle={5}>
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3">
            {pie.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold">
                <span className="flex items-center gap-2 text-slate-700"><i className="h-3 w-3 rounded-full" style={{ background: p.color }} />{p.name}</span>
                <span className="text-slate-950">{p.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Bài tập đã giao" value={data.assignments.length} icon={BookOpen} tone="violet" />
        <StatCard title="Bài kiểm tra mở" value={data.tests.filter((t) => t.status === "open").length} icon={GraduationCap} tone="cyan" />
        <div className="soft-panel p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Hoạt động gần đây</h2>
            <ArrowRight size={18} className="text-slate-400" />
          </div>
          {data.attendance.slice(0, 5).map((a) => (
            <p key={a._id} className="border-b border-slate-100 py-3 text-sm font-semibold text-slate-600 last:border-0">
              {a.studentId?.fullName} điểm danh <span className="badge badge-success ml-2">{a.status}</span>
            </p>
          ))}
          {!data.attendance.length && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Chưa có hoạt động điểm danh hôm nay.</p>}
        </div>
      </div>
    </div>
  );
}
