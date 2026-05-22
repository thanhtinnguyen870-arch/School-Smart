import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import { useAuthStore } from "../../store/authStore";

const subjects = ["Toán", "Ngữ Văn", "Vật Lý", "Hóa Học", "Tiếng Anh", "Sinh Học"];

export default function MyAssignments() {
  const user = useAuthStore((state) => state.user);
  const [rows, setRows] = useState([]);
  const [student, setStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    if (!user?.studentId) return;

    const load = async () => {
      const studentInfo = await axiosClient.get(`/students/${user.studentId}`);
      setStudent(studentInfo);
      const classId = studentInfo?.classId?._id || studentInfo?.classId;
      const assignments = await axiosClient.get(classId ? `/assignments?classId=${classId}` : "/assignments");
      setRows(assignments || []);
    };

    load();
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
        <h1 className="text-2xl font-black">Bài tập</h1>
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
            { key: "title", label: "Tiêu đề" },
            { key: "subject", label: "Môn" },
            { key: "deadline", label: "Hạn", render: (row) => row.deadline?.slice(0, 10) || "-" },
            { key: "status", label: "Trạng thái" }
          ]}
          actions={(row) => <Link to={`/student/assignments/${row._id}`} className="text-cyan">Mở</Link>}
        />
      ) : (
        <div className="soft-panel p-6 text-sm font-semibold text-slate-500">Chọn môn học để xem bài tập của lớp.</div>
      )}
    </div>
  );
}
