import React, { useEffect, useMemo, useState } from "react";
import { Bell, BookOpen, CalendarCheck, GraduationCap } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import StatCard from "../../components/StatCard";
import { useAuthStore } from "../../store/authStore";

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState({ grades: [], attendance: [], assignments: [], notifications: [] });

  useEffect(() => {
    if (!user?.studentId) return;

    Promise.all([
      axiosClient.get(`/grades/student/${user.studentId}`),
      axiosClient.get(`/attendance/student/${user.studentId}`),
      axiosClient.get("/assignments"),
      axiosClient.get("/notifications"),
    ])
      .then(([grades, attendance, assignments, notifications]) => {
        setData({ grades, attendance, assignments, notifications });
      })
      .catch(() => {});
  }, [user]);

  const unreadNotifications = useMemo(
    () => data.notifications.filter((notification) => !notification.isRead),
    [data.notifications],
  );

  const avg = data.grades.length
    ? (data.grades.reduce((sum, grade) => sum + (grade.averageScore || 0), 0) / data.grades.length).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Dashboard cá nhân</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Điểm TB" value={avg} icon={GraduationCap} />
        <StatCard title="Buổi đi học" value={data.attendance.filter((item) => item.status === "present").length} icon={CalendarCheck} tone="mint" />
        <StatCard title="Bài tập" value={data.assignments.length} icon={BookOpen} tone="violet" />
        <StatCard title="Thông báo" value={unreadNotifications.length} icon={Bell} tone="amber" />
      </div>

      {unreadNotifications.length > 0 && (
        <div className="card">
          <h2 className="mb-3 font-bold">Thông báo mới</h2>
          {unreadNotifications.slice(0, 5).map((notification) => (
            <p key={notification._id} className="border-b border-slate-800 py-2 text-slate-300">
              {notification.title}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
