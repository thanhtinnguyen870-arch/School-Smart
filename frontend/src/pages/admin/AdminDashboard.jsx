import React from "react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpen, Camera, Clock3, GraduationCap, Layers3, Users } from "lucide-react";
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

  const weekly = ["T2", "T3", "T4", "T5", "T6", "T7"].map((day, i) => ({ day, present: 70 + i * 4, absent: 10 - i }));
  const pie = [
    { name: "Có mặt", value: data.stats?.summary?.present || 0, color: "#22C55E" },
    { name: "Nghỉ có phép", value: data.stats?.summary?.excused || 0, color: "#06B6D4" },
    { name: "Vắng", value: data.stats?.summary?.absent || 0, color: "#EF4444" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng học sinh" value={data.students.length} icon={Users} />
        <StatCard title="Tổng lớp" value={data.classes.length} icon={Layers3} tone="violet" />
        <StatCard title="Có mặt hôm nay" value={data.stats?.summary?.present || 0} icon={Camera} tone="mint" />
        <StatCard title="Vắng hôm nay" value={data.stats?.summary?.absent || 0} icon={Clock3} tone="amber" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="card">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-bold">Biểu đồ điểm danh tuần</h2><a href="/admin/attendance" className="btn-primary">Bắt đầu điểm danh</a></div>
          <div className="h-80"><ResponsiveContainer><AreaChart data={weekly}><defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06B6D4" stopOpacity={0.7}/><stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1f2937" /><XAxis dataKey="day" stroke="#94A3B8" /><YAxis stroke="#94A3B8" /><Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} /><Area dataKey="present" stroke="#06B6D4" fill="url(#c)" /><Area dataKey="absent" stroke="#EF4444" fill="transparent" /></AreaChart></ResponsiveContainer></div>
        </section>
        <section className="card">
          <h2 className="mb-5 font-bold">Tỷ lệ hôm nay</h2>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" innerRadius={64} outerRadius={96}>{pie.map((p) => <Cell key={p.name} fill={p.color} />)}</Pie><Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} /></PieChart></ResponsiveContainer></div>
          <div className="grid gap-3">{pie.map((p) => <div key={p.name} className="flex justify-between text-sm"><span style={{ color: p.color }}>{p.name}</span><span>{p.value}</span></div>)}</div>
        </section>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Bài tập đã giao" value={data.assignments.length} icon={BookOpen} tone="violet" />
        <StatCard title="Bài kiểm tra mở" value={data.tests.filter((t) => t.status === "open").length} icon={GraduationCap} tone="cyan" />
        <div className="card xl:col-span-2"><h2 className="mb-3 font-bold">Hoạt động gần đây</h2>{data.attendance.slice(0, 5).map((a) => <p key={a._id} className="border-b border-slate-800 py-2 text-sm text-slate-300">{a.studentId?.fullName} điểm danh {a.status}</p>)}</div>
      </div>
    </div>
  );
}
