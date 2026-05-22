import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import { useAuthStore } from "../../store/authStore";

const subjects = ["Toán", "Ngữ Văn", "Vật Lý", "Hóa Học", "Tiếng Anh", "Sinh Học"];
const formatTime = (value) => value?.slice(0, 16).replace("T", " ") || "-";

export default function MyTests() {
  const user = useAuthStore((state) => state.user);
  const [rows, setRows] = useState([]);
  const [student, setStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    axiosClient.get("/tests/student/my-tests").then((data) => setRows(data || []));
  }, []);

  useEffect(() => {
    if (user?.studentId) axiosClient.get(`/students/${user.studentId}`).then(setStudent);
  }, [user?.studentId]);

  const subjectOptions = useMemo(() => {
    const savedSubjects = rows.map((row) => row.subject).filter(Boolean);
    return [...new Set([...subjects, ...savedSubjects])];
  }, [rows]);

  const filteredRows = useMemo(
    () => rows.filter((row) => !selectedSubject || row.subject === selectedSubject),
    [rows, selectedSubject]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black">Bài kiểm tra</h1>
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
        <DataTable
          data={filteredRows}
          searchKey="title"
          columns={[
            { key: "title", label: "Tên bài" },
            { key: "subject", label: "Môn học" },
            { key: "duration", label: "Phút" },
            { key: "endTime", label: "Kết thúc", render: (row) => formatTime(row.endTime) },
            {
              key: "status",
              label: "Trạng thái",
              render: (row) => row.submitted ? (row.canViewResult ? "Đã có điểm" : "Chờ điểm") : (row.isOpen ? "Đang mở" : "Đã đóng")
            }
          ]}
          actions={(row) => {
            if (row.submitted && row.canViewResult) return <Link className="text-mint" to={`/student/tests/${row._id}/result`}>Xem điểm</Link>;
            if (row.submitted) return <span className="text-slate-400">{formatTime(row.resultReleaseAt)}</span>;
            if (row.isOpen) return <Link className="text-cyan" to={`/student/tests/${row._id}`}>Làm bài</Link>;
            return <span className="text-slate-500">Hết hạn</span>;
          }}
        />
      ) : (
        <div className="soft-panel p-6 text-sm font-semibold text-slate-500">Chọn môn học để xem bài kiểm tra của lớp.</div>
      )}
    </div>
  );
}
