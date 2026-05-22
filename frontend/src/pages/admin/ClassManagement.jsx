import React from "react";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";

export default function ClassManagement() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const load = () => axiosClient.get("/classes").then(setItems);
  useEffect(() => { load(); }, []);
  const save = async (e) => { e.preventDefault(); await axiosClient.post("/classes", Object.fromEntries(new FormData(e.currentTarget))); toast.success("Đã tạo lớp"); setOpen(false); load(); };
  return (
    <div className="space-y-5"><div className="flex justify-between"><h1 className="text-2xl font-black">Quản lý lớp học</h1><button className="btn-primary" onClick={() => setOpen(true)}><Plus size={18}/> Tạo lớp</button></div>
      <DataTable data={items} searchKey="className" columns={[{ key: "classCode", label: "Mã lớp" }, { key: "className", label: "Tên lớp" }, { key: "schoolYear", label: "Năm học" }, { key: "students", label: "Sĩ số", render: (r) => r.students?.length || 0 }, { key: "description", label: "Mô tả" }]} actions={(row) => <button className="text-rose" onClick={async () => { await axiosClient.delete(`/classes/${row._id}`); load(); }}><Trash2 size={17}/></button>} />
      <Modal open={open} title="Tạo lớp học" onClose={() => setOpen(false)}><form onSubmit={save} className="grid gap-3"><input name="classCode" className="input" placeholder="Mã lớp" required/><input name="className" className="input" placeholder="Tên lớp" required/><input name="schoolYear" className="input" placeholder="2025-2026"/><textarea name="description" className="input" placeholder="Mô tả"/><button className="btn-primary">Lưu</button></form></Modal>
    </div>
  );
}
