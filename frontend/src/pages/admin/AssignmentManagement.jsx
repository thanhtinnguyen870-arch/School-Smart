import React, { useEffect, useState } from "react";
import { FileText, Image, Plus } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const isImageFile = (row) => row.fileType?.startsWith("image/");

export default function AssignmentManagement() {
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () =>
    Promise.all([axiosClient.get("/assignments"), axiosClient.get("/classes")]).then(([assignmentRows, classRows]) => {
      setItems(assignmentRows || []);
      setClasses(classRows || []);
    });

  useEffect(() => {
    load();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      await axiosClient.post("/assignments", new FormData(event.currentTarget), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Đã giao bài tập.");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể tạo bài tập.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Bài tập</h1>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus size={18} /> Tạo bài tập
        </button>
      </div>

      <DataTable
        data={items}
        searchKey="title"
        columns={[
          { key: "title", label: "Tiêu đề" },
          { key: "subject", label: "Môn học" },
          { key: "class", label: "Lớp", render: (row) => row.classId?.className || "-" },
          { key: "deadline", label: "Hạn nộp", render: (row) => row.deadline?.slice(0, 10) || "-" },
          {
            key: "file",
            label: "Đính kèm",
            render: (row) => row.fileUrl ? (
              <span className="inline-flex items-center gap-1 text-cyan">
                {isImageFile(row) ? <Image size={15} /> : <FileText size={15} />}
                {isImageFile(row) ? "Ảnh" : "Tệp"}
              </span>
            ) : "-",
          },
          { key: "status", label: "Trạng thái" },
        ]}
      />

      <Modal open={open} title="Tạo bài tập" onClose={() => setOpen(false)}>
        <form onSubmit={save} className="grid gap-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Tiêu đề
            <input name="title" className="input" placeholder="Tiêu đề bài tập" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Môn học
            <input name="subject" className="input" placeholder="Ví dụ: Toán" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Lớp học
            <select name="classId" className="input">
              <option value="">Chọn lớp học</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Nội dung tự luận
            <textarea name="description" className="input min-h-32" placeholder="Nhập đề bài, yêu cầu tự luận hoặc hướng dẫn làm bài" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Hạn nộp
            <input type="datetime-local" name="deadline" className="input" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Ảnh bài tập / file đính kèm
            <input type="file" name="file" className="input" accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx" />
          </label>
          <button className="btn-primary">Lưu bài tập</button>
        </form>
      </Modal>
    </div>
  );
}
