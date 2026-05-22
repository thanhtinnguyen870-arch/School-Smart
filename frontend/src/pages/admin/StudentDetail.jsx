import React from "react";
import { Link } from "react-router-dom";

export default function StudentDetail() {
  return (
    <div className="card">
      <h1 className="text-2xl font-black">Chi tiết học sinh</h1>
      <p className="mt-3 text-slate-400">Thông tin chi tiết được quản lý trực tiếp trong màn Quản lý học sinh.</p>
      <Link to="/admin/students" className="btn-primary mt-5">Quay lại danh sách</Link>
    </div>
  );
}
