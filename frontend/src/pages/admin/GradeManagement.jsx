import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const defaultSubjects = [
  "Toán",
  "Ngữ văn",
  "Vật Lý",
  "Hóa Học",
  "Tiếng Anh",
  "Sinh Học",
];

const scoreFields = [
  { name: "oralScore", label: "Điểm miệng" },
  { name: "fifteenMinuteScore", label: "Điểm 15 phút" },
  { name: "onePeriodScore", label: "Điểm 1 tiết" },
  { name: "midtermScore", label: "Điểm giữa kỳ" },
  { name: "finalScore", label: "Điểm cuối kỳ" },
];

export default function GradeManagement() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editingGrade, setEditingGrade] = useState(null);

  const load = () =>
    Promise.all([
      axiosClient.get("/grades"),
      axiosClient.get("/students?limit=200"),
      axiosClient.get("/classes"),
    ]).then(([gradeRows, studentRows, classRows]) => {
      setGrades(gradeRows || []);
      setStudents(studentRows.items || []);
      setClasses(classRows || []);
    });

  useEffect(() => {
    load();
  }, []);

  const subjectOptions = defaultSubjects;

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const classId = student.classId?._id || student.classId;
        return selectedClassId && classId === selectedClassId;
      }),
    [students, selectedClassId],
  );

  const openCreateModal = () => {
    setEditingGrade(null);
    setSelectedClassId("");
    setSelectedSubject("");
    setOpen(true);
  };

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setSelectedClassId(grade.classId?._id || "");
    setSelectedSubject(subjectOptions.includes(grade.subject) ? grade.subject : "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingGrade(null);
    setSelectedClassId("");
    setSelectedSubject("");
  };

  const handleClassChange = (event) => {
    setSelectedClassId(event.target.value);
    setSelectedSubject("");
  };

  const save = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    if (!data.classId) {
      toast.warning("Vui lòng chọn lớp trước.");
      return;
    }

    if (!data.subject) {
      toast.warning("Vui lòng chọn môn học.");
      return;
    }

    if (!data.studentId) {
      toast.warning("Vui lòng chọn học sinh.");
      return;
    }

    try {
      if (editingGrade) {
        await axiosClient.put(`/grades/${editingGrade._id}`, data);
        toast.success("Đã cập nhật điểm thành công.");
      } else {
        await axiosClient.post("/grades", data);
        toast.success("Đã nhập điểm thành công.");
      }

      closeModal();
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể lưu điểm");
    }
  };

  const deleteGrade = async (grade) => {
    const studentName = grade.studentId?.fullName || "học sinh này";
    const ok = window.confirm(`Xóa điểm môn ${grade.subject || ""} của ${studentName}?`);
    if (!ok) return;

    try {
      await axiosClient.delete(`/grades/${grade._id}`);
      toast.success("Đã xóa điểm.");
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể xóa điểm");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Quản lý điểm</h1>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Nhập điểm
        </button>
      </div>

      <DataTable
        data={grades}
        columns={[
          { key: "student", label: "Học sinh", render: (row) => row.studentId?.fullName || "Chưa có tên" },
          { key: "class", label: "Lớp", render: (row) => row.classId?.className || "-" },
          { key: "subject", label: "Môn học" },
          { key: "oralScore", label: "Miệng" },
          { key: "fifteenMinuteScore", label: "15 phút" },
          { key: "onePeriodScore", label: "1 tiết" },
          { key: "midtermScore", label: "Giữa kỳ" },
          { key: "finalScore", label: "Cuối kỳ" },
          { key: "averageScore", label: "TB" },
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
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Lớp học
            <select
              name="classId"
              className="input"
              value={selectedClassId}
              onChange={handleClassChange}
              required
            >
              <option value="">Chọn lớp học</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Môn học
            <select
              name="subject"
              className="input"
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              disabled={!selectedClassId}
              required
            >
              <option value="">{selectedClassId ? "Chọn môn học" : "Chọn lớp trước"}</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Học sinh
            <select
              name="studentId"
              className="input"
              disabled={!selectedClassId || !selectedSubject}
              defaultValue={editingGrade?.studentId?._id || ""}
              required
            >
              <option value="">{selectedSubject ? "Chọn học sinh" : "Chọn môn học trước"}</option>
              {filteredStudents.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullName} - {student.studentCode}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Học kỳ
            <input name="semester" className="input" placeholder="Ví dụ: Học kỳ 1" defaultValue={editingGrade?.semester || ""} />
          </label>

          {scoreFields.map((field) => (
            <label key={field.name} className="grid gap-2 text-sm font-semibold text-slate-300">
              {field.label}
              <input
                name={field.name}
                type="number"
                min="0"
                max="10"
                step="0.1"
                className="input"
                placeholder={field.label}
                defaultValue={editingGrade?.[field.name] ?? ""}
                disabled={!selectedSubject}
              />
            </label>
          ))}

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Năm học
            <input name="schoolYear" className="input" placeholder="Ví dụ: 2025-2026" defaultValue={editingGrade?.schoolYear || ""} />
          </label>

          <button className="btn-primary md:col-span-2">{editingGrade ? "Cập nhật điểm" : "Lưu điểm"}</button>
        </form>
      </Modal>
    </div>
  );
}
