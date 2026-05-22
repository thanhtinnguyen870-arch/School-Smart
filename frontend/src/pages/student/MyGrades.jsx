import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import { useAuthStore } from "../../store/authStore";

const defaultSubjects = ["Toán", "Ngữ văn", "Vật Lý", "Hóa Học", "Tiếng Anh", "Sinh Học"];

export default function MyGrades() {
  const user = useAuthStore((state) => state.user);
  const [rows, setRows] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    if (user?.studentId) axiosClient.get(`/grades/student/${user.studentId}`).then(setRows);
  }, [user]);

  const subjectOptions = useMemo(() => {
    const savedSubjects = rows.map((row) => row.subject).filter(Boolean);
    return [...new Set([...defaultSubjects, ...savedSubjects])];
  }, [rows]);

  const selectedRows = useMemo(
    () => rows.filter((row) => row.subject === selectedSubject),
    [rows, selectedSubject],
  );

  const latestGrade = selectedRows[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Điểm của tôi</h1>
        <p className="mt-1 text-sm text-slate-400">Chọn từng môn học để xem điểm, không gom chung tất cả môn.</p>
      </div>

      <div className="card">
        <label className="grid max-w-md gap-2 text-sm font-semibold text-slate-300">
          Môn học
          <select className="input" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
            <option value="">Chọn môn để xem điểm</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedSubject ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card">
              <p className="text-sm text-slate-400">Môn học</p>
              <p className="mt-2 text-2xl font-black text-white">{selectedSubject}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-400">Điểm trung bình</p>
              <p className="mt-2 text-2xl font-black text-mint">{latestGrade?.averageScore ?? "-"}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-400">Số bảng điểm</p>
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
              { key: "averageScore", label: "TB" },
            ]}
          />
        </>
      ) : (
        <div className="card text-sm text-slate-400">
          Hãy chọn một môn học để xem điểm chi tiết.
        </div>
      )}
    </div>
  );
}
