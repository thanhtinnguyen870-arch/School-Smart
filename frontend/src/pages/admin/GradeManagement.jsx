import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const subjects = ["Toán", "Ngữ Văn", "Vật Lý", "Hóa Học", "Tiếng Anh", "Sinh Học"];

const scoreFields = [
  { name: "oralScore", label: "Miệng" },
  { name: "fifteenMinuteScore", label: "15 phút" },
  { name: "onePeriodScore", label: "1 tiết" },
  { name: "midtermScore", label: "Giữa kỳ" },
  { name: "finalScore", label: "Cuối kỳ" }
];

export default function GradeManagement() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [open, setOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);

  const selectedClass = useMemo(() => classes.find((item) => item._id === selectedClassId), [classes, selectedClassId]);

  const load = async () => {
    const [gradeRows, studentRows, classRows] = await Promise.all([
      axiosClient.get("/grades"),
      axiosClient.get("/students?limit=200"),
      axiosClient.get("/classes")
    ]);
    const nextClasses = classRows || [];
    setGrades(gradeRows || []);
    setStudents(studentRows.items || []);
    setClasses(nextClasses);
    setSelectedClassId((current) => current || nextClasses[0]?._id || "");
  };

  useEffect(() => {
    load();
  }, []);

  const filteredGrades = useMemo(
    () => grades.filter((grade) => (grade.classId?._id || grade.classId) === selectedClassId),
    [grades, selectedClassId]
  );

  const filteredStudents = useMemo(
    () => students.filter((student) => (student.classId?._id || student.classId) === selectedClassId),
    [students, selectedClassId]
  );

  const openCreateModal = () => {
    if (!selectedClassId) return toast.warning("Vui lòng chọn lớp trước.");
    setEditingGrade(null);
    setSelectedSubject("");
    setOpen(true);
  };

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setSelectedClassId(grade.classId?._id || grade.classId || selectedClassId);
    setSelectedSubject(grade.subject || "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingGrade(null);
    setSelectedSubject("");
  };

  const save = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.classId = selectedClassId;

    if (!data.classId) return toast.warning("Vui lòng chọn lớp.");
    if (!data.subject) return toast.warning("Vui lòng chọn môn học.");
    if (!data.studentId) return toast.warning("Vui lòng chọn học sinh.");

    try {
      if (editingGrade) {
        await axiosClient.put(`/grades/${editingGrade._id}`, data);
        toast.success("Đã cập nhật điểm.");
      } else {
        await axiosClient.post("/grades", data);
        toast.success("Đã nhập điểm.");
      }
      closeModal();
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể lưu điểm.");
    }
  };

  const deleteGrade = async (grade) => {
    if (!window.confirm(`Xóa điểm môn ${grade.subject || ""}?`)) return;
    await axiosClient.delete(`/grades/${grade._id}`);
    toast.success("Đã xóa điểm.");
    await load();
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black">Quản lý điểm</h1>
        <button className="btn-primary" onClick={openCreateModal} disabled={!selectedClassId}>
          <Plus size={18} /> Nhập điểm
        </button>
      </div>

      <section className="soft-panel grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-black text-slate-700">
          Lớp học
          <select className="input" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
            <option value="">Chọn lớp</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>{classItem.className} - {classItem.classCode}</option>
            ))}
          </select>
        </label>
        <span className="badge badge-info">{selectedClass ? selectedClass.className : "Chưa chọn lớp"}</span>
      </section>

      <DataTable
        data={filteredGrades}
        searchKey="subject"
        columns={[
          { key: "student", label: "Học sinh", render: (row) => row.studentId?.fullName || "-" },
          { key: "subject", label: "Môn học" },
          { key: "oralScore", label: "Miệng" },
          { key: "fifteenMinuteScore", label: "15 phút" },
          { key: "onePeriodScore", label: "1 tiết" },
          { key: "midtermScore", label: "Giữa kỳ" },
          { key: "finalScore", label: "Cuối kỳ" },
          { key: "averageScore", label: "TB" }
        ]}
        actions={(row) => (
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-1 text-cyan" onClick={() => openEditModal(row)}>
              <Pencil size={15} /> Sửa
            </button>
            <button className="inline-flex items-center gap-1 text-rose" onClick={() => deleteGrade(row)}>
              <Trash2 size={15} /> Xóa
            </button>
          </div>
        )}
      />

      <Modal open={open} title={editingGrade ? "Sửa điểm" : "Nhập điểm"} onClose={closeModal}>
        <form key={editingGrade?._id || "create-grade"} onSubmit={save} className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 md:col-span-2">
            Lớp: {selectedClass?.className || "-"}
          </div>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Môn học
            <select name="subject" className="input" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} required>
              <option value="">Chọn môn</option>
              {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Học sinh
            <select name="studentId" className="input" defaultValue={editingGrade?.studentId?._id || ""} disabled={!selectedSubject} required>
              <option value="">Chọn học sinh</option>
              {filteredStudents.map((student) => (
                <option key={student._id} value={student._id}>{student.fullName} - {student.studentCode}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Học kỳ
            <input name="semester" className="input" placeholder="Học kỳ 1" defaultValue={editingGrade?.semester || ""} />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Năm học
            <input name="schoolYear" className="input" placeholder="2025-2026" defaultValue={editingGrade?.schoolYear || ""} />
          </label>

          {scoreFields.map((field) => (
            <label key={field.name} className="grid gap-2 text-sm font-black text-slate-700">
              {field.label}
              <input name={field.name} type="number" min="0" max="10" step="0.1" className="input" defaultValue={editingGrade?.[field.name] ?? ""} disabled={!selectedSubject} />
            </label>
          ))}

          <button className="btn-primary md:col-span-2">{editingGrade ? "Cập nhật điểm" : "Lưu điểm"}</button>
        </form>
      </Modal>
    </div>
  );
}
