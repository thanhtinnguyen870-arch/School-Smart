import React, { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2, Upload, Users } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const textFields = [
  { name: "studentCode", label: "Mã học sinh", required: true },
  { name: "fullName", label: "Họ và tên", required: true },
  { name: "email", label: "Email đăng nhập", type: "email", required: true },
  { name: "phone", label: "Số điện thoại" }
];

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedClass = useMemo(
    () => classes.find((classItem) => classItem._id === selectedClassId),
    [classes, selectedClassId]
  );

  const loadClasses = async () => {
    const classRows = await axiosClient.get("/classes");
    const nextClasses = classRows || [];
    setClasses(nextClasses);
    setSelectedClassId((current) => current || nextClasses[0]?._id || "");
  };

  const loadStudents = async (classId = selectedClassId) => {
    if (!classId) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      const studentRows = await axiosClient.get(`/students?limit=200&classId=${classId}`);
      setStudents(studentRows.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadStudents(selectedClassId);
  }, [selectedClassId]);

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
  };

  const save = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      if (editing) {
        await axiosClient.put(`/students/${editing._id}`, data);
        toast.success("Đã cập nhật thông tin học sinh.");
      } else {
        const result = await axiosClient.post("/students", data);
        toast.success("Đã thêm học sinh và tạo tài khoản đăng nhập.");
        await Swal.fire({
          icon: "success",
          title: "Tài khoản học sinh đã được tạo",
          html: `
            <div style="text-align:left;line-height:1.8">
              <b>Học sinh:</b> ${result.student?.fullName || data.fullName}<br/>
              <b>Email đăng nhập:</b> ${result.account?.email || data.email}<br/>
              <b>Mật khẩu mặc định:</b> ${result.account?.password || "123456"}
            </div>
          `,
          confirmButtonText: "Đã hiểu"
        });
      }

      closeModal();
      await loadStudents(data.classId || selectedClassId);
      if (data.classId && data.classId !== selectedClassId) setSelectedClassId(data.classId);
    } catch (error) {
      toast.error(error.message || "Không thể lưu học sinh.");
    }
  };

  const remove = async (row) => {
    const result = await Swal.fire({
      title: "Xóa học sinh?",
      text: `${row.fullName}. Tài khoản đăng nhập của học sinh cũng sẽ bị xóa.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    });

    if (result.isConfirmed) {
      await axiosClient.delete(`/students/${row._id}`);
      toast.success("Đã xóa học sinh.");
      await loadStudents();
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setOpen(true);
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Quản lý học sinh</h1>
          <p className="text-sm font-semibold text-slate-500">Chọn lớp để xem, thêm, sửa hoặc xóa học sinh trong lớp đó.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal} disabled={!classes.length}>
          <Plus size={18} /> Thêm học sinh
        </button>
      </div>

      <section className="soft-panel grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-black text-slate-700">
          Lớp học
          <select className="input" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
            <option value="">Chọn lớp để xem học sinh</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.className} - {classItem.classCode}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-fuchsia-50 px-4 py-3 text-sm font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-ocean" />
            {selectedClass ? `${students.length} học sinh trong lớp ${selectedClass.className}` : "Chưa chọn lớp"}
          </div>
        </div>
      </section>

      <DataTable
        data={students}
        searchKey="fullName"
        searchPlaceholder={selectedClass ? `Tìm trong lớp ${selectedClass.className}...` : "Tìm kiếm học sinh..."}
        filters={
          selectedClass && (
            <span className="badge badge-info">
              {loading ? "Đang tải..." : `Đang xem: ${selectedClass.className}`}
            </span>
          )
        }
        columns={[
          { key: "studentCode", label: "Mã HS" },
          { key: "fullName", label: "Họ tên" },
          { key: "email", label: "Email đăng nhập", render: (row) => row.userId?.email || row.email || "-" },
          { key: "phone", label: "Số điện thoại", render: (row) => row.phone || "-" },
          { key: "gender", label: "Giới tính", render: (row) => row.gender || "-" },
          { key: "class", label: "Lớp", render: (row) => row.classId?.className || "-" },
          {
            key: "account",
            label: "Tài khoản",
            render: (row) => (
              <span className={`badge ${row.userId ? "badge-success" : "badge-warning"}`}>
                {row.userId ? "Đã tạo" : "Chưa có"}
              </span>
            )
          }
        ]}
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button className="rounded-xl bg-sky-50 p-2 text-ocean transition hover:bg-ocean hover:text-white" title="Sửa học sinh" onClick={() => { setEditing(row); setOpen(true); }}>
              <Edit size={17} />
            </button>
            <label className="cursor-pointer rounded-xl bg-violet-50 p-2 text-violet transition hover:bg-violet hover:text-white" title="Tải ảnh khuôn mặt">
              <Upload size={17} />
              <input
                type="file"
                multiple
                hidden
                onChange={async (event) => {
                  const files = [...event.target.files];
                  if (!files.length) return;
                  const formData = new FormData();
                  files.forEach((file) => formData.append("faces", file));
                  await axiosClient.post(`/students/${row._id}/upload-face`, formData);
                  toast.success("Đã tải ảnh khuôn mặt.");
                  await loadStudents();
                }}
              />
            </label>
            <button className="rounded-xl bg-rose-50 p-2 text-rose transition hover:bg-rose hover:text-white" title="Xóa học sinh" onClick={() => remove(row)}>
              <Trash2 size={17} />
            </button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? "Sửa học sinh" : "Thêm học sinh"} onClose={closeModal}>
        <form key={editing?._id || "create-student"} onSubmit={save} className="grid gap-3 md:grid-cols-2">
          {!editing && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-700 md:col-span-2">
              Mật khẩu mặc định của tài khoản học sinh là 123456.
            </div>
          )}

          {textFields.map((field) => (
            <label key={field.name} className="grid gap-2 text-sm font-black text-slate-700">
              {field.label}
              <input
                name={field.name}
                type={field.type || "text"}
                defaultValue={field.name === "email" ? editing?.userId?.email || editing?.email || "" : editing?.[field.name] || ""}
                className="input"
                placeholder={field.label}
                required={field.required}
              />
            </label>
          ))}

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Giới tính
            <select name="gender" defaultValue={editing?.gender || ""} className="input" required>
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Lớp học
            <select name="classId" defaultValue={editing?.classId?._id || selectedClassId || ""} className="input" required>
              <option value="">Chọn lớp học</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </label>

          <button className="btn-primary md:col-span-2">{editing ? "Cập nhật học sinh" : "Lưu học sinh"}</button>
        </form>
      </Modal>
    </div>
  );
}
