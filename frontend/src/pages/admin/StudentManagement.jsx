import React, { useEffect, useState } from "react";
import { Edit, Plus, Trash2, Upload } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const textFields = [
  { name: "studentCode", label: "Mã học sinh", required: true },
  { name: "fullName", label: "Họ và tên", required: true },
  { name: "email", label: "Email đăng nhập", type: "email", required: true },
  { name: "phone", label: "Số điện thoại" },
];

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () =>
    Promise.all([axiosClient.get("/students?limit=200"), axiosClient.get("/classes")]).then(([studentRows, classRows]) => {
      setStudents(studentRows.items || []);
      setClasses(classRows || []);
    });

  useEffect(() => {
    load();
  }, []);

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
          confirmButtonText: "Đã hiểu",
        });
      }

      closeModal();
      await load();
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
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      await axiosClient.delete(`/students/${row._id}`);
      toast.success("Đã xóa học sinh.");
      await load();
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Quản lý học sinh</h1>
          <p className="text-sm text-slate-400">Thêm học sinh với thông tin cơ bản và tài khoản đăng nhập.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Thêm học sinh
        </button>
      </div>

      <DataTable
        data={students}
        searchKey="fullName"
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
              <span className={`rounded-full px-2 py-1 text-xs ${row.userId ? "bg-mint/10 text-mint" : "bg-amber/10 text-amber"}`}>
                {row.userId ? "Đã tạo" : "Chưa có"}
              </span>
            ),
          },
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            <button className="text-cyan" title="Sửa học sinh" onClick={() => { setEditing(row); setOpen(true); }}>
              <Edit size={17} />
            </button>
            <label className="cursor-pointer text-violet" title="Tải ảnh khuôn mặt">
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
                  await load();
                }}
              />
            </label>
            <button className="text-rose" title="Xóa học sinh" onClick={() => remove(row)}>
              <Trash2 size={17} />
            </button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? "Sửa học sinh" : "Thêm học sinh"} onClose={closeModal}>
        <form key={editing?._id || "create-student"} onSubmit={save} className="grid gap-3 md:grid-cols-2">
          {!editing && (
            <div className="rounded-xl border border-cyan/30 bg-cyan/10 p-3 text-sm text-cyan md:col-span-2">
              Mật khẩu mặc định của tài khoản học sinh là 123456.
            </div>
          )}

          {textFields.map((field) => (
            <label key={field.name} className="grid gap-2 text-sm font-semibold text-slate-300">
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

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Giới tính
            <select name="gender" defaultValue={editing?.gender || ""} className="input" required>
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Lớp học
            <select name="classId" defaultValue={editing?.classId?._id || ""} className="input" required>
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
