import React, { useEffect, useMemo, useState } from "react";
import { Bell, BookOpen, CalendarCheck, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
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
      axiosClient.get("/notifications")
    ])
      .then(([grades, attendance, assignments, notifications]) => {
        setData({ grades, attendance, assignments, notifications });
      })
      .catch(() => {});
  }, [user]);

  const unreadNotifications = useMemo(
    () => data.notifications.filter((notification) => !notification.isRead),
    [data.notifications]
  );

  const avg = data.grades.length
    ? (data.grades.reduce((sum, grade) => sum + (grade.averageScore || 0), 0) / data.grades.length).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-950">Dashboard cá nhân</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Điểm TB" value={avg} icon={GraduationCap} />
        <StatCard title="Buổi đi học" value={data.attendance.filter((item) => item.status === "present").length} icon={CalendarCheck} tone="mint" />
        <StatCard title="Bài tập" value={data.assignments.length} icon={BookOpen} tone="violet" />
        <StatCard title="Thông báo" value={unreadNotifications.length} icon={Bell} tone="amber" />
      </div>

      {unreadNotifications.length > 0 && (
        <div className="card">
          <h2 className="mb-3 font-black text-slate-950">Thông báo mới</h2>
          <div className="divide-y divide-slate-100">
            {unreadNotifications.slice(0, 5).map((notification) => (
              <Link
                key={notification._id}
                to="/student/notifications"
                className="block py-3 font-bold text-slate-800 transition hover:text-ocean"
              >
                {notification.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
