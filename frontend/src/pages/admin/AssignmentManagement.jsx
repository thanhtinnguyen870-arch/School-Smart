import React, { useEffect, useMemo, useState } from "react";
import { FileText, Image, Plus } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const subjects = ["Toán", "Ngữ Văn", "Vật Lý", "Hóa Học", "Tiếng Anh", "Sinh Học"];
const isImageFile = (row) => row.fileType?.startsWith("image/");

export default function AssignmentManagement() {
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [open, setOpen] = useState(false);

  const selectedClass = useMemo(() => classes.find((item) => item._id === selectedClassId), [classes, selectedClassId]);
  const canWork = Boolean(selectedClassId && selectedSubject);

  const load = async () => {
    const [assignmentRows, classRows] = await Promise.all([axiosClient.get("/assignments"), axiosClient.get("/classes")]);
    const nextClasses = classRows || [];
    setItems(assignmentRows || []);
    setClasses(nextClasses);
    setSelectedClassId((current) => current || nextClasses[0]?._id || "");
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (item.classId?._id || item.classId) === selectedClassId &&
          (!selectedSubject || item.subject === selectedSubject)
      ),
    [items, selectedClassId, selectedSubject]
  );

  const openCreateModal = () => {
    if (!selectedClassId) return toast.warning("Vui lòng chọn lớp trước.");
    if (!selectedSubject) return toast.warning("Vui lòng chọn môn học trước.");
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!canWork) return toast.warning("Vui lòng chọn lớp và môn học.");

    const formData = new FormData(event.currentTarget);
    formData.set("classId", selectedClassId);
    formData.set("subject", selectedSubject);

    try {
      await axiosClient.post("/assignments", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Đã giao bài tập.");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể tạo bài tập.");
    }
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black">Bài tập</h1>
        <button onClick={openCreateModal} className="btn-primary" disabled={!canWork}>
          <Plus size={18} /> Tạo bài tập
        </button>
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
            { key: "title", label: "Tiêu đề" },
            { key: "subject", label: "Môn học" },
            { key: "deadline", label: "Hạn nộp", render: (row) => row.deadline?.slice(0, 10) || "-" },
            {
              key: "file",
              label: "Đính kèm",
              render: (row) => row.fileUrl ? (
                <span className="inline-flex items-center gap-1 text-cyan">
                  {isImageFile(row) ? <Image size={15} /> : <FileText size={15} />}
                  {isImageFile(row) ? "Ảnh" : "Tệp"}
                </span>
              ) : "-"
            },
            { key: "status", label: "Trạng thái" }
          ]}
        />
      ) : (
        <div className="soft-panel p-6 text-sm font-semibold text-slate-500">Chọn lớp và môn học để xem hoặc tạo bài tập.</div>
      )}

      <Modal open={open} title="Tạo bài tập" onClose={() => setOpen(false)}>
        <form onSubmit={save} className="grid gap-3">
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">
            Lớp: {selectedClass?.className || "-"} · Môn: {selectedSubject || "-"}
          </div>
          <label className="grid gap-2 text-sm font-black text-slate-700">
            Tiêu đề
            <input name="title" className="input" placeholder="Tiêu đề bài tập" required />
          </label>
          <label className="grid gap-2 text-sm font-black text-slate-700">
            Nội dung
            <textarea name="description" className="input min-h-32" />
          </label>
          <label className="grid gap-2 text-sm font-black text-slate-700">
            Hạn nộp
            <input type="datetime-local" name="deadline" className="input" />
          </label>
          <label className="grid gap-2 text-sm font-black text-slate-700">
            Đính kèm
            <input type="file" name="file" className="input" accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx" />
          </label>
          <button className="btn-primary">Lưu bài tập</button>
        </form>
      </Modal>
    </div>
  );
}
