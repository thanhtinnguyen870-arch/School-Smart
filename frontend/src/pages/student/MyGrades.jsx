import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import { useAuthStore } from "../../store/authStore";

const subjects = ["Toán", "Ngữ Văn", "Vật Lý", "Hóa Học", "Tiếng Anh", "Sinh Học"];

export default function MyGrades() {
  const user = useAuthStore((state) => state.user);
  const [rows, setRows] = useState([]);
  const [student, setStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    if (!user?.studentId) return;
    axiosClient.get(`/grades/student/${user.studentId}`).then((data) => setRows(data || []));
    axiosClient.get(`/students/${user.studentId}`).then(setStudent);
  }, [user?.studentId]);

  const subjectOptions = useMemo(() => {
    const savedSubjects = rows.map((row) => row.subject).filter(Boolean);
    return [...new Set([...subjects, ...savedSubjects])];
  }, [rows]);

  const selectedRows = useMemo(
    () => rows.filter((row) => row.subject === selectedSubject),
    [rows, selectedSubject]
  );

  const latestGrade = selectedRows[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black">Điểm của tôi</h1>
        <span className="badge badge-info">{student?.classId?.className || "Lớp của tôi"}</span>
      </div>

      <section className="soft-panel p-4">
        <label className="grid max-w-md gap-2 text-sm font-black text-slate-700">
          Môn học
          <select className="input" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
            <option value="">Chọn môn</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </section>

      {selectedSubject ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card">
              <p className="text-sm font-bold text-slate-500">Môn học</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{selectedSubject}</p>
            </div>
            <div className="card">
              <p className="text-sm font-bold text-slate-500">Điểm trung bình</p>
              <p className="mt-2 text-2xl font-black text-mint">{latestGrade?.averageScore ?? "-"}</p>
            </div>
            <div className="card">
              <p className="text-sm font-bold text-slate-500">Số bảng điểm</p>
              <p className="mt-2 text-2xl font-black text-cyan">{selectedRows.length}</p>
            </div>
          </div>

          <DataTable
            data={selectedRows}
            columns={[
              { key: "semester", label: "Học kỳ", render: (row) => row.semester || "-" },
              { key: "schoolYear", label: "Năm học", render: (row) => row.schoolYear || "-" },
              { key: "oralScore", label: "Miệng" },
              { key: "fifteenMinuteScore", label: "15 phút" },
              { key: "onePeriodScore", label: "1 tiết" },
              { key: "midtermScore", label: "Giữa kỳ" },
              { key: "finalScore", label: "Cuối kỳ" },
              { key: "averageScore", label: "TB" }
            ]}
          />
        </>
      ) : (
        <div className="soft-panel p-6 text-sm font-semibold text-slate-500">Chọn môn học để xem điểm.</div>
      )}
    </div>
  );
}
