import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";

const subjects = ["Toán", "Ngữ Văn", "Vật Lý", "Hóa Học", "Tiếng Anh", "Sinh Học"];

export default function TestManagement() {
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    Promise.all([axiosClient.get("/tests"), axiosClient.get("/classes")]).then(([testRows, classRows]) => {
      const nextClasses = classRows || [];
      setItems(testRows || []);
      setClasses(nextClasses);
      setSelectedClassId((current) => current || nextClasses[0]?._id || "");
    });
  }, []);

  const selectedClass = useMemo(() => classes.find((item) => item._id === selectedClassId), [classes, selectedClassId]);
  const canWork = Boolean(selectedClassId && selectedSubject);
  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (item.classId?._id || item.classId) === selectedClassId &&
          (!selectedSubject || item.subject === selectedSubject)
      ),
    [items, selectedClassId, selectedSubject]
  );

  const createHref = canWork
    ? `/admin/tests/create?classId=${selectedClassId}&subject=${encodeURIComponent(selectedSubject)}`
    : "#";

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black">Bài kiểm tra</h1>
        <Link to={createHref} className={`btn-primary ${!canWork ? "pointer-events-none opacity-60" : ""}`}>
          Tạo bài kiểm tra
        </Link>
      </div>

      <section className="soft-panel grid gap-4 p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-black text-slate-700">
          Lớp học
          <select
            className="input"
            value={selectedClassId}
            onChange={(event) => {
              setSelectedClassId(event.target.value);
              setSelectedSubject("");
            }}
          >
            <option value="">Chọn lớp</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.className} - {classItem.classCode}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black text-slate-700">
          Môn học
          <select className="input" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} disabled={!selectedClassId}>
            <option value="">Chọn môn</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>
        <span className="badge badge-info">{selectedClass ? selectedClass.className : "Chưa chọn lớp"}</span>
      </section>

      {canWork ? (
        <DataTable
          data={filteredItems}
          searchKey="title"
          columns={[
            { key: "title", label: "Tên" },
            { key: "subject", label: "Môn" },
            { key: "duration", label: "Phút" },
            { key: "status", label: "Trạng thái" }
          ]}
          actions={(row) => <Link className="text-cyan" to={`/admin/tests/${row._id}/results`}>Kết quả</Link>}
        />
      ) : (
        <div className="soft-panel p-6 text-sm font-semibold text-slate-500">Chọn lớp và môn học để xem hoặc tạo bài kiểm tra.</div>
      )}
    </div>
  );
}
